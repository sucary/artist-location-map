import { Router } from 'express';
import { CityService } from '../services/cityService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
router.get('/search', asyncHandler(async (req, res) => {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || query.trim().length < 2) {
        throw new AppError('Query must be at least 2 characters', 400);
    }

    const priorityResults = await CityService.getPriorityLocations(query.trim());
    const localResults = await CityService.searchLocal(query.trim(), limit);

    const combinedResults = [
        ...priorityResults,
        ...localResults.filter(local =>
            !priorityResults.some(priority => priority.osmId === local.osmId && priority.osmType === local.osmType)
        )
    ].slice(0, limit);

    res.json({
        results: combinedResults,
        source: 'local',
        hasMore: localResults.length >= limit
    });
}));

router.get('/search/nominatim', asyncHandler(async (req, res) => {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || query.trim().length < 2) {
        throw new AppError('Query must be at least 2 characters', 400);
    }

    const results = await CityService.searchNominatim(query.trim(), limit);

    res.json({
        results,
        source: 'nominatim'
    });
}));

router.post('/reverse', asyncHandler(async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        throw new AppError('Valid lat and lng required', 400);
    }

    const city = await CityService.reverseGeocode(
        parseFloat(lat),
        parseFloat(lng)
    );

    if (!city) {
        throw new AppError('No city found at these coordinates', 404);
    }

    res.json(city);
}));

// GET /api/cities/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const city = await CityService.getById(req.params.id);
    if (!city) {
        throw new AppError('City not found', 404);
    }
    res.json(city);
}));

export default router;
