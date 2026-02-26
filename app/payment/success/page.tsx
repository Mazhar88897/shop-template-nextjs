'use client'

import { redirect, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'

interface OrderStatus {
  id: string
  paymentStatus: string
  orderStatus: string
  totalAmount: string
  customerEmail: string
  customerFullName: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const redirectStatus = searchParams.get('redirect_status')
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [shouldRedirectToFailed, setShouldRedirectToFailed] = useState(false)

  useEffect(() => {
    // If Stripe says the redirect_status is not succeeded, go to failure page
    if (redirectStatus && redirectStatus !== 'succeeded') {
      setShouldRedirectToFailed(true)
      return
    }

    if (!orderId) {
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/orders/${orderId}/status`
        )
        const json = await res.json()
        if (json.success) {
          setOrder(json.data)

          // If payment failed based on webhook update, redirect
          if (json.data.paymentStatus === 'failed') {
            setShouldRedirectToFailed(true)
          }
        }
      } catch (err) {
        console.error('Failed to fetch order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, redirectStatus])

  useEffect(() => {
    if (shouldRedirectToFailed) {
      redirect(`/payment/failed?orderId=${orderId || ''}`)
    }
  }, [shouldRedirectToFailed, orderId])

  if (shouldRedirectToFailed) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-gray-500'>Redirecting...</div>
      </div>
    )
  }

  if (loading) {
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
          Confirming your payment...
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-md text-center'>
        {/* Success Icon */}
        <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
          <svg
            className='h-10 w-10 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>

        <h1 className='text-3xl font-bold text-gray-900'>
          Payment Successful!
        </h1>
        <p className='mt-3 text-gray-600'>
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {/* Order Details Card */}
        {order && (
          <div className='mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm'>
            <h2 className='mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500'>
              Order Details
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>Order ID</span>
                <span className='text-sm font-mono font-medium text-gray-900'>
                  {order.id.substring(0, 8)}...
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>Amount Paid</span>
                <span className='text-sm font-semibold text-gray-900'>
                  ${order.totalAmount}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>Customer</span>
                <span className='text-sm text-gray-900'>
                  {order.customerFullName}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>Email</span>
                <span className='text-sm text-gray-900'>
                  {order.customerEmail}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>Payment Status</span>
                <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>Order Status</span>
                <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                  {order.orderStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        <p className='mt-6 text-sm text-gray-500'>
          A confirmation email will be sent to your email address shortly.
        </p>

        <Link
          href='/shop'
          className='mt-6 inline-block rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800'
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
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
      <SuccessContent />
    </Suspense>
  )
}
