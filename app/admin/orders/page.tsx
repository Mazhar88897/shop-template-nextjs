"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package, X } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

type Order = {
  id: string;
  stripePaymentIntentId?: string | null;
  customerFullName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  couponId?: string | null;
  coupon?: unknown;
  _count?: { orderItems: number };
  orderItems?: Array<{
    id?: string;
    quantity?: number;
    productId?: string;
    product?: { name?: string; price?: string; imageUrl?: string };
  }>;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatMoney(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n / 100);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => null);

      const data = Array.isArray(json?.data)
        ? (json.data as Order[])
        : Array.isArray(json)
          ? (json as Order[])
          : null;

      if (res.ok && data) {
        setOrders(data);
      } else {
        toast.error(json?.message || json?.error || "Failed to load orders.");
      }
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(orderId: string) {
    setSelectedOrderId(orderId);
    setDetailOrder(null);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.data) {
        setDetailOrder(json.data as Order);
      } else if (res.ok && json && !json.data && json.id) {
        setDetailOrder(json as Order);
      } else {
        toast.error(json?.message || json?.error || "Failed to load order.");
      }
    } catch {
      toast.error("Failed to load order details.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setSelectedOrderId(null);
    setDetailOrder(null);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#374431]">
              Admin Orders
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              View all orders. Click a row to see details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-[#374431] hover:underline"
            >
              ← Dashboard
            </Link>
            <button
              type="button"
              onClick={fetchOrders}
              className="rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-[#e8e2d8]"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#374431]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#e8dcd2] bg-[#e1d7c4]/40 p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-sm text-zinc-600">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e8dcd2] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e8dcd2]">
                <thead className="bg-[#faf8f5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Items
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebe3]">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openDetail(order.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDetail(order.id);
                        }
                      }}
                      className="cursor-pointer hover:bg-[#faf8f5] focus:bg-[#faf8f5] focus:outline-none"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-700">
                        <div className="font-medium text-[#374431]">
                          {order.customerFullName || "—"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {order.customerEmail || "—"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus || "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                          {order.orderStatus || "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                        {order._count?.orderItems ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeDetail}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Order {selectedOrderId ? selectedOrderId.slice(0, 8) + "…" : ""}
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
              ) : detailOrder ? (
                <div className="space-y-6 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Customer
                      </div>
                      <div className="mt-1 text-white">
                        {detailOrder.customerFullName || "—"}
                      </div>
                      <div className="text-zinc-400">
                        {detailOrder.customerEmail || "—"}
                      </div>
                      {detailOrder.customerPhone && (
                        <div className="text-zinc-400">
                          {detailOrder.customerPhone}
                        </div>
                      )}
                      {detailOrder.customerAddress && (
                        <div className="mt-1 text-zinc-400">
                          {detailOrder.customerAddress}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Dates
                      </div>
                      <div className="mt-1 text-zinc-300">
                        Created:{" "}
                        {detailOrder.createdAt
                          ? new Date(detailOrder.createdAt).toLocaleString()
                          : "—"}
                      </div>
                      <div className="text-zinc-300">
                        Updated:{" "}
                        {detailOrder.updatedAt
                          ? new Date(detailOrder.updatedAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Payment
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            detailOrder.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {detailOrder.paymentStatus || "—"}
                        </span>
                      </div>
                      {detailOrder.stripePaymentIntentId && (
                        <div className="mt-1 truncate text-xs text-zinc-500">
                          {detailOrder.stripePaymentIntentId}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Order status
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex rounded-full bg-zinc-600 px-2.5 py-0.5 text-xs font-medium text-white">
                          {detailOrder.orderStatus || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                    <div className="text-xs font-medium uppercase text-zinc-500">
                      Totals
                    </div>
                    <div className="mt-2 flex justify-between text-zinc-300">
                      <span>Subtotal</span>
                      <span>{formatMoney(detailOrder.subtotal)}</span>
                    </div>
                    {Number(detailOrder.discountAmount) > 0 && (
                      <div className="flex justify-between text-zinc-300">
                        <span>Discount</span>
                        <span>-{formatMoney(detailOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between font-semibold text-white">
                      <span>Total</span>
                      <span>{formatMoney(detailOrder.totalAmount)}</span>
                    </div>
                  </div>

                  {detailOrder.orderItems && detailOrder.orderItems.length > 0 && (
                    <div>
                      <div className="text-xs font-medium uppercase text-zinc-500">
                        Items
                      </div>
                      <ul className="mt-2 space-y-2">
                        {detailOrder.orderItems.map((item, i) => (
                          <li
                            key={item.id ?? i}
                            className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2"
                          >
                            <span className="text-white">
                              {item.product?.name ?? "Product"} ×{" "}
                              {item.quantity ?? 0}
                            </span>
                            {item.product?.price != null && (
                              <span className="text-zinc-400">
                                {formatMoney(
                                  Number(item.product.price) *
                                    (item.quantity ?? 0)
                                )}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {detailOrder.coupon != null && detailOrder.coupon !== "" && (
                    <div className="text-xs text-zinc-500">
                      Coupon applied
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-8 text-center text-zinc-400">
                  Could not load order details.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
