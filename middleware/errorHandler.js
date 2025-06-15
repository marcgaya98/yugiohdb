/**
 * Global error handling middleware
 * Captures all errors thrown in route handlers and formats them consistently
 */
export const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route not found: ${req.originalUrl}`
    });
};