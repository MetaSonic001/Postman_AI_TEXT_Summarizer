require('dotenv').config(); // Load .env file variables

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const summarizeText = require('./summarize');

const app = express();
const port = process.env.PORT || 3000;

// Security and performance middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.static('./public', { 
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/summarize', limiter);

// Input validation middleware
const summarizeValidation = [
    body('text_to_summarize')
        .trim()
        .isLength({ min: 200, max: 100000 })
        .withMessage('Text must be between 200 and 100,000 characters')
];

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
    });
});

// Handle POST requests to the '/summarize' endpoint
app.post('/summarize', summarizeValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { text_to_summarize } = req.body;

    try {
        const summary = await summarizeText(text_to_summarize);
        res.json({ summary });
    } catch (error) {
        console.error("Summarization Error:", error);
        res.status(500).json({ 
            error: 'Failed to summarize text', 
            details: error.message 
        });
    }
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = app;