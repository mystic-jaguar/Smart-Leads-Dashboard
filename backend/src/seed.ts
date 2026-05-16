import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Lead from './models/Lead';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-leads';

const users = [
  { name: 'Admin User', email: 'admin@smartleads.com', password: 'admin123', role: 'admin' as const },
  { name: 'Sarah Johnson', email: 'sarah@smartleads.com', password: 'sales123', role: 'sales' as const },
  { name: 'Mike Chen', email: 'mike@smartleads.com', password: 'sales123', role: 'sales' as const },
];

const leadTemplates = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', status: 'Qualified' as const, source: 'Instagram' as const },
  { name: 'Priya Patel', email: 'priya.patel@outlook.com', status: 'New' as const, source: 'Website' as const },
  { name: 'James Wilson', email: 'james.wilson@company.com', status: 'Contacted' as const, source: 'Referral' as const },
  { name: 'Emily Davis', email: 'emily.davis@gmail.com', status: 'Lost' as const, source: 'Website' as const },
  { name: 'Carlos Rivera', email: 'carlos.r@business.com', status: 'New' as const, source: 'Instagram' as const },
  { name: 'Aisha Khan', email: 'aisha.khan@email.com', status: 'Qualified' as const, source: 'Referral' as const },
  { name: 'Tom Bradley', email: 'tom.bradley@corp.com', status: 'Contacted' as const, source: 'Website' as const },
  { name: 'Nina Rossi', email: 'nina.rossi@studio.it', status: 'New' as const, source: 'Instagram' as const },
  { name: 'David Park', email: 'david.park@tech.io', status: 'Qualified' as const, source: 'Website' as const },
  { name: 'Fatima Al-Hassan', email: 'fatima.h@ventures.ae', status: 'Contacted' as const, source: 'Referral' as const },
  { name: 'Lucas Müller', email: 'lucas.muller@startup.de', status: 'Lost' as const, source: 'Website' as const },
  { name: 'Yuki Tanaka', email: 'yuki.tanaka@design.jp', status: 'New' as const, source: 'Instagram' as const },
  { name: 'Sofia Andrade', email: 'sofia.andrade@agency.br', status: 'Qualified' as const, source: 'Referral' as const },
  { name: 'Omar Farooq', email: 'omar.farooq@solutions.pk', status: 'Contacted' as const, source: 'Website' as const },
  { name: 'Hannah Lee', email: 'hannah.lee@media.kr', status: 'New' as const, source: 'Instagram' as const },
  { name: 'Arjun Mehta', email: 'arjun.mehta@fintech.in', status: 'Qualified' as const, source: 'Website' as const },
  { name: 'Chloe Martin', email: 'chloe.martin@creative.fr', status: 'Lost' as const, source: 'Referral' as const },
  { name: 'Ethan Brooks', email: 'ethan.brooks@saas.us', status: 'Contacted' as const, source: 'Website' as const },
  { name: 'Zara Ahmed', email: 'zara.ahmed@retail.uk', status: 'New' as const, source: 'Instagram' as const },
  { name: 'Marco Bianchi', email: 'marco.bianchi@ecom.it', status: 'Qualified' as const, source: 'Referral' as const },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Create users (password hashing handled by model pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    const adminUser = createdUsers.find((u) => u.role === 'admin')!;
    const salesUsers = createdUsers.filter((u) => u.role === 'sales');

    // Distribute leads across users
    const leads = leadTemplates.map((lead, i) => ({
      ...lead,
      createdBy: i % 3 === 0 ? adminUser._id : salesUsers[i % 2]._id,
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000), // stagger dates
    }));

    await Lead.create(leads);
    console.log(`Created ${leads.length} leads`);

    console.log('\n--- Seed complete ---');
    console.log('Login credentials:');
    console.log('  Admin  → admin@smartleads.com  / admin123');
    console.log('  Sales  → sarah@smartleads.com  / sales123');
    console.log('  Sales  → mike@smartleads.com   / sales123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
