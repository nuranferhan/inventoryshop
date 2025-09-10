class Validator {
    static isValidId(id) {
        return id && typeof id === 'string' && id.trim().length > 0;
    }

    static validateItemData(data, requireAll = true) {
        const errors = [];
        const result = { isValid: true, errors: [] };

        // Required fields validation
        if (requireAll || data.name !== undefined) {
            if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
                errors.push('Name is required and must be a non-empty string');
            } else if (data.name.length > 100) {
                errors.push('Name must not exceed 100 characters');
            }
        }

        if (requireAll || data.category !== undefined) {
            if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
                errors.push('Category is required and must be a non-empty string');
            }
        }

        if (requireAll || data.price !== undefined) {
            const price = parseFloat(data.price);
            if (isNaN(price) || price < 0) {
                errors.push('Price must be a valid positive number');
            } else if (price > 999999) {
                errors.push('Price must not exceed 999,999');
            }
        }

        if (requireAll || data.quantity !== undefined) {
            const quantity = parseInt(data.quantity);
            if (isNaN(quantity) || quantity < 0) {
                errors.push('Quantity must be a valid non-negative integer');
            } else if (quantity > 999999) {
                errors.push('Quantity must not exceed 999,999');
            }
        }

        // Optional fields validation
        if (data.description !== undefined) {
            if (typeof data.description !== 'string') {
                errors.push('Description must be a string');
            } else if (data.description.length > 500) {
                errors.push('Description must not exceed 500 characters');
            }
        }

        if (data.sku !== undefined) {
            if (typeof data.sku !== 'string') {
                errors.push('SKU must be a string');
            } else if (data.sku.length > 50) {
                errors.push('SKU must not exceed 50 characters');
            } else if (!/^[A-Za-z0-9_-]+$/.test(data.sku)) {
                errors.push('SKU can only contain letters, numbers, underscores, and hyphens');
            }
        }

        result.isValid = errors.length === 0;
        result.errors = errors;

        return result;
    }

    static sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        // Remove potential XSS attempts and trim whitespace
        return str
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    static validateSearchQuery(query) {
        if (!query) return { isValid: true, cleaned: '' };
        
        if (typeof query !== 'string') {
            return { isValid: false, error: 'Search query must be a string' };
        }

        if (query.length > 100) {
            return { isValid: false, error: 'Search query too long' };
        }

        const cleaned = this.sanitizeString(query);
        return { isValid: true, cleaned };
    }
}

module.exports = Validator;