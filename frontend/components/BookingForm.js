'use client';
import { useState } from 'react';

export default function BookingForm({ tenant }) {
  const [form, setForm] = useState({ name: '', phone: '', datetime: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: tenant._id, ...form })
    });
    const data = await response.json();
    setStatus(data.error ? 'Failed to submit booking.' : 'Booking submitted successfully.');
  };

  return (
    <div className="rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-semibold">Book an Appointment</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Name" required />
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Phone" required />
        <input value={form.datetime} onChange={e => setForm({ ...form, datetime: e.target.value })} type="datetime-local" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Message" rows="4" />
        <button type="submit" className="w-full rounded-full bg-primary px-6 py-3 text-white">Submit Booking</button>
        {status && <p className="text-sm text-slate-700">{status}</p>}
      </form>
    </div>
  );
}
