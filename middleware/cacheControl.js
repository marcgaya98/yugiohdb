/**
 * Middleware to set cache headers for API responses
 * @param {number} maxAge - Max age in seconds
 */
const cacheControl = (maxAge = 3600) => (req, res, next) => {
    // Only cache GET requests
    if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${maxAge}`);
    } else {
        // For non-GET requests, set no-cache
        res.set('Cache-Control', 'no-store');
    }
    next();
};

export default cacheControl;