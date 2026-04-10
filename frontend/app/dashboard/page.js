import { useEffect, useState } from 'react';

const initialForm = {
  name: '',
  slug: '',
  subdomain: '',
  businessType: 'freelancer'
};

export default function DashboardPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();
    const response = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setStatus(data.message || 'Tenant created successfully');
  };

  return (
    <main className="container">
      <div className="rounded-3xl border border-slate-200 p-10 shadow-sm">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-slate-600">Create your website and manage your content, theme, and subscription.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Business Name</span>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="SmileCare"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Slug</span>
              <input
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="smilecare"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Subdomain</span>
              <input
                value={form.subdomain}
                onChange={e => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="smilecare"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Business Type</span>
              <select
                value={form.businessType}
                onChange={e => setForm({ ...form, businessType: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="doctor">Doctor</option>
                <option value="restaurant">Restaurant</option>
                <option value="freelancer">Freelancer</option>
                <option value="small-business">Small Business</option>
              </select>
            </label>
          </div>
          <button type="submit" className="rounded-full bg-primary px-6 py-3 text-white">Create Website</button>
          {status && <p className="text-sm text-green-700">{status}</p>}
        </form>
      </div>
    </main>
  );
}
