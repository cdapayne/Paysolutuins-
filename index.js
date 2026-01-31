/**
 * PaySolutions - A plug-and-play payment solution
 * Supports Stripe, PayPal, and Square payment providers
 */

const config = require('./config');
const stripeProvider = require('./providers/stripe');
const paypalProvider = require('./providers/paypal');
const squareProvider = require('./providers/square');

class PaySolutions {
  constructor(options = {}) {
    // Allow configuration override
    if (options.stripe) {
      config.setConfig('stripe', options.stripe);
    }
    if (options.paypal) {
      config.setConfig('paypal', options.paypal);
    }
    if (options.square) {
      config.setConfig('square', options.square);
    }
  }

  /**
   * Create a payment with the specified provider
   * @param {string} provider - 'stripe', 'paypal', or 'square'
   * @param {number} amount - Payment amount
   * @param {object} options - Provider-specific options
   */
  async createPayment(provider, amount, options = {}) {
    try {
      switch (provider.toLowerCase()) {
        case 'stripe':
          return await stripeProvider.createPaymentIntent(
            amount,
            options.currency || 'usd',
            options.metadata || {}
          );

        case 'paypal':
          return await paypalProvider.createOrder(
            amount,
            options.currency || 'USD',
            options.description || 'Payment'
          );

        case 'square':
          if (!options.sourceId) {
            throw new Error('Square payment requires sourceId (nonce from payment form)');
          }
          return await squareProvider.createPayment(
            options.sourceId,
            amount,
            options.currency || 'USD',
            options.idempotencyKey
          );

        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider
      };
    }
  }

  /**
   * Confirm or capture a payment
   * @param {string} provider - 'stripe', 'paypal', or 'square'
   * @param {string} paymentId - Payment/Order/Transaction ID
   */
  async confirmPayment(provider, paymentId) {
    try {
      switch (provider.toLowerCase()) {
        case 'stripe':
          return await stripeProvider.confirmPayment(paymentId);

        case 'paypal':
          return await paypalProvider.captureOrder(paymentId);

        case 'square':
          return await squareProvider.getPayment(paymentId);

        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider
      };
    }
  }

  /**
   * Refund a payment
   * @param {string} provider - 'stripe', 'paypal', or 'square'
   * @param {string} paymentId - Payment/Capture/Transaction ID
   * @param {number} amount - Optional partial refund amount
   * @param {object} options - Provider-specific options
   */
  async refundPayment(provider, paymentId, amount = null, options = {}) {
    try {
      switch (provider.toLowerCase()) {
        case 'stripe':
          return await stripeProvider.refundPayment(paymentId, amount);

        case 'paypal':
          return await paypalProvider.refundCapture(
            paymentId,
            amount,
            options.currency || 'USD'
          );

        case 'square':
          if (!amount) {
            throw new Error('Square refund requires an amount');
          }
          return await squareProvider.refundPayment(
            paymentId,
            amount,
            options.currency || 'USD',
            options.idempotencyKey
          );

        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider
      };
    }
  }

  /**
   * Get client-side configuration for payment forms
   * @param {string} provider - 'stripe', 'paypal', or 'square'
   */
  getClientConfig(provider) {
    switch (provider.toLowerCase()) {
      case 'stripe':
        return {
          publishableKey: stripeProvider.getPublishableKey(),
          provider: 'stripe'
        };

      case 'paypal':
        return {
          clientId: paypalProvider.getClientId(),
          provider: 'paypal'
        };

      case 'square':
        return {
          locationId: squareProvider.getLocationId(),
          provider: 'square'
        };

      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  /**
   * Get available providers
   */
  static getProviders() {
    return ['stripe', 'paypal', 'square'];
  }
}

module.exports = PaySolutions;
