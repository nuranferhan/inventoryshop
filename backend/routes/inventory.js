const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const validator = require('../utils/validator');

// Performance optimization: In-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function for cache management
const getCacheKey = (path, query = '') => `${path}${query}`;
const setCache = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};
const getCache = (key) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

// GET /api/inventory - Get all items with optional search
router.get('/', (req, res) => {
    try {
        const { q, category, minPrice, maxPrice } = req.query;
        const cacheKey = getCacheKey('inventory', JSON.stringify(req.query));
        
        // Check cache first
        const cachedData = getCache(cacheKey);
        if (cachedData) {
            return res.json({
                success: true,
                data: cachedData,
                cached: true,
                total: cachedData.length
            });
        }

        let items = Item.getAll();

        // Apply filters
        if (q) {
            const query = q.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        }

        if (category) {
            items = items.filter(item => 
                item.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (minPrice) {
            items = items.filter(item => item.price >= parseFloat(minPrice));
        }

        if (maxPrice) {
            items = items.filter(item => item.price <= parseFloat(maxPrice));
        }

        // Cache the results
        setCache(cacheKey, items);

        res.json({
            success: true,
            data: items,
            total: items.length,
            filters: { q, category, minPrice, maxPrice }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve inventory',
            error: error.message
        });
    }
});

// GET /api/inventory/:id - Get single item
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        if (!validator.isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID format'
            });
        }

        const item = Item.getById(id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve item',
            error: error.message
        });
    }
});

// POST /api/inventory - Add new item
router.post('/', (req, res) => {
    try {
        const itemData = req.body;
        
        // Validate input
        const validation = validator.validateItemData(itemData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const newItem = Item.create(itemData);
        
        // Clear cache
        cache.clear();

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: newItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create item',
            error: error.message
        });
    }
});

// PUT /api/inventory/:id - Update item
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!validator.isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID format'
            });
        }

        const validation = validator.validateItemData(updateData, false);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const updatedItem = Item.update(id, updateData);
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Clear cache
        cache.clear();

        res.json({
            success: true,
            message: 'Item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update item',
            error: error.message
        });
    }
});

// DELETE /api/inventory/:id - Delete item
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        if (!validator.isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID format'
            });
        }

        const deleted = Item.delete(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Clear cache
        cache.clear();

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete item',
            error: error.message
        });
    }
});

module.exports = router;