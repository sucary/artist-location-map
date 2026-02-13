import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProfileStore } from '../models/profileStore';

export const checkUsernameAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
        res.status(400).json({ error: 'Username required' });
        return;
    }

    const available = await ProfileStore.checkUsernameAvailable(username);
    res.json({ available });
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await ProfileStore.getByUserId(userId);

    if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
    }

    res.json(profile);
});
