/**
 * Validates numeric ID parameters
 */
export const validateIdParam = (req, res, next) => {
    const id = req.params.id;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid ID parameter. Must be a number.'
        });
    }

    next();
};

/**
 * Validates query parameters for pagination
 */
export const validatePaginationParams = (req, res, next) => {
    const { limit, offset } = req.query;

    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid limit parameter. Must be a positive number.'
        });
    }

    if (offset && (isNaN(parseInt(offset)) || parseInt(offset) < 0)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid offset parameter. Must be a non-negative number.'
        });
    }

    next();
};