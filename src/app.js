const express = require('express');
const cors = require('cors');
// const morgan = require('morgan');
const portfolioRoutes = require('./routes/portfolio');
// const sellRoutes = require('./routes/sellRouter');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
// app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// 根路径处理
app.get('/', (req, res) => {
    res.json({
        message: '投资管理系统API',
        endpoints: {
            '卖出API': 'POST /api/sell/product/:productId/sell/:userId',
            '示例': 'POST /api/sell/product/1/sell/1'
        },
        usage: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { amount: 50 }
        }
    });
});

// Routes
app.use('/api', portfolioRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Server configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;