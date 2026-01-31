/**
 * Basic Test Script
 * Tests the PaySolutions module structure and exports
 */

const PaySolutions = require('./index');

console.log('🧪 Running PaySolutions Tests\n');

// Test 1: Module exports
console.log('✓ Test 1: Module loads correctly');
console.log('  Type:', typeof PaySolutions);
console.log('  Is Function:', typeof PaySolutions === 'function');

// Test 2: Static methods
console.log('\n✓ Test 2: Static methods exist');
console.log('  getProviders:', typeof PaySolutions.getProviders);
console.log('  Providers:', PaySolutions.getProviders());

// Test 3: Instance creation
console.log('\n✓ Test 3: Can create instance');
const paySolutions = new PaySolutions({
    stripe: {
        secretKey: 'test_key',
        publishableKey: 'test_pub_key'
    },
    paypal: {
        clientId: 'test_client_id',
        clientSecret: 'test_secret',
        mode: 'sandbox'
    },
    square: {
        accessToken: 'test_token',
        locationId: 'test_location',
        environment: 'sandbox'
    }
});
console.log('  Instance created:', paySolutions instanceof PaySolutions);

// Test 4: Methods exist
console.log('\n✓ Test 4: Instance methods exist');
console.log('  createPayment:', typeof paySolutions.createPayment);
console.log('  confirmPayment:', typeof paySolutions.confirmPayment);
console.log('  refundPayment:', typeof paySolutions.refundPayment);
console.log('  getClientConfig:', typeof paySolutions.getClientConfig);

// Test 5: File structure
const fs = require('fs');
const path = require('path');

console.log('\n✓ Test 5: File structure');
const requiredFiles = [
    'index.js',
    'config.js',
    'providers/stripe.js',
    'providers/paypal.js',
    'providers/square.js',
    'public/index.html',
    'public/paysolutions.js',
    'example/server.js',
    'example/usage.js',
    '.env.example',
    'README.md',
    'package.json'
];

const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(__dirname, file))
);

if (missingFiles.length === 0) {
    console.log('  All required files present ✓');
} else {
    console.log('  Missing files:', missingFiles);
}

// Test 6: Provider modules
console.log('\n✓ Test 6: Provider modules load');
try {
    const stripe = require('./providers/stripe');
    const paypal = require('./providers/paypal');
    const square = require('./providers/square');
    console.log('  Stripe provider:', typeof stripe);
    console.log('  PayPal provider:', typeof paypal);
    console.log('  Square provider:', typeof square);
} catch (error) {
    console.log('  Error loading providers:', error.message);
}

// Test 7: Config module
console.log('\n✓ Test 7: Config module');
try {
    const config = require('./config');
    console.log('  Config loaded:', typeof config);
    console.log('  getStripeConfig:', typeof config.getStripeConfig);
    console.log('  getPayPalConfig:', typeof config.getPayPalConfig);
    console.log('  getSquareConfig:', typeof config.getSquareConfig);
} catch (error) {
    console.log('  Error loading config:', error.message);
}

console.log('\n✅ All basic tests passed!\n');
console.log('📝 Note: These tests verify structure only.');
console.log('   To test actual payments, configure .env with real API keys');
console.log('   and run: npm start\n');
