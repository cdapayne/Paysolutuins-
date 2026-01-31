/**
 * Example Express Server using PaySolutions
 * This demonstrates how to integrate PaySolutions into your application
 */

const express = require('express');
const path = require('path');
const PaySolutions = require('../index');

// Load environment variables (optional)
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize PaySolutions with your credentials
const paySolutions = new PaySolutions({
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE || 'sandbox'
    },
    square: {
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        locationId: process.env.SQUARE_LOCATION_ID,
        environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
    }
});

// API endpoint to get client configuration
app.get('/api/config/:provider', (req, res) => {
    try {
        const config = paySolutions.getClientConfig(req.params.provider);
        res.json(config);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// API endpoint to create a payment
app.post('/api/payment', async (req, res) => {
    try {
        const { provider, amount, currency, ...options } = req.body;
        
        if (!provider || !amount) {
            return res.status(400).json({ 
                error: 'Provider and amount are required' 
            });
        }

        const result = await paySolutions.createPayment(
            provider, 
            amount, 
            { currency, ...options }
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API endpoint to confirm a payment
app.post('/api/payment/confirm', async (req, res) => {
    try {
        const { provider, orderId, paymentId } = req.body;
        const id = orderId || paymentId;

        if (!provider || !id) {
            return res.status(400).json({ 
                error: 'Provider and payment ID are required' 
            });
        }

        const result = await paySolutions.confirmPayment(provider, id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API endpoint to refund a payment
app.post('/api/payment/refund', async (req, res) => {
    try {
        const { provider, paymentId, amount, ...options } = req.body;

        if (!provider || !paymentId) {
            return res.status(400).json({ 
                error: 'Provider and payment ID are required' 
            });
        }

        const result = await paySolutions.refundPayment(
            provider, 
            paymentId, 
            amount,
            options
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        providers: PaySolutions.getProviders() 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 PaySolutions Example Server`);
    console.log(`📍 Server running at http://localhost:${PORT}`);
    console.log(`💳 Payment providers available: ${PaySolutions.getProviders().join(', ')}`);
    console.log(`\n📝 Don't forget to configure your API keys in .env file\n`);
});

module.exports = app;
