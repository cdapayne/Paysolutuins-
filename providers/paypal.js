/**
 * PayPal Payment Provider
 */
const config = require('../config');

class PayPalProvider {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    const paypalConfig = config.getPayPalConfig();
    if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
      throw new Error('PayPal credentials are not configured');
    }

    const paypal = require('@paypal/checkout-server-sdk');
    
    let environment;
    if (paypalConfig.mode === 'production') {
      environment = new paypal.core.LiveEnvironment(
        paypalConfig.clientId,
        paypalConfig.clientSecret
      );
    } else {
      environment = new paypal.core.SandboxEnvironment(
        paypalConfig.clientId,
        paypalConfig.clientSecret
      );
    }

    this.client = new paypal.core.PayPalHttpClient(environment);
    this.initialized = true;
  }

  async createOrder(amount, currency = 'USD', description = 'Payment') {
    this.initialize();

    const paypal = require('@paypal/checkout-server-sdk');
    const request = new paypal.orders.OrdersCreateRequest();
    
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description
      }]
    });

    const response = await this.client.execute(request);

    return {
      success: true,
      orderId: response.result.id,
      provider: 'paypal',
      status: response.result.status
    };
  }

  async captureOrder(orderId) {
    this.initialize();

    const paypal = require('@paypal/checkout-server-sdk');
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await this.client.execute(request);

    return {
      success: response.result.status === 'COMPLETED',
      captureId: response.result.purchase_units[0].payments.captures[0].id,
      orderId: response.result.id,
      provider: 'paypal',
      status: response.result.status
    };
  }

  async refundCapture(captureId, amount = null, currency = 'USD') {
    this.initialize();

    const paypal = require('@paypal/checkout-server-sdk');
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    
    if (amount) {
      request.requestBody({
        amount: {
          value: amount.toFixed(2),
          currency_code: currency
        }
      });
    } else {
      request.requestBody({});
    }

    const response = await this.client.execute(request);

    return {
      success: response.result.status === 'COMPLETED',
      refundId: response.result.id,
      provider: 'paypal'
    };
  }

  getClientId() {
    return config.getPayPalConfig().clientId;
  }
}

module.exports = new PayPalProvider();
