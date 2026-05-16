import { Router } from 'express';
import { getUsers, deleteUser, updateUserRole } from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/', getUsers);
router.delete('/:id', deleteUser);
router.patch('/:id/role', updateUserRole);

export default router;
