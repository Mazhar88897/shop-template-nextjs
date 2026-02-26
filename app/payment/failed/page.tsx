'use client'

import { useSearchParams } from 'next/navigation'
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

function FailedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
        }
      } catch (err) {
        console.error('Failed to fetch order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

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
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-md text-center'>
        {/* Failed Icon */}
        <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
          <svg
            className='h-10 w-10 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </div>

        <h1 className='text-3xl font-bold text-gray-900'>Payment Failed</h1>
        <p className='mt-3 text-gray-600'>
          Unfortunately, your payment could not be processed. Please try again
          or use a different payment method.
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
                <span className='text-sm text-gray-500'>Amount</span>
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
                <span className='text-sm text-gray-500'>Payment Status</span>
                <span className='inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Common reasons */}
        <div className='mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm'>
          <h3 className='mb-3 text-sm font-semibold text-gray-700'>
            Common reasons for payment failure:
          </h3>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <span className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400' />
              Insufficient funds in your account
            </li>
            <li className='flex items-start gap-2'>
              <span className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400' />
              Incorrect card details entered
            </li>
            <li className='flex items-start gap-2'>
              <span className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400' />
              Your bank declined the transaction
            </li>
            <li className='flex items-start gap-2'>
              <span className='mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400' />
              Card has expired or is not activated
            </li>
          </ul>
        </div>

        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Link
            href='/'
            className='rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50'
          >
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailedPage() {
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
      <FailedContent />
    </Suspense>
  )
}
