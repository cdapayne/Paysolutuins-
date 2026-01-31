#!/usr/bin/env node

/**
 * PaySolutions CLI Helper
 * Quick setup and testing tool
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    console.log('\n🚀 Welcome to PaySolutions Setup!\n');
    console.log('This tool will help you configure your payment providers.\n');

    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');

    if (fs.existsSync(envPath)) {
        const overwrite = await question('.env file already exists. Overwrite? (y/n): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('\nSetup cancelled. Edit .env manually if needed.\n');
            rl.close();
            return;
        }
    }

    console.log('\nLet\'s configure your payment providers.');
    console.log('You can skip any provider by pressing Enter.\n');

    // Stripe configuration
    console.log('--- Stripe Configuration ---');
    const stripeSecret = await question('Stripe Secret Key (sk_test_...): ');
    const stripePublic = await question('Stripe Publishable Key (pk_test_...): ');

    // PayPal configuration
    console.log('\n--- PayPal Configuration ---');
    const paypalClientId = await question('PayPal Client ID: ');
    const paypalSecret = await question('PayPal Client Secret: ');
    const paypalMode = await question('PayPal Mode (sandbox/production) [sandbox]: ') || 'sandbox';

    // Square configuration
    console.log('\n--- Square Configuration ---');
    const squareToken = await question('Square Access Token: ');
    const squareLocation = await question('Square Location ID: ');
    const squareEnv = await question('Square Environment (sandbox/production) [sandbox]: ') || 'sandbox';

    // Write .env file
    const envContent = `# Stripe Configuration
STRIPE_SECRET_KEY=${stripeSecret}
STRIPE_PUBLISHABLE_KEY=${stripePublic}

# PayPal Configuration
PAYPAL_CLIENT_ID=${paypalClientId}
PAYPAL_CLIENT_SECRET=${paypalSecret}
PAYPAL_MODE=${paypalMode}

# Square Configuration
SQUARE_ACCESS_TOKEN=${squareToken}
SQUARE_LOCATION_ID=${squareLocation}
SQUARE_ENVIRONMENT=${squareEnv}
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to .env file!\n');

    // Update public/paysolutions.js if needed
    if (stripePublic) {
        console.log('📝 Updating client-side configuration...');
        const publicJsPath = path.join(__dirname, 'public', 'paysolutions.js');
        if (fs.existsSync(publicJsPath)) {
            let content = fs.readFileSync(publicJsPath, 'utf8');
            content = content.replace(
                /publishableKey: 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY'/,
                `publishableKey: '${stripePublic}'`
            );
            if (paypalClientId) {
                content = content.replace(
                    /clientId: 'YOUR_PAYPAL_CLIENT_ID'/,
                    `clientId: '${paypalClientId}'`
                );
            }
            fs.writeFileSync(publicJsPath, content);
            console.log('✅ Client-side configuration updated!\n');
        }
    }

    console.log('🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm start');
    console.log('  2. Visit: http://localhost:3000');
    console.log('  3. Test payments with your configured providers\n');

    rl.close();
}

async function test() {
    console.log('\n🧪 Testing PaySolutions...\n');
    
    // Check if dependencies are installed
    try {
        require('./index');
        console.log('✅ Module loads successfully');
    } catch (error) {
        console.log('❌ Error loading module:', error.message);
        console.log('   Run: npm install\n');
        rl.close();
        return;
    }

    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.log('⚠️  No .env file found');
        console.log('   Run: node setup.js\n');
    } else {
        console.log('✅ .env file exists');
    }

    // Run basic tests
    console.log('\n📋 Running basic tests...\n');
    try {
        require('child_process').execSync('node test.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('❌ Tests failed');
    }

    rl.close();
}

async function info() {
    console.log('\n📚 PaySolutions Information\n');
    
    const PaySolutions = require('./index');
    console.log('Available providers:', PaySolutions.getProviders().join(', '));
    
    const packageJson = require('./package.json');
    console.log('Version:', packageJson.version);
    console.log('Description:', packageJson.description);
    
    console.log('\nQuick commands:');
    console.log('  npm start       - Start example server');
    console.log('  node setup.js   - Run configuration wizard');
    console.log('  node test.js    - Run basic tests');
    
    console.log('\nDocumentation:');
    console.log('  README.md       - Full documentation');
    console.log('  INTEGRATION.md  - Integration guide');
    console.log('  .env.example    - Configuration template');
    
    console.log('\nExample files:');
    console.log('  example/server.js - Express server example');
    console.log('  example/usage.js  - Basic usage example');
    console.log('  public/index.html - Payment form UI\n');
    
    rl.close();
}

// Main CLI
const command = process.argv[2];

switch (command) {
    case 'setup':
        setup().catch(console.error);
        break;
    case 'test':
        test().catch(console.error);
        break;
    case 'info':
        info().catch(console.error);
        break;
    default:
        console.log('\n💳 PaySolutions CLI\n');
        console.log('Usage:');
        console.log('  node setup.js setup  - Configure payment providers');
        console.log('  node setup.js test   - Test installation');
        console.log('  node setup.js info   - Show information\n');
        rl.close();
}
