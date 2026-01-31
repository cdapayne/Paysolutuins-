/**
 * PaySolutions Client-Side JavaScript
 * Handles payment form interactions for Stripe, PayPal, and Square
 */

// Configuration - Replace with your actual keys
const CONFIG = {
    stripe: {
        publishableKey: 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY'
    },
    paypal: {
        clientId: 'YOUR_PAYPAL_CLIENT_ID'
    },
    square: {
        applicationId: 'YOUR_SQUARE_APPLICATION_ID',
        locationId: 'YOUR_SQUARE_LOCATION_ID'
    },
    apiEndpoint: '/api/payment' // Your backend API endpoint
};

// Tab switching
document.querySelectorAll('.payment-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding payment method
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('active');
        });
        document.getElementById(`${targetTab}-payment`).classList.add('active');
    });
});

// Message display helper
function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// ==================== STRIPE INTEGRATION ====================
let stripe, cardElement;

if (CONFIG.stripe.publishableKey && CONFIG.stripe.publishableKey !== 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY') {
    stripe = Stripe(CONFIG.stripe.publishableKey);
    const elements = stripe.elements();
    cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }
    });
    cardElement.mount('#card-element');
}

document.getElementById('stripe-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!stripe || !cardElement) {
        showMessage('Stripe is not properly configured. Please set your publishable key.', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('stripe-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    
    try {
        const amount = parseFloat(document.getElementById('stripe-amount').value);
        
        // Create payment intent on your server
        const response = await fetch(CONFIG.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider: 'stripe',
                amount: amount,
                currency: 'usd'
            })
        });
        
        const { clientSecret } = await response.json();
        
        // Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement
            }
        });
        
        if (error) {
            showMessage(error.message, 'error');
        } else if (paymentIntent.status === 'succeeded') {
            showMessage('Payment successful! Transaction ID: ' + paymentIntent.id, 'success');
            document.getElementById('stripe-form').reset();
        }
    } catch (error) {
        showMessage('Payment failed: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pay with Stripe';
    }
});

// ==================== PAYPAL INTEGRATION ====================
if (typeof paypal !== 'undefined' && CONFIG.paypal.clientId !== 'YOUR_PAYPAL_CLIENT_ID') {
    paypal.Buttons({
        createOrder: async () => {
            const amount = document.getElementById('paypal-amount').value;
            
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'paypal',
                    amount: parseFloat(amount),
                    currency: 'USD'
                })
            });
            
            const data = await response.json();
            return data.orderId;
        },
        onApprove: async (data) => {
            const response = await fetch(`${CONFIG.apiEndpoint}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'paypal',
                    orderId: data.orderID
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('PayPal payment successful! Order ID: ' + data.orderID, 'success');
            } else {
                showMessage('Payment failed', 'error');
            }
        },
        onError: (err) => {
            showMessage('PayPal error: ' + err, 'error');
        }
    }).render('#paypal-button-container');
}

// ==================== SQUARE INTEGRATION ====================
let squareCard;

async function initializeSquare() {
    if (!window.Square) {
        console.error('Square.js failed to load');
        return;
    }
    
    if (CONFIG.square.applicationId === 'YOUR_SQUARE_APPLICATION_ID') {
        return;
    }
    
    try {
        const payments = window.Square.payments(CONFIG.square.applicationId, CONFIG.square.locationId);
        squareCard = await payments.card();
        await squareCard.attach('#square-card');
    } catch (error) {
        console.error('Failed to initialize Square:', error);
    }
}

if (typeof Square !== 'undefined') {
    initializeSquare();
}

document.getElementById('square-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!squareCard) {
        showMessage('Square is not properly configured. Please set your application ID and location ID.', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('square-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    
    try {
        const amount = parseFloat(document.getElementById('square-amount').value);
        
        // Tokenize the card
        const result = await squareCard.tokenize();
        
        if (result.status === 'OK') {
            // Send payment to your server
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'square',
                    amount: amount,
                    sourceId: result.token,
                    currency: 'USD'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Square payment successful! Payment ID: ' + data.paymentId, 'success');
                document.getElementById('square-form').reset();
                // Reinitialize card form
                await initializeSquare();
            } else {
                showMessage('Payment failed: ' + (data.error || 'Unknown error'), 'error');
            }
        } else {
            showMessage('Card tokenization failed', 'error');
        }
    } catch (error) {
        showMessage('Payment failed: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pay with Square';
    }
});
