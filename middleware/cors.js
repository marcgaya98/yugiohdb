/**
 * Configure CORS (Cross-Origin Resource Sharing) for the API
 */
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET'], // Since your API is read-only
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight response for 24 hours
};

export default corsOptions;