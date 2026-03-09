'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null) return '$0'
  const n = typeof price === 'string' ? Number(price) : price
  if (Number.isNaN(n)) return '$0'
  return '$' + n.toLocaleString()
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart } = useCart()

  const [fullName, setFullName] = useState('Mazhar Khan')
  const [email, setEmail] = useState('mk0906145@gmail.com')
  const [phone, setPhone] = useState('03365534285')
  const [address, setAddress] = useState('123 Main St')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasItems = cart.items.length > 0

  const subtotal = cart.items.reduce((sum, item) => {
    const p = item.price ? Number(item.price) : 0
    return sum + (Number.isNaN(p) ? 0 : p) * item.quantity
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasItems) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('https://shop-template-backend-nine.vercel.app/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          customer: {
            fullName,
            email,
            phone,
            address
          }
        })
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.error || 'Failed to start checkout. Please try again.')
        setIsSubmitting(false)
        return
      }

      const { orderId, clientSecret, totalAmount, customer } = json.data

      router.push(
        `/payment?clientSecret=${encodeURIComponent(
          clientSecret
        )}&orderId=${encodeURIComponent(
          orderId
        )}&totalAmount=${encodeURIComponent(
          totalAmount
        )}&customerEmail=${encodeURIComponent(
          customer.email
        )}&customerFullName=${encodeURIComponent(customer.fullName)}`
      )
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!hasItems) {
    return (
      <div className='min-h-screen bg-[#f5f0e8] font-sans'>
        <div className='mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center'>
          <h1 className='text-2xl font-semibold text-[#374431]'>
            Your cart is empty
          </h1>
          <p className='mt-2 text-sm text-zinc-600'>
            Add some items to your cart before proceeding to checkout.
          </p>
          <Link
            href='/shop'
            className='mt-6 inline-flex items-center justify-center rounded-lg bg-[#1e4d3c] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#163d30]'
          >
            Back to shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f5f0e8] font-sans'>
      <div className='mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8'>
        <div className='mb-6 flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold text-[#374431]'>Checkout</h1>
            <p className='mt-1 text-sm text-zinc-600'>
              Review your cart and enter your details to continue to payment.
            </p>
          </div>
          <Link
            href='/shop'
            className='text-xs font-medium text-[#374431] underline-offset-4 hover:underline'
          >
            Continue shopping
          </Link>
        </div>

        <div className='grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]'>
          <section className='rounded-2xl border border-[#e8dcd2] bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-zinc-500'>
              Your cart
            </h2>
            <ul className='mt-4 space-y-4'>
              {cart.items.map((item) => {
                const unitPrice = item.price ? Number(item.price) : 0
                const lineTotal = Number.isNaN(unitPrice)
                  ? 0
                  : unitPrice * item.quantity
                return (
                  <li
                    key={item.productId}
                    className='flex gap-3 rounded-xl border border-[#e8dcd2] bg-[#f8f5f0] p-3'
                  >
                    <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#e5e2dc]'>
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name ?? 'Product'}
                          fill
                          className='object-cover'
                          sizes='64px'
                          unoptimized
                        />
                      ) : (
                        <div className='flex h-full items-center justify-center text-xs text-zinc-400'>
                          No img
                        </div>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-zinc-900'>
                        {item.name ?? 'Product'}
                      </p>
                      <p className='mt-1 text-xs text-zinc-600'>
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className='text-sm font-semibold text-[#374431]'>
                      {formatPrice(String(lineTotal))}
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className='mt-4 border-t border-[#e8dcd2] pt-4'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-zinc-600'>Subtotal</span>
                <span className='text-base font-semibold text-[#374431]'>
                  {formatPrice(String(subtotal))}
                </span>
              </div>
            </div>
          </section>

          <section className='rounded-2xl border border-[#e8dcd2] bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-zinc-500'>
              Your details
            </h2>
            <form onSubmit={handleSubmit} className='mt-4 space-y-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-zinc-700'>
                  Full name
                </label>
                <input
                  type='text'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className='w-full rounded-lg border border-[#e2d7c5] bg-[#f8f5f0] px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1e4d3c] focus:outline-none focus:ring-1 focus:ring-[#1e4d3c]'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-zinc-700'>Email</label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='w-full rounded-lg border border-[#e2d7c5] bg-[#f8f5f0] px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1e4d3c] focus:outline-none focus:ring-1 focus:ring-[#1e4d3c]'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-zinc-700'>Phone</label>
                <input
                  type='tel'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className='w-full rounded-lg border border-[#e2d7c5] bg-[#f8f5f0] px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1e4d3c] focus:outline-none focus:ring-1 focus:ring-[#1e4d3c]'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-zinc-700'>
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className='w-full resize-none rounded-lg border border-[#e2d7c5] bg-[#f8f5f0] px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1e4d3c] focus:outline-none focus:ring-1 focus:ring-[#1e4d3c]'
                />
              </div>

              {error && (
                <div className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={isSubmitting}
                className='mt-2 w-full rounded-lg bg-[#1e4d3c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#163d30] disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isSubmitting ? 'Processing...' : 'Continue to payment'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
