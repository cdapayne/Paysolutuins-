/**
 * Stripe Payment Provider
 */
const config = require('../config');

class StripeProvider {
  constructor() {
    this.stripe = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    
    const stripeConfig = config.getStripeConfig();
    if (!stripeConfig.secretKey) {
      throw new Error('Stripe secret key is not configured');
    }

    const Stripe = require('stripe');
    this.stripe = Stripe(stripeConfig.secretKey);
    this.initialized = true;
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    this.initialize();

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id,
      provider: 'stripe'
    };
  }

  async confirmPayment(paymentIntentId) {
    this.initialize();

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      paymentId: paymentIntent.id,
      provider: 'stripe'
    };
  }

  async refundPayment(paymentIntentId, amount = null) {
    this.initialize();

    const refundData = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await this.stripe.refunds.create(refundData);

    return {
      success: refund.status === 'succeeded',
      refundId: refund.id,
      provider: 'stripe'
    };
  }

  getPublishableKey() {
    return config.getStripeConfig().publishableKey;
  }
}

module.exports = new StripeProvider();
