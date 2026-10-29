import Stripe from 'stripe'

// Test-mode secret key (sk_test_...) from the environment. Never sent to the browser.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
