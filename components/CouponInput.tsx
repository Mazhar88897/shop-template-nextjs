'use client'

import { useState } from 'react'

interface CouponData {
  code: string
  discountType: string
  percentOff: string | null
  amountOff: string | null
}

interface CouponInputProps {
  orderId: string
  onCouponApplied: (data: {
    discountAmount: string
    totalAmount: string
    coupon: CouponData
  }) => void
  onCouponRemoved: (data: { totalAmount: string }) => void
}

export default function CouponInput({
  orderId,
  onCouponApplied,
  onCouponRemoved
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return

    setIsApplying(true)
    setError(null)

    try {
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}/apply-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.error || 'Failed to apply coupon')
        return
      }

      setAppliedCoupon(json.data.coupon)
      onCouponApplied({
        discountAmount: json.data.discountAmount,
        totalAmount: json.data.totalAmount,
        coupon: json.data.coupon
      })
    } catch {
      setError('Failed to apply coupon. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    setError(null)

    try {
      const res = await fetch(`http://localhost:3000s/${orderId}/apply-coupon`, {
        method: 'DELETE'
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.error || 'Failed to remove coupon')
        return
      }

      setAppliedCoupon(null)
      setCode('')
      onCouponRemoved({
        totalAmount: json.data.totalAmount
      })
    } catch {
      setError('Failed to remove coupon. Please try again.')
    } finally {
      setIsRemoving(false)
    }
  }

  if (appliedCoupon) {
    return (
      <div className='rounded-lg border border-green-200 bg-green-50 p-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <svg
              className='h-4 w-4 text-green-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            <span className='text-sm font-medium text-green-800'>
              {appliedCoupon.code}
            </span>
            <span className='text-xs text-green-600'>
              {appliedCoupon.discountType === 'percent'
                ? `${appliedCoupon.percentOff}% off`
                : `$${appliedCoupon.amountOff} off`}
            </span>
          </div>
          <button
            type='button'
            onClick={handleRemove}
            disabled={isRemoving}
            className='text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50'
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='flex gap-2'>
        <input
          type='text'
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleApply()
            }
          }}
          placeholder='Coupon code'
          className='flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900'
        />
        <button
          type='button'
          onClick={handleApply}
          disabled={isApplying || !code.trim()}
          className='rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isApplying ? (
            <svg
              className='h-4 w-4 animate-spin'
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
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {error && <p className='mt-2 text-xs text-red-600'>{error}</p>}
    </div>
  )
}
