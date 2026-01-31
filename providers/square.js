/**
 * Square Payment Provider
 */
const config = require('../config');

// Helper function to generate UUID
function generateUUID() {
  if (require('crypto').randomUUID) {
    return require('crypto').randomUUID();
  }
  // Fallback to uuid package if crypto.randomUUID is not available
  return require('uuid').v4();
}

class SquareProvider {
  constructor() {
    this.client = null;
    this.paymentsApi = null;
    this.refundsApi = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    const squareConfig = config.getSquareConfig();
    if (!squareConfig.accessToken) {
      throw new Error('Square access token is not configured');
    }

    const { Client, Environment } = require('square');

    const environment = squareConfig.environment === 'production' 
      ? Environment.Production 
      : Environment.Sandbox;

    this.client = new Client({
      accessToken: squareConfig.accessToken,
      environment
    });

    this.paymentsApi = this.client.paymentsApi;
    this.refundsApi = this.client.refundsApi;
    this.initialized = true;
  }

  async createPayment(sourceId, amount, currency = 'USD', idempotencyKey = null) {
    this.initialize();

    const squareConfig = config.getSquareConfig();

    const body = {
      sourceId,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency
      },
      locationId: squareConfig.locationId,
      idempotencyKey: idempotencyKey || generateUUID()
    };

    const response = await this.paymentsApi.createPayment(body);

    return {
      success: response.result.payment.status === 'COMPLETED',
      paymentId: response.result.payment.id,
      provider: 'square',
      status: response.result.payment.status
    };
  }

  async getPayment(paymentId) {
    this.initialize();

    const response = await this.paymentsApi.getPayment(paymentId);

    return {
      success: true,
      payment: response.result.payment,
      provider: 'square'
    };
  }

  async refundPayment(paymentId, amount, currency = 'USD', idempotencyKey = null) {
    this.initialize();

    const body = {
      paymentId,
      amountMoney: {
        amount: Math.round(amount * 100),
        currency
      },
      idempotencyKey: idempotencyKey || generateUUID()
    };

    const response = await this.refundsApi.refundPayment(body);

    return {
      success: response.result.refund.status === 'COMPLETED',
      refundId: response.result.refund.id,
      provider: 'square'
    };
  }

  getLocationId() {
    return config.getSquareConfig().locationId;
  }
}

module.exports = new SquareProvider();
