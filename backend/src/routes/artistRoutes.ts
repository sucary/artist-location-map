import { Router } from 'express';
import {
    getAllArtists,
    getArtistsByUsername,
    getArtistById,
    createArtist,
    updateArtist,
    deleteArtist,
    getArtistCountByCity,
    getArtistCountByUsername
} from '../controllers/artistController';
import { requireAuth, requireApproval, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllArtists);
router.get('/stats/by-city', optionalAuth, getArtistCountByCity);

// Admin routes
router.get('/u/:username', requireAuth, getArtistsByUsername);
router.get('/u/:username/stats/by-city', requireAuth, getArtistCountByUsername);

// Protected route - requires auth to view individual artist
router.get('/:id', requireAuth, getArtistById);

// Protected routes - require approval for mutations
router.post('/', requireAuth, requireApproval, createArtist);
router.put('/:id', requireAuth, requireApproval, updateArtist);
router.delete('/:id', requireAuth, requireApproval, deleteArtist);

export default router;