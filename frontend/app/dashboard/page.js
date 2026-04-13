'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const initialForm = {
  name: '',
  slug: '',
  subdomain: '',
  businessType: 'freelancer',
  owner: {
    email: '',
    password: ''
  },
  content: {
    title: '',
    description: '',
    services: [{ title: '', description: '' }],
    products: [{ title: '', description: '', price: 0 }],
    images: [],
    contactInfo: { phone: '', email: '', address: '' }
  },
  theme: {
    primaryColor: '#2f80ed',
    secondaryColor: '#f2c94c',
    fontFamily: 'Inter, sans-serif',
    layout: 'modern'
  }
};

export default function DashboardPage() {
  const [form, setForm] = useState(initialForm);
  const [tenantId, setTenantId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setAuthToken(token);

    const stored = typeof window !== 'undefined' ? localStorage.getItem('currentTenant') : null;
    if (stored) {
      const savedTenant = JSON.parse(stored);
      fetchTenant(savedTenant.slug, savedTenant._id);
    } else if (token) {
      fetchCurrentTenant(token);
    }
  }, []);

  const fetchCurrentTenant = async token => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        return;
      }
      const data = await response.json();
      const tenant = data.tenant;
      updateFormFromTenant(tenant);
      setTenantId(tenant._id);
    } catch (err) {
      console.error(err);
    }
  };

  const updateFormFromTenant = tenant => {
    setForm({
      ...form,
      name: tenant.name,
      slug: tenant.slug,
      subdomain: tenant.subdomain,
      businessType: tenant.businessType,
      owner: {
        email: tenant.owner?.email || '',
        password: ''
      },
      content: {
        title: tenant.content?.title || '',
        description: tenant.content?.description || '',
        services: tenant.content?.services?.length ? tenant.content.services : [{ title: '', description: '' }],
        products: tenant.content?.products?.length ? tenant.content.products : [{ title: '', description: '', price: 0 }],
        images: tenant.content?.images || [],
        contactInfo: tenant.content?.contactInfo || { phone: '', email: '', address: '' }
      },
      theme: {
        primaryColor: tenant.theme?.primaryColor || '#2f80ed',
        secondaryColor: tenant.theme?.secondaryColor || '#f2c94c',
        fontFamily: tenant.theme?.fontFamily || 'Inter, sans-serif',
        layout: tenant.theme?.layout || 'modern'
      }
    });
  };

  const fetchTenant = async (slug, id) => {
    try {
      const response = await fetch(`/api/tenants/${slug}`);
      if (!response.ok) return;
      const tenant = await response.json();
      setTenantId(tenant._id);
      updateFormFromTenant(tenant);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFieldChange = (section, key, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleOwnerChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      owner: {
        ...prev.owner,
        [key]: value
      }
    }));
  };

  const handleContentChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value
      }
    }));
  };

  const handleContactInfoChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        contactInfo: {
          ...prev.content.contactInfo,
          [key]: value
        }
      }
    }));
  };

  const handleServiceChange = (index, key, value) => {
    const services = [...form.content.services];
    services[index] = { ...services[index], [key]: value };
    setForm(prev => ({ ...prev, content: { ...prev.content, services } }));
  };

  const addService = () => {
    setForm(prev => ({
      ...prev,
      content: { ...prev.content, services: [...prev.content.services, { title: '', description: '' }] }
    }));
  };

  const removeService = index => {
    const services = form.content.services.filter((_, idx) => idx !== index);
    setForm(prev => ({ ...prev, content: { ...prev.content, services: services.length ? services : [{ title: '', description: '' }] } }));
  };

  const uploadImage = async file => {
    const payload = new FormData();
    payload.append('file', file);
    payload.append('slug', form.slug || 'public');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: payload
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data.url;
  };

  const handleImageUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setStatus('Uploading image...');
      const url = await uploadImage(file);
      setForm(prev => ({
        ...prev,
        content: { ...prev.content, images: [...prev.content.images, { url, alt: file.name }] }
      }));
      setStatus('Image uploaded successfully. Save to update tenant.');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus(null);
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError(null);

    if (tenantId && !authToken) {
      setError('Please log in to update your website.');
      setStatus(null);
      return;
    }

    const method = tenantId ? 'PUT' : 'POST';
    const url = tenantId
      ? `/api/tenants/${tenantId}`
      : '/api/auth/register';

    const payload = {
      ...form,
      content: {
        ...form.content,
        services: form.content.services.filter(service => service.title || service.description),
        products: form.content.products.filter(product => product.title || product.description)
      }
    };

    setStatus(tenantId ? 'Updating website...' : 'Creating website...');
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(tenantId && authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || data.message || 'Failed to save tenant.');
      setStatus(null);
      return;
    }

    if (!tenantId) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentTenant', JSON.stringify(data.tenant));
      setAuthToken(data.token);
      setTenantId(data.tenant._id);
      setStatus('Website created successfully! Redirecting...');
      router.push(`/site/${data.tenant.slug}`);
      return;
    }

    localStorage.setItem('currentTenant', JSON.stringify(data));
    setTenantId(data._id);
    setStatus('Website updated successfully.');
  };

  return (
    <main className="container">
      <div className="rounded-3xl border border-slate-200 p-10 shadow-sm">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-slate-600">Create your website and manage your content, theme, and subscription.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <section className="space-y-4 rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <h2 className="text-xl font-semibold">Website Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Business Name</span>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="SmileCare"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Slug</span>
                <input
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="smilecare"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Subdomain</span>
                <input
                  value={form.subdomain}
                  onChange={e => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="smilecare"
                  required
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
                  <option value="shopping">Shopping</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="small-business">Small Business</option>
                </select>
              </label>
            </div>
            {!tenantId ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Owner Email</span>
                  <input
                    type="email"
                    value={form.owner.email}
                    onChange={e => handleOwnerChange('email', e.target.value.toLowerCase())}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="owner@business.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Owner Password</span>
                  <input
                    type="password"
                    value={form.owner.password}
                    onChange={e => handleOwnerChange('password', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Enter a secure password"
                    required
                  />
                </label>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                <p className="text-sm text-slate-700">Signed in as <span className="font-semibold">{form.owner.email}</span>.</p>
                <label className="block mt-4">
                  <span className="text-sm font-medium text-slate-700">New password (optional)</span>
                  <input
                    type="password"
                    value={form.owner.password}
                    onChange={e => handleOwnerChange('password', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Leave blank to keep current password"
                  />
                </label>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <h2 className="text-xl font-semibold">Page Content</h2>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                value={form.content.title}
                onChange={e => handleContentChange('title', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Welcome to SmileCare"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                value={form.content.description}
                onChange={e => handleContentChange('description', e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-300 px-4 py-3"
                rows="4"
                placeholder="Describe your business and services."
              />
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Services</h3>
                <button type="button" onClick={addService} className="rounded-full bg-primary px-4 py-2 text-white">
                  Add Service
                </button>
              </div>
              <div className="space-y-4">
                {form.content.services.map((service, index) => (
                  <div key={index} className="rounded-3xl border border-slate-300 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={service.title}
                        onChange={e => handleServiceChange(index, 'title', e.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3"
                        placeholder="Service title"
                      />
                      <input
                        value={service.description}
                        onChange={e => handleServiceChange(index, 'description', e.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3"
                        placeholder="Service description"
                      />
                    </div>
                    <button type="button" onClick={() => removeService(index)} className="mt-3 text-sm text-red-700">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images</h3>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {form.content.images.map((image, index) => (
                  <img key={index} src={image.url} alt={image.alt || `Upload ${index + 1}`} className="h-40 w-full rounded-3xl object-cover" />
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={form.content.contactInfo.phone}
                onChange={e => handleContactInfoChange('phone', e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Phone"
              />
              <input
                value={form.content.contactInfo.email}
                onChange={e => handleContactInfoChange('email', e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Email"
              />
              <input
                value={form.content.contactInfo.address}
                onChange={e => handleContactInfoChange('address', e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Address"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <h2 className="text-xl font-semibold">Theme</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Primary Color</span>
                <input
                  type="color"
                  value={form.theme.primaryColor}
                  onChange={e => handleFieldChange('theme', 'primaryColor', e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Secondary Color</span>
                <input
                  type="color"
                  value={form.theme.secondaryColor}
                  onChange={e => handleFieldChange('theme', 'secondaryColor', e.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Font Family</span>
                <input
                  value={form.theme.fontFamily}
                  onChange={e => handleFieldChange('theme', 'fontFamily', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Inter, sans-serif"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Layout</span>
                <select
                  value={form.theme.layout}
                  onChange={e => handleFieldChange('theme', 'layout', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="rounded-full bg-primary px-6 py-3 text-white">
              {tenantId ? 'Update Website' : 'Create Website'}
            </button>
            {tenantId && (
              <button type="button" onClick={() => router.push(`/site/${form.slug}`)} className="rounded-full border border-slate-300 px-6 py-3">
                Preview Website
              </button>
            )}
          </div>
          {status && <p className="text-sm text-green-700">{status}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      </div>
    </main>
  );
}
