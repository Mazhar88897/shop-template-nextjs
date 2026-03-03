"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

type Coupon = {
  id: string;
  code: string;
  stripeCouponId?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  discountType: "percent" | "amount" | string;
  percentOff?: string | number | null;
  amountOff?: string | number | null;
  name?: string | null;
  duration?: string | null;
  durationInMonths?: string | number | null;
  _count?: { orders?: number };
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatDiscount(c: Coupon) {
  if (c.discountType === "percent") {
    const p = c.percentOff ?? "";
    return p ? `${p}%` : "—";
  }
  if (c.discountType === "amount") {
    const a = c.amountOff ?? "";
    return a ? `$${a}` : "—";
  }
  return "—";
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    discountType: "percent" as string,
    percentOff: "",
    amountOff: "",
    duration: "forever" as string,
    durationInMonths: "",
    expiresAtLocal: "",
  });

  const rows = useMemo(() => {
    return coupons.map((c) => ({
      ...c,
      orders: c._count?.orders ?? 0,
      discount: formatDiscount(c),
      created:
        c.createdAt ? new Date(c.createdAt).toLocaleString() : "—",
      expires:
        c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "—",
    }));
  }, [coupons]);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => null);

      const data = Array.isArray(json?.data)
        ? (json.data as Coupon[])
        : Array.isArray(json)
          ? (json as Coupon[])
          : null;

      if (res.ok && data) {
        setCoupons(data);
      } else {
        toast.error(json?.message || json?.error || "Failed to load coupons.");
      }
    } catch {
      toast.error("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setCouponToEdit(null);
    setForm({
      code: "",
      name: "",
      discountType: "percent",
      percentOff: "",
      amountOff: "",
      duration: "forever",
      durationInMonths: "",
      expiresAtLocal: "",
    });
    setCreateOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setCouponToEdit(coupon);

    const expiresAtLocal = coupon.expiresAt
      ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
      : "";

    setForm({
      code: coupon.code || "",
      name: coupon.name || "",
      discountType: coupon.discountType || "percent",
      percentOff:
        coupon.discountType === "percent" && coupon.percentOff != null
          ? String(coupon.percentOff)
          : "",
      amountOff:
        coupon.discountType === "amount" && coupon.amountOff != null
          ? String(coupon.amountOff)
          : "",
      duration: coupon.duration || "forever",
      durationInMonths:
        coupon.durationInMonths != null ? String(coupon.durationInMonths) : "",
      expiresAtLocal,
    });

    setEditOpen(true);
  }

  function openDelete(coupon: Coupon) {
    setCouponToDelete(coupon);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!couponToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/coupons/${couponToDelete.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json?.message || json?.error || "Failed to delete coupon.");
        setDeleteLoading(false);
        return;
      }

      toast.success(json?.data?.message || "Coupon deleted.");
      setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
      setDeleteOpen(false);
      setCouponToDelete(null);
    } catch {
      toast.error("Failed to delete coupon.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!couponToEdit) return;

    if (!form.code.trim()) {
      toast.error("Code is required.");
      return;
    }

    if (form.discountType === "percent" && !String(form.percentOff).trim()) {
      toast.error("Percent off is required.");
      return;
    }

    if (form.discountType === "amount" && !String(form.amountOff).trim()) {
      toast.error("Amount off is required.");
      return;
    }

    setFormLoading(true);

    const percentOff =
      form.discountType === "percent" && form.percentOff.trim()
        ? Number(form.percentOff.trim())
        : null;
    const amountOff =
      form.discountType === "amount" && form.amountOff.trim()
        ? Number(form.amountOff.trim())
        : null;
    const durationInMonths =
      form.duration === "repeating" && form.durationInMonths.trim()
        ? Number(form.durationInMonths.trim())
        : null;

    const payload = {
      code: form.code.trim(),
      name: form.name.trim() || undefined,
      discountType: form.discountType,
      percentOff,
      amountOff,
      duration: form.duration,
      durationInMonths,
      expiresAt: form.expiresAtLocal
        ? new Date(form.expiresAtLocal).toISOString()
        : null,
    };

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/coupons/${couponToEdit.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json?.message || json?.error || "Failed to update coupon.");
        setFormLoading(false);
        return;
      }

      toast.success("Coupon updated.");
      setEditOpen(false);
      setCouponToEdit(null);
      fetchCoupons();
    } catch {
      toast.error("Failed to update coupon.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error("Code is required.");
      return;
    }

    if (form.discountType === "percent" && !String(form.percentOff).trim()) {
      toast.error("Percent off is required.");
      return;
    }

    if (form.discountType === "amount" && !String(form.amountOff).trim()) {
      toast.error("Amount off is required.");
      return;
    }

    setFormLoading(true);

    const percentOff =
      form.discountType === "percent" && form.percentOff.trim()
        ? Number(form.percentOff.trim())
        : null;
    const amountOff =
      form.discountType === "amount" && form.amountOff.trim()
        ? Number(form.amountOff.trim())
        : null;
    const durationInMonths =
      form.duration === "repeating" && form.durationInMonths.trim()
        ? Number(form.durationInMonths.trim())
        : null;

    const payload = {
      code: form.code.trim(),
      name: form.name.trim() || undefined,
      discountType: form.discountType,
      percentOff,
      amountOff,
      duration: form.duration,
      durationInMonths,
      expiresAt: form.expiresAtLocal
        ? new Date(form.expiresAtLocal).toISOString()
        : null,
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json?.message || json?.error || "Failed to create coupon.");
        setFormLoading(false);
        return;
      }

      toast.success("Coupon created.");
      setCreateOpen(false);
      setCouponToEdit(null);
      fetchCoupons();
    } catch {
      toast.error("Failed to create coupon.");
    } finally {
      setFormLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#374431]">
              Admin Coupons
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              View active coupon codes and usage.
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
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1e4d3c] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#163d30]"
            >
              <Plus className="h-4 w-4" />
              New coupon
            </button>
            <button
              type="button"
              onClick={fetchCoupons}
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
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-[#e8dcd2] bg-[#e1d7c4]/40 p-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-sm text-zinc-600">No coupons found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e8dcd2] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#e8dcd2]">
                <thead className="bg-[#faf8f5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebe3]">
                  {rows.map((c) => (
                    <tr key={c.id} className="hover:bg-[#faf8f5]">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-[#374431]">
                        {c.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-700">
                        {c.name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                        {c.discount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                        {c.duration || "—"}
                        {c.durationInMonths
                          ? ` (${c.durationInMonths} mo)`
                          : ""}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                        {c.orders}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                        {c.created}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700">
                        {c.expires}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] text-zinc-700 hover:bg-[#e8e2d8]"
                            aria-label={`Edit ${c.code}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(c)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            aria-label={`Delete ${c.code}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !formLoading && setCreateOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create coupon
                </h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Define code, discount, and duration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !formLoading && setCreateOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Code
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="SUMMER10"
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Summer Sale 10% Off"
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Discount type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountType: e.target.value,
                        percentOff: "",
                        amountOff: "",
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  >
                    <option value="percent">Percent</option>
                    <option value="amount">Amount</option>
                  </select>
                </div>

                {form.discountType === "percent" ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                      Percent off
                    </label>
                    <input
                      value={form.percentOff}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, percentOff: e.target.value }))
                      }
                      placeholder="10"
                      className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      disabled={formLoading}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                      Amount off
                    </label>
                    <input
                      value={form.amountOff}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amountOff: e.target.value }))
                      }
                      placeholder="5"
                      className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      disabled={formLoading}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Duration
                  </label>
                  <select
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, duration: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  >
                    <option value="forever">Forever</option>
                    <option value="once">Once</option>
                    <option value="repeating">Repeating (2–3 times etc.)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Expires at
                  </label>
                  <input
                    type="datetime-local"
                    value={form.expiresAtLocal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, expiresAtLocal: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
              </div>

              {form.duration === "repeating" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Duration in months
                  </label>
                  <input
                    value={form.durationInMonths}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        durationInMonths: e.target.value,
                      }))
                    }
                    placeholder="2 for twice, 3 for thrice"
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !formLoading && setCreateOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  disabled={formLoading}
                >
                  {formLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && couponToEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !formLoading && setEditOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Edit coupon</h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Update the details and save.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !formLoading && setEditOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Code
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                    }
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Coupon name"
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Discount type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountType: e.target.value,
                        percentOff: "",
                        amountOff: "",
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  >
                    <option value="percent">Percent</option>
                    <option value="amount">Amount</option>
                  </select>
                </div>

                {form.discountType === "percent" ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                      Percent off
                    </label>
                    <input
                      value={form.percentOff}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, percentOff: e.target.value }))
                      }
                      placeholder="10"
                      className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      disabled={formLoading}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                      Amount off
                    </label>
                    <input
                      value={form.amountOff}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amountOff: e.target.value }))
                      }
                      placeholder="100"
                      className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      disabled={formLoading}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Duration
                  </label>
                  <select
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, duration: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  >
                    <option value="forever">Forever</option>
                    <option value="once">Once</option>
                    <option value="repeating">Repeating</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Expires at
                  </label>
                  <input
                    type="datetime-local"
                    value={form.expiresAtLocal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, expiresAtLocal: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
              </div>

              {form.duration === "repeating" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Duration in months
                  </label>
                  <input
                    value={form.durationInMonths}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        durationInMonths: e.target.value,
                      }))
                    }
                    placeholder="3"
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    disabled={formLoading}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !formLoading && setEditOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  disabled={formLoading}
                >
                  {formLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && couponToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !deleteLoading && setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">
                Delete coupon?
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                &ldquo;{couponToDelete.code}&rdquo; will be permanently removed.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => !deleteLoading && setDeleteOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
