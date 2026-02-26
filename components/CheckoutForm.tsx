'use client'

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'

interface CheckoutFormProps {
  orderId: string
  totalAmount: string
  displayTotal?: string
}

export default function CheckoutForm({
  orderId,
  totalAmount,
  displayTotal
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?orderId=${orderId}`
      }
    })

    // This point is only reached if there is an immediate error.
    // Otherwise the user is redirected to return_url by Stripe.
    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message || 'Payment failed')
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <PaymentElement
        options={{
          layout: 'tabs'
        }}
      />

      {errorMessage && (
        <div className='rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700'>
          {errorMessage}
        </div>
      )}

      <button
        type='submit'
        disabled={!stripe || isProcessing}
        className='w-full rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {isProcessing ? (
          <span className='flex items-center justify-center gap-2'>
            <svg
              className='h-5 w-5 animate-spin'
              viewBox='0 0 24 24'
              fill='none'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${displayTotal || totalAmount}`
        )}
      </button>

      <p className='text-center text-xs text-gray-500'>
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}
