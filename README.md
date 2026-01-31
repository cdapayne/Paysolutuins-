# PaySolutions 💳

A plug-and-play Node.js payment solution that integrates with **Stripe**, **PayPal**, and **Square** APIs. Easily add payment processing to any website with minimal configuration.

## Features ✨

- 🔌 **Plug and Play** - Easy integration into any Node.js application
- 💳 **Multiple Payment Providers** - Support for Stripe, PayPal, and Square
- 🎨 **Pre-built UI** - Beautiful, responsive payment forms included
- 🔒 **Secure** - Best practices for handling payment data
- 🚀 **Simple API** - Unified interface for all payment providers
- ⚡ **Fast Setup** - Get started in minutes

## Installation 📦

```bash
npm install
```

## Quick Start 🚀

### 1. Configure Your API Keys

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Square
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_ENVIRONMENT=sandbox
```

### 2. Run the Example Server

```bash
npm start
```

Visit `http://localhost:3000` to see the payment forms in action!

## Usage 💻

### Basic Integration

```javascript
const PaySolutions = require('paysolutions');

// Initialize with your credentials
const paySolutions = new PaySolutions({
    stripe: {
        secretKey: 'sk_test_...',
        publishableKey: 'pk_test_...'
    },
    paypal: {
        clientId: 'your_client_id',
        clientSecret: 'your_client_secret',
        mode: 'sandbox'
    },
    square: {
        accessToken: 'your_access_token',
        locationId: 'your_location_id',
        environment: 'sandbox'
    }
});

// Create a payment
const result = await paySolutions.createPayment('stripe', 50.00, {
    currency: 'usd',
    metadata: { orderId: '12345' }
});

console.log(result);
// { success: true, clientSecret: 'pi_...', paymentId: 'pi_...', provider: 'stripe' }
```

### Express.js Integration

```javascript
const express = require('express');
const PaySolutions = require('paysolutions');

const app = express();
app.use(express.json());

const paySolutions = new PaySolutions();

app.post('/api/payment', async (req, res) => {
    const { provider, amount, currency } = req.body;
    
    const result = await paySolutions.createPayment(provider, amount, { currency });
    res.json(result);
});

app.listen(3000);
```

## API Reference 📚

### Create Payment

Create a new payment with any provider:

```javascript
await paySolutions.createPayment(provider, amount, options);
```

**Parameters:**
- `provider` (string): 'stripe', 'paypal', or 'square'
- `amount` (number): Payment amount
- `options` (object): Provider-specific options
  - `currency` (string): Currency code (default: 'usd' or 'USD')
  - `metadata` (object): Additional data (Stripe)
  - `description` (string): Payment description (PayPal)
  - `sourceId` (string): Payment token (Square - required)

**Returns:**
```javascript
{
    success: true,
    clientSecret: 'pi_...', // Stripe
    orderId: 'ORDER-123',    // PayPal
    paymentId: 'abc123',     // Square
    provider: 'stripe'
}
```

### Confirm Payment

Confirm or capture a payment:

```javascript
await paySolutions.confirmPayment(provider, paymentId);
```

### Refund Payment

Refund a payment (full or partial):

```javascript
await paySolutions.refundPayment(provider, paymentId, amount, options);
```

### Get Client Config

Get configuration for client-side payment forms:

```javascript
const config = paySolutions.getClientConfig('stripe');
// { publishableKey: 'pk_...', provider: 'stripe' }
```

## Payment Providers 🏦

### Stripe

- **Best for:** Credit/debit card payments
- **Setup:** Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Currencies:** 135+ currencies supported
- **Documentation:** [Stripe Docs](https://stripe.com/docs)

### PayPal

- **Best for:** PayPal account payments
- **Setup:** Create app in [PayPal Developer Portal](https://developer.paypal.com/)
- **Currencies:** 25+ currencies supported
- **Documentation:** [PayPal Docs](https://developer.paypal.com/docs/)

### Square

- **Best for:** In-person and online payments
- **Setup:** Get credentials from [Square Dashboard](https://developer.squareup.com/)
- **Currencies:** USD, CAD, GBP, AUD, JPY
- **Documentation:** [Square Docs](https://developer.squareup.com/docs)

## File Structure 📁

```
paysolutions/
├── index.js              # Main PaySolutions class
├── config.js             # Configuration management
├── providers/
│   ├── stripe.js         # Stripe integration
│   ├── paypal.js         # PayPal integration
│   └── square.js         # Square integration
├── public/
│   ├── index.html        # Payment form UI
│   └── paysolutions.js   # Client-side JavaScript
├── example/
│   └── server.js         # Example Express server
├── package.json
├── .env.example          # Environment template
└── README.md
```

## Security Best Practices 🔒

1. **Never expose secret keys** - Keep API keys in environment variables
2. **Use HTTPS** - Always serve payment forms over HTTPS in production
3. **Validate on server** - Always validate payment amounts on the server
4. **PCI Compliance** - Never store raw card data
5. **Use test keys** - Use sandbox/test credentials during development

## Customization 🎨

### Custom Styling

The payment form in `public/index.html` can be customized with your own CSS:

```html
<style>
    .payment-container {
        /* Your custom styles */
    }
</style>
```

### Custom Backend Logic

Extend the example server in `example/server.js` with your business logic:

```javascript
app.post('/api/payment', async (req, res) => {
    // Your custom validation
    // Database operations
    // Email notifications
    
    const result = await paySolutions.createPayment(...);
    res.json(result);
});
```

## Testing 🧪

Use test credentials from each provider:

**Stripe Test Cards:**
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 0002` - Declined

**PayPal:**
- Use sandbox accounts from PayPal Developer Portal

**Square:**
- Use sandbox environment with test card numbers

## Troubleshooting 🔧

### "Provider credentials not configured"

Make sure your `.env` file exists and contains valid API keys.

### "CORS errors"

If using a separate frontend, configure CORS in your Express server:

```javascript
const cors = require('cors');
app.use(cors());
```

### "Module not found"

Install dependencies:

```bash
npm install
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

ISC

## Support 💬

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for easy payment integration