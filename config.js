/**
 * Configuration loader for payment providers
 */
class Config {
  constructor() {
    this.config = {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
      },
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || '',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
        mode: process.env.PAYPAL_MODE || 'sandbox'
      },
      square: {
        accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
        locationId: process.env.SQUARE_LOCATION_ID || '',
        environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
      }
    };
  }

  getStripeConfig() {
    return this.config.stripe;
  }

  getPayPalConfig() {
    return this.config.paypal;
  }

  getSquareConfig() {
    return this.config.square;
  }

  setConfig(provider, config) {
    if (this.config[provider]) {
      this.config[provider] = { ...this.config[provider], ...config };
    }
  }
}

module.exports = new Config();
