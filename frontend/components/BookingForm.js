'use client';
import { useState } from 'react';

export default function BookingForm({ tenant }) {
  const [form, setForm] = useState({ name: '', phone: '', datetime: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant._id, ...form })
      });
      const data = await response.json();
      setStatus({ 
        type: data.error ? 'error' : 'success', 
        message: data.error ? 'Something went wrong. Please try again.' : 'Thank you! Your booking has been received.' 
      });
      if (!data.error) setForm({ name: '', phone: '', datetime: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to connect. Please check your internet.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100">
      <div className="bg-indigo-600 px-8 py-6 text-white text-center">
        <h2 className="text-2xl font-bold tracking-tight px-4">Book an Appointment</h2>
        <p className="mt-2 text-indigo-100 text-sm">Schedule a consultation in seconds</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
            <input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50" 
              placeholder="John Doe" 
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
            <input 
              value={form.phone} 
              onChange={e => setForm({ ...form, phone: e.target.value })} 
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50" 
              placeholder="+91 98765 43210" 
              required 
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Preferred Date & Time</label>
          <input 
            value={form.datetime} 
            onChange={e => setForm({ ...form, datetime: e.target.value })} 
            type="datetime-local" 
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50" 
            required 
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Special Message (Optional)</label>
          <textarea 
            value={form.message} 
            onChange={e => setForm({ ...form, message: e.target.value })} 
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50" 
            placeholder="Tell us about your requirements..." 
            rows="4" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70"
        >
          <span className={loading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
            Confirm Booking
          </span>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </button>

        {status && (
          <div className={`rounded-xl p-4 text-sm font-medium ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}

