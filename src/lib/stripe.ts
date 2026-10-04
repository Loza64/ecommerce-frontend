import { loadStripe, type Stripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as
  string | undefined

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> | null {
  if (!publishableKey) {
    return null
  }
  stripePromise ??= loadStripe(publishableKey)
  return stripePromise
}
