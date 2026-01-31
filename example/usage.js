/**
 * Simple Usage Example
 * This file demonstrates basic usage of PaySolutions without Express
 */

require('dotenv').config();
const PaySolutions = require('../index');

async function example() {
    // Initialize PaySolutions
    const paySolutions = new PaySolutions();

    console.log('🚀 PaySolutions Example\n');
    console.log('Available providers:', PaySolutions.getProviders());
    console.log('');

    // Example 1: Stripe Payment
    try {
        console.log('📝 Creating Stripe payment intent...');
        const stripeResult = await paySolutions.createPayment('stripe', 25.00, {
            currency: 'usd',
            metadata: { orderId: '12345', customer: 'test@example.com' }
        });
        
        if (stripeResult.success) {
            console.log('✅ Stripe payment intent created!');
            console.log('   Payment ID:', stripeResult.paymentId);
            console.log('   Client Secret:', stripeResult.clientSecret.substring(0, 20) + '...');
        } else {
            console.log('❌ Stripe payment failed:', stripeResult.error);
        }
    } catch (error) {
        console.log('❌ Stripe error:', error.message);
    }
    console.log('');

    // Example 2: PayPal Order
    try {
        console.log('📝 Creating PayPal order...');
        const paypalResult = await paySolutions.createPayment('paypal', 50.00, {
            currency: 'USD',
            description: 'Product Purchase'
        });
        
        if (paypalResult.success) {
            console.log('✅ PayPal order created!');
            console.log('   Order ID:', paypalResult.orderId);
            console.log('   Status:', paypalResult.status);
        } else {
            console.log('❌ PayPal order failed:', paypalResult.error);
        }
    } catch (error) {
        console.log('❌ PayPal error:', error.message);
    }
    console.log('');

    // Example 3: Get Client Configuration
    try {
        console.log('🔑 Getting client configurations...');
        
        const stripeConfig = paySolutions.getClientConfig('stripe');
        console.log('   Stripe Publishable Key:', stripeConfig.publishableKey.substring(0, 15) + '...');
        
        const paypalConfig = paySolutions.getClientConfig('paypal');
        console.log('   PayPal Client ID:', paypalConfig.clientId.substring(0, 15) + '...');
        
        const squareConfig = paySolutions.getClientConfig('square');
        console.log('   Square Location ID:', squareConfig.locationId || 'Not configured');
    } catch (error) {
        console.log('❌ Config error:', error.message);
    }
    console.log('');

    console.log('💡 Tip: Check the example/server.js for a full Express integration example!');
}

// Run the example
example().catch(console.error);
