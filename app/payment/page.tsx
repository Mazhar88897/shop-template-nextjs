'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import StripeProvider from '@/components/StripeProvider'
import CouponInput from '@/components/CouponInput'
import CheckoutForm from '@/components/CheckoutForm'

interface OrderData {
  orderId: string
  clientSecret: string
  totalAmount: string
  customerEmail: string
  customerFullName: string
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const clientSecret = searchParams.get('clientSecret')
  const orderId = searchParams.get('orderId')
  const totalAmount = searchParams.get('totalAmount')
  const customerEmail = searchParams.get('email')
  const customerFullName = searchParams.get('name')

  const hasError = !clientSecret || !orderId || !totalAmount
  const error = hasError
    ? 'Missing payment details. Please go back to checkout and try again.'
    : null
  const orderData = hasError
    ? null
    : {
        orderId,
        clientSecret,
        totalAmount,
        customerEmail: customerEmail || '',
        customerFullName: customerFullName || 'Customer'
      }

  const [currentTotal, setCurrentTotal] = useState(totalAmount || '0')
  const [discountAmount, setDiscountAmount] = useState<string | null>(null)

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
        <div className='w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
            <svg
              className='h-8 w-8 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='text-xl font-bold text-gray-900'>
            Invalid Payment Link
          </h1>
          <p className='mt-2 text-gray-600'>{error}</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='flex items-center gap-3 text-gray-500'>
          <svg className='h-6 w-6 animate-spin' viewBox='0 0 24 24' fill='none'>
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
          Loading payment details...
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900'>
            <svg
              className='h-7 w-7 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Complete Your Payment
          </h1>
          <p className='mt-1 text-gray-500'>
            {orderData.customerFullName} &middot; {orderData.customerEmail}
          </p>
        </div>

        {/* Order Summary */}
        <div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
          {discountAmount ? (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Subtotal</span>
                <span className='text-sm text-gray-500 line-through'>
                  ${orderData.totalAmount}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-green-600'>Discount</span>
                <span className='text-sm font-medium text-green-600'>
                  -${discountAmount}
                </span>
              </div>
              <div className='border-t border-gray-100 pt-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-600'>
                    Total
                  </span>
                  <span className='text-2xl font-bold text-gray-900'>
                    ${currentTotal}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-600'>
                Order Total
              </span>
              <span className='text-2xl font-bold text-gray-900'>
                ${orderData.totalAmount}
              </span>
            </div>
          )}
          <div className='mt-2 text-xs text-gray-400'>
            Order ID: {orderData.orderId}
          </div>
        </div>

        {/* Coupon */}
        <div className='mb-6'>
          <CouponInput
            orderId={orderData.orderId}
            onCouponApplied={(data) => {
              setCurrentTotal(data.totalAmount)
              setDiscountAmount(data.discountAmount)
            }}
            onCouponRemoved={(data) => {
              setCurrentTotal(data.totalAmount)
              setDiscountAmount(null)
            }}
          />
        </div>

        {/* Payment Form */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <StripeProvider clientSecret={orderData.clientSecret}>
            <CheckoutForm
              orderId={orderData.orderId}
              totalAmount={orderData.totalAmount}
              displayTotal={currentTotal}
            />
          </StripeProvider>
        </div>

        {/* Footer */}
        <div className='mt-6 flex items-center justify-center gap-2 text-xs text-gray-400'>
          <svg
            className='h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
          Secured by Stripe
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='flex items-center gap-3 text-gray-500'>
            <svg
              className='h-6 w-6 animate-spin'
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
            Loading...
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
