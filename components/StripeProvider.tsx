'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ReactNode } from 'react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface StripeProviderProps {
  clientSecret: string
  children: ReactNode
}

export default function StripeProvider({
  clientSecret,
  children
}: StripeProviderProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0f172a',
            colorBackground: '#ffffff',
            colorText: '#1e293b',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px'
          },
          rules: {
            '.Input': {
              border: '1px solid #e2e8f0',
              boxShadow: 'none',
              padding: '12px'
            },
            '.Input:focus': {
              border: '1px solid #0f172a',
              boxShadow: '0 0 0 1px #0f172a'
            },
            '.Label': {
              fontWeight: '500',
              fontSize: '14px',
              marginBottom: '6px'
            }
          }
        }
      }}
    >
      {children}
    </Elements>
  )
}
