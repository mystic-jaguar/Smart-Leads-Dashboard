import { Response, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import Lead from '../models/Lead';
import { AuthRequest, ILead, LeadFilterQuery } from '../types';
import { createError } from '../middleware/errorHandler';

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      source,
      search,
      sort = 'latest',
      since,
    } = req.query as LeadFilterQuery;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: FilterQuery<ILead> = {};

    // Sales users only see their own leads
    if (req.user?.role === 'sales') {
      filter.createdBy = req.user.id;
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (since) filter.createdAt = { $gte: new Date(since) };

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: 'Leads fetched successfully',
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email');
    if (!lead) return next(createError('Lead not found', 404));

    // Sales users can only view their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      return next(createError('Not authorized to view this lead', 403));
    }

    res.status(200).json({
      success: true,
      message: 'Lead fetched successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, status, source } = req.body;

    const lead = await Lead.create({
      name,
      email,
      status,
      source,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(createError('Lead not found', 404));

    // Sales users can only update their own leads
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      return next(createError('Not authorized to update this lead', 403));
    }

    const { name, email, status, source } = req.body;
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, status, source },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(createError('Lead not found', 404));

    // Only admin can delete any lead; sales can only delete their own
    if (
      req.user?.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      return next(createError('Not authorized to delete this lead', 403));
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, source, search, sort = 'latest', since } = req.query as LeadFilterQuery;

    const filter: FilterQuery<ILead> = {};
    if (req.user?.role === 'sales') filter.createdBy = req.user.id;
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (since) filter.createdAt = { $gte: new Date(since) };
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;
    const leads = await Lead.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: sortOrder });

    const headers = ['Name', 'Email', 'Status', 'Source', 'Created By', 'Created At'];
    const rows = leads.map((lead) => {
      const creator = lead.createdBy as unknown as { name: string };
      return [
        `"${lead.name}"`,
        `"${lead.email}"`,
        lead.status,
        lead.source,
        `"${creator?.name || ''}"`,
        new Date(lead.createdAt).toISOString(),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
