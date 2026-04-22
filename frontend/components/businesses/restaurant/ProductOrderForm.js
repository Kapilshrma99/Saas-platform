'use client';

import { useMemo, useState } from 'react';

export default function ProductOrderForm({ tenant }) {
  const menuItems = useMemo(
    () =>
      (tenant?.content?.products || []).filter(
        item => item.title || item.description || item.category || item.image?.url
      ),
    [tenant]
  );
  const [quantities, setQuantities] = useState({});
  const [customer, setCustomer] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedItems = menuItems
    .map(item => ({
      title: item.title,
      quantity: Number(quantities[item.title] || 0),
      price: Number(item.price || 0)
    }))
    .filter(item => item.title && item.quantity > 0);

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (title, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [title]: Math.max(0, Number(quantity) || 0)
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!selectedItems.length) {
      setStatus({ type: 'error', message: 'Choose at least one menu item before placing the order.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant._id,
          ...customer,
          items: selectedItems
        })
      });
      const data = await response.json();

      setStatus({
        type: data.error ? 'error' : 'success',
        message: data.error ? data.error : 'Your order has been sent to the restaurant.'
      });

      if (!data.error) {
        setQuantities({});
        setCustomer({
          customerName: '',
          phone: '',
          email: '',
          address: '',
          notes: ''
        });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to place the order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!menuItems.length) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white/80 p-8 text-slate-500">
        No menu items added yet. The restaurant owner can add them from the dashboard.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-orange-100">
      <div className="bg-[#b45309] px-8 py-6 text-center text-white">
        <h2 className="px-4 text-2xl font-bold tracking-tight">Place an Order</h2>
        <p className="mt-2 text-sm text-orange-100">Choose dishes, share your details, and send the order directly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-8">
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div key={`${item.title || 'item'}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{item.title || `Menu item ${index + 1}`}</h3>
                    {item.category ? (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                        {item.category}
                      </span>
                    ) : null}
                  </div>
                  {item.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="min-w-20 text-right text-sm font-semibold text-slate-700">Rs. {Number(item.price || 0)}</span>
                  <input
                    type="number"
                    min="0"
                    value={quantities[item.title] || 0}
                    onChange={event => updateQuantity(item.title, event.target.value)}
                    className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-900">Order total</p>
          <p className="mt-2 text-2xl font-bold text-orange-950">Rs. {totalAmount.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
            <input
              value={customer.customerName}
              onChange={event => setCustomer({ ...customer, customerName: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-50"
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
            <input
              value={customer.phone}
              onChange={event => setCustomer({ ...customer, phone: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-50"
              placeholder="+91 98765 43210"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Email (Optional)</label>
            <input
              value={customer.email}
              onChange={event => setCustomer({ ...customer, email: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-50"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Delivery / Pickup Details</label>
            <input
              value={customer.address}
              onChange={event => setCustomer({ ...customer, address: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-50"
              placeholder="Address or pickup note"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Order Notes</label>
          <textarea
            value={customer.notes}
            onChange={event => setCustomer({ ...customer, notes: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-50"
            placeholder="Special requests, spice level, pickup timing..."
            rows="4"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl bg-[#b45309] py-4 font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-[#92400e] active:scale-[0.98] disabled:opacity-70"
        >
          <span className={loading ? 'opacity-0' : 'opacity-100 transition-opacity'}>Send Order</span>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          ) : null}
        </button>

        {status ? (
          <div
            className={`rounded-xl border p-4 text-sm font-medium ${
              status.type === 'success'
                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                : 'border-rose-100 bg-rose-50 text-rose-700'
            }`}
          >
            {status.message}
          </div>
        ) : null}
      </form>
    </div>
  );
}
