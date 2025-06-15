/**
 * Middleware to log all incoming requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log when request comes in
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Once request is processed
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });

    next();
};

export default requestLogger;