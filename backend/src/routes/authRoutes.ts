import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import {
    checkUsernameAvailability,
    getProfile,
} from '../controllers/authController';

const router = Router();

// Public routes
router.get('/check-username', checkUsernameAvailability);

// Protected routes
router.get('/profile', requireAuth, getProfile);

export default router;
