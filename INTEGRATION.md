# PaySolutions Integration Guide

This guide shows you how to integrate PaySolutions into your existing website or application.

## Quick Integration (3 Steps)

### Step 1: Install PaySolutions

Copy the PaySolutions files into your project:

```bash
# Option A: Clone this repository
git clone https://github.com/cdapayne/Paysolutuins-.git
cd Paysolutuins-
npm install

# Option B: Copy files directly
# Copy the following into your project:
# - index.js
# - config.js
# - providers/
# - public/ (optional, for UI)
```

### Step 2: Configure API Keys

Create a `.env` file with your payment provider credentials:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox
```

### Step 3: Use in Your Application

```javascript
// In your Node.js server
require('dotenv').config();
const PaySolutions = require('./index'); // or require('paysolutions') if published

const paySolutions = new PaySolutions();

// Create a payment endpoint
app.post('/create-payment', async (req, res) => {
    const { provider, amount } = req.body;
    const result = await paySolutions.createPayment(provider, amount);
    res.json(result);
});
```

## Integration Examples

### Example 1: Basic Express Server

```javascript
const express = require('express');
const PaySolutions = require('./index');

const app = express();
app.use(express.json());

const paySolutions = new PaySolutions();

app.post('/api/payment', async (req, res) => {
    try {
        const result = await paySolutions.createPayment(
            req.body.provider,
            req.body.amount,
            { currency: req.body.currency || 'usd' }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

### Example 2: With Existing Website

Add to your existing HTML:

```html
<!-- Add payment form -->
<div id="payment-container"></div>

<!-- Load PaySolutions UI -->
<script src="/public/paysolutions.js"></script>
```

Or create custom UI using the providers:

```html
<!-- Stripe -->
<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('your_publishable_key');
    // Your custom payment flow
</script>
```

### Example 3: React/Vue/Angular Integration

```javascript
// payment.service.js
class PaymentService {
    async createPayment(provider, amount, currency = 'usd') {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, amount, currency })
        });
        return response.json();
    }
}

export default new PaymentService();
```

## Provider-Specific Setup

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create an account
3. Get your API keys from Dashboard → Developers → API keys
4. Use test keys (starting with `pk_test_` and `sk_test_`) for development

### PayPal Setup

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Go to Dashboard → My Apps & Credentials
4. Create a new app
5. Copy Client ID and Secret
6. Use Sandbox credentials for testing

### Square Setup

1. Go to [Square Developer Portal](https://developer.squareup.com/)
2. Create a Square account
3. Create a new application
4. Get your Access Token and Location ID
5. Use Sandbox environment for testing

## Testing Your Integration

### Test with Curl

```bash
# Test Stripe payment
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{"provider":"stripe","amount":10.00,"currency":"usd"}'

# Test PayPal payment
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{"provider":"paypal","amount":25.00,"currency":"USD"}'
```

### Test with Browser

1. Start your server: `npm start`
2. Visit `http://localhost:3000`
3. Try each payment method with test credentials

### Test Cards

**Stripe:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVC

**Square:**
- Success: `4111 1111 1111 1111`
- Decline: `4000 0000 0000 0002`

**PayPal:**
- Use PayPal sandbox test accounts

## Production Deployment

### Before Going Live:

1. ✅ Switch to production API keys
2. ✅ Enable HTTPS on your domain
3. ✅ Set `PAYPAL_MODE=production`
4. ✅ Set `SQUARE_ENVIRONMENT=production`
5. ✅ Remove all test/debug code
6. ✅ Implement proper error handling
7. ✅ Add logging for transactions
8. ✅ Set up webhooks for payment confirmations
9. ✅ Test thoroughly with real payment methods
10. ✅ Review each provider's compliance requirements

### Environment Variables for Production

```env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYPAL_MODE=production
SQUARE_ENVIRONMENT=production
```

## Security Checklist

- [ ] Never expose secret keys in client-side code
- [ ] Always use HTTPS in production
- [ ] Validate payment amounts on the server
- [ ] Implement rate limiting on payment endpoints
- [ ] Add CSRF protection
- [ ] Log all payment attempts
- [ ] Set up monitoring and alerts
- [ ] Follow PCI compliance guidelines
- [ ] Use environment variables for all secrets
- [ ] Regularly update dependencies

## Troubleshooting

### Common Issues

**"Module not found"**
- Run `npm install` to install dependencies

**"Invalid API key"**
- Check your `.env` file has correct keys
- Make sure you're using the right environment (test/production)

**"Payment failed"**
- Check provider dashboard for detailed error messages
- Verify your account is activated
- Check that test mode is properly configured

**CORS errors**
- Add CORS middleware if frontend is on different domain
- Configure allowed origins properly

### Getting Help

- Check provider documentation
- Review example files in `example/` folder
- Open an issue on GitHub
- Check server logs for detailed error messages

## Next Steps

1. Customize the payment forms in `public/index.html`
2. Add webhooks for payment status updates
3. Implement order management
4. Add email notifications
5. Create admin dashboard for payment tracking
6. Add support for subscriptions
7. Implement refund handling UI

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Documentation](https://developer.paypal.com/docs/)
- [Square Documentation](https://developer.squareup.com/docs)
- [PCI Compliance Guide](https://www.pcisecuritystandards.org/)

---

Need more help? Check the [README.md](README.md) for full API documentation.
