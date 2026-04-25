'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import WebsiteRenderer from '../../components/WebsiteRenderer';

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
    heroImage: { url: '', alt: '' },
    heroCarousel: {
      direction: 'side',
      speed: 4,
      images: []
    },
    services: [{ title: '', description: '', image: { url: '', alt: '' } }],
    products: [{ title: '', description: '', price: 0, category: '', image: { url: '', alt: '' } }],
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

const fieldClass =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';

const textAreaClass = `${fieldClass} rounded-3xl`;

const actionButtonClass =
  'rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70';

const secondaryButtonClass =
  'rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-[border-color,background-color,color,transform] duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70';

const dangerButtonClass =
  'text-sm font-medium text-red-700 transition-colors duration-200 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2';

const uploadHintClass = 'mt-1 text-sm text-slate-500';

const businessTypeHelp = {
  doctor: 'Best for clinics, doctors, and appointment-based healthcare websites.',
  restaurant: 'Best for food businesses that show menu items and take meal orders.',
  shopping: 'Best for ecommerce stores that list products and accept customer orders.',
  freelancer: 'Best for personal services, portfolios, and direct client enquiries.',
  'small-business': 'Best for local businesses that mainly need services, contact info, and branding.'
};

function buildTenantForm(tenant) {
  return {
    ...initialForm,
    name: tenant?.name || '',
    slug: tenant?.slug || '',
    subdomain: tenant?.subdomain || '',
    businessType: tenant?.businessType || 'freelancer',
    owner: {
      email: tenant?.owner?.email || '',
      password: ''
    },
    content: {
      title: tenant?.content?.title || '',
      description: tenant?.content?.description || '',
      heroImage: {
        url: tenant?.content?.heroImage?.url || '',
        alt: tenant?.content?.heroImage?.alt || ''
      },
      heroCarousel: {
        direction: tenant?.content?.heroCarousel?.direction || 'side',
        speed: tenant?.content?.heroCarousel?.speed || 4,
        images: tenant?.content?.heroCarousel?.images || []
      },
      services: tenant?.content?.services?.length
        ? tenant.content.services.map(service => ({
            title: service.title || '',
            description: service.description || '',
            image: {
              url: service.image?.url || '',
              alt: service.image?.alt || ''
            }
          }))
        : [{ title: '', description: '', image: { url: '', alt: '' } }],
      products: tenant?.content?.products?.length
        ? tenant.content.products.map(product => ({
            title: product.title || '',
            description: product.description || '',
            price: product.price || 0,
            category: product.category || '',
            image: {
              url: product.image?.url || '',
              alt: product.image?.alt || ''
            }
          }))
        : [{ title: '', description: '', price: 0, category: '', image: { url: '', alt: '' } }],
      images: tenant?.content?.images || [],
      contactInfo: tenant?.content?.contactInfo || { phone: '', email: '', address: '' }
    },
    theme: {
      primaryColor: tenant?.theme?.primaryColor || '#2f80ed',
      secondaryColor: tenant?.theme?.secondaryColor || '#f2c94c',
      fontFamily: tenant?.theme?.fontFamily || 'Inter, sans-serif',
      layout: tenant?.theme?.layout || 'modern'
    }
  };
}

function LabeledInput({ label, hint, className = fieldClass, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-slate-500">{hint}</span> : null}
      <input className={className} {...props} />
    </label>
  );
}

function LabeledTextarea({ label, hint, className = textAreaClass, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-slate-500">{hint}</span> : null}
      <textarea className={className} {...props} />
    </label>
  );
}

function LabeledSelect({ label, hint, className = fieldClass, children, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-slate-500">{hint}</span> : null}
      <select className={className} {...props}>
        {children}
      </select>
    </label>
  );
}

export default function DashboardPage() {
  const [form, setForm] = useState(initialForm);
  const [tenantId, setTenantId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [websiteCreated, setWebsiteCreated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(JSON.stringify(initialForm));
  const router = useRouter();

  const isRestaurant = form.businessType === 'restaurant';
  const isShopping = form.businessType === 'shopping';
  const productSectionTitle = isRestaurant ? 'Menu Items' : 'Products';
  const productSectionDescription = isRestaurant
    ? 'Create the dishes customers can browse and order from your restaurant website.'
    : 'Create the catalog items you want shoppers to see on your website.';

  const formSnapshot = useMemo(() => JSON.stringify(form), [form]);
  const hasUnsavedChanges = formSnapshot !== lastSavedSnapshot;

  const previewTenant = useMemo(
    () => ({
      _id: tenantId || 'draft-preview',
      websiteCreated,
      ...form,
      content: {
        ...form.content,
        heroCarousel: {
          direction: form.content.heroCarousel?.direction === 'upward' ? 'upward' : 'side',
          speed: Math.min(Math.max(Number(form.content.heroCarousel?.speed) || 4, 1), 15),
          images: (form.content.heroCarousel?.images || []).filter(image => image.url)
        },
        services: form.content.services.filter(service => service.title || service.description || service.image?.url),
        products: form.content.products.filter(
          product => product.title || product.description || product.category || product.image?.url
        )
      }
    }),
    [form, tenantId, websiteCreated]
  );

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    setAuthToken(token);
    fetchCurrentTenant(token);
  }, []);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;

    const handleBeforeUnload = event => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchCurrentTenant = async token => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentTenant');
        setAuthToken(null);
        setCheckingAuth(false);
        return;
      }

      const data = await response.json();
      const tenant = data.tenant;
      updateFormFromTenant(tenant);
      setTenantId(tenant._id);
      setWebsiteCreated(Boolean(tenant.websiteCreated && tenant.slug));
      localStorage.setItem('currentTenant', JSON.stringify(tenant));
    } catch (err) {
      console.error(err);
      setError('Unable to load your account. Refresh the page and try again.');
    } finally {
      setCheckingAuth(false);
    }
  };

  const updateFormFromTenant = tenant => {
    const nextForm = buildTenantForm(tenant);
    setForm(nextForm);
    setLastSavedSnapshot(JSON.stringify(nextForm));
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

  const handleHeroImageChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        heroImage: {
          ...prev.content.heroImage,
          [key]: value
        }
      }
    }));
  };

  const handleHeroCarouselChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        heroCarousel: {
          ...prev.content.heroCarousel,
          [key]: value
        }
      }
    }));
  };

  const handleHeroCarouselImageChange = (index, key, value) => {
    const nextImages = [...(form.content.heroCarousel?.images || [])];
    nextImages[index] = { ...nextImages[index], [key]: value };
    handleHeroCarouselChange('images', nextImages);
  };

  const removeHeroCarouselImage = index => {
    const nextImages = (form.content.heroCarousel?.images || []).filter((_, imageIndex) => imageIndex !== index);
    handleHeroCarouselChange('images', nextImages);
  };

  const addEmptyHeroCarouselImage = () => {
    handleHeroCarouselChange('images', [...(form.content.heroCarousel?.images || []), { url: '', alt: '' }]);
  };

  const handleServiceChange = (index, key, value) => {
    const services = [...form.content.services];
    services[index] = { ...services[index], [key]: value };
    setForm(prev => ({ ...prev, content: { ...prev.content, services } }));
  };

  const handleServiceImageChange = (index, key, value) => {
    const services = [...form.content.services];
    services[index] = {
      ...services[index],
      image: {
        url: services[index]?.image?.url || '',
        alt: services[index]?.image?.alt || '',
        [key]: value
      }
    };
    setForm(prev => ({ ...prev, content: { ...prev.content, services } }));
  };

  const addService = () => {
    setForm(prev => ({
      ...prev,
      content: { ...prev.content, services: [...prev.content.services, { title: '', description: '', image: { url: '', alt: '' } }] }
    }));
  };

  const removeService = index => {
    const services = form.content.services.filter((_, idx) => idx !== index);
    setForm(prev => ({
      ...prev,
      content: { ...prev.content, services: services.length ? services : [{ title: '', description: '', image: { url: '', alt: '' } }] }
    }));
  };

  const handleProductChange = (index, key, value) => {
    const products = [...form.content.products];
    products[index] = { ...products[index], [key]: value };
    setForm(prev => ({ ...prev, content: { ...prev.content, products } }));
  };

  const handleProductImageChange = (index, key, value) => {
    const products = [...form.content.products];
    products[index] = {
      ...products[index],
      image: {
        url: products[index]?.image?.url || '',
        alt: products[index]?.image?.alt || '',
        [key]: value
      }
    };
    setForm(prev => ({ ...prev, content: { ...prev.content, products } }));
  };

  const addProduct = () => {
    setForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        products: [
          ...prev.content.products,
          { title: '', description: '', price: 0, category: '', image: { url: '', alt: '' } }
        ]
      }
    }));
  };

  const removeProduct = index => {
    const products = form.content.products.filter((_, idx) => idx !== index);
    setForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        products: products.length ? products : [{ title: '', description: '', price: 0, category: '', image: { url: '', alt: '' } }]
      }
    }));
  };

  const uploadImage = async file => {
    const payload = new FormData();
    payload.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: payload
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed. Try a different image and try again.');
    }
    return data.url;
  };

  const handleImageUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setError('Please sign in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading image…');
      const url = await uploadImage(file);
      setForm(prev => ({
        ...prev,
        content: { ...prev.content, images: [...prev.content.images, { url, alt: file.name }] }
      }));
      setStatus('Image uploaded successfully. Save your website to publish it.');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus(null);
    } finally {
      event.target.value = '';
    }
  };

  const handleHeroImageUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setError('Please sign in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading hero image…');
      const url = await uploadImage(file);
      setForm(prev => ({
        ...prev,
        content: {
          ...prev.content,
          heroImage: { url, alt: prev.content.heroImage?.alt || file.name }
        }
      }));
      setStatus('Hero image uploaded successfully. Save your website to publish it.');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus(null);
    } finally {
      event.target.value = '';
    }
  };

  const handleHeroCarouselUpload = async event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!authToken) {
      setError('Please sign in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading hero carousel images…');
      const uploadedImages = await Promise.all(
        files.map(async file => {
          const url = await uploadImage(file);
          return { url, alt: file.name };
        })
      );

      setForm(prev => ({
        ...prev,
        content: {
          ...prev.content,
          heroCarousel: {
            ...prev.content.heroCarousel,
            images: [...(prev.content.heroCarousel?.images || []), ...uploadedImages]
          }
        }
      }));
      setStatus('Hero carousel images uploaded successfully. Save your website to publish them.');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus(null);
    } finally {
      event.target.value = '';
    }
  };

  const handleServiceImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setError('Please sign in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading service image…');
      const url = await uploadImage(file);
      setForm(prev => {
        const services = [...prev.content.services];
        services[index] = {
          ...services[index],
          image: {
            url,
            alt: services[index]?.image?.alt || file.name
          }
        };

        return {
          ...prev,
          content: {
            ...prev.content,
            services
          }
        };
      });
      setStatus('Service image uploaded successfully. Save your website to publish it.');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus(null);
    } finally {
      event.target.value = '';
    }
  };

  const handleProductImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setError('Please sign in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus(`Uploading ${isRestaurant ? 'menu' : 'product'} image…`);
      const url = await uploadImage(file);
      setForm(prev => {
        const products = [...prev.content.products];
        products[index] = {
          ...products[index],
          image: {
            url,
            alt: products[index]?.image?.alt || file.name
          }
        };

        return {
          ...prev,
          content: {
            ...prev.content,
            products
          }
        };
      });
      setStatus(`${isRestaurant ? 'Menu' : 'Product'} image uploaded successfully. Save your website to publish it.`);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus(null);
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError(null);

    if (!authToken || !tenantId) {
      setError('Please sign in before creating or editing your website.');
      setStatus(null);
      return;
    }

    const payload = {
      ...form,
      owner: {
        ...form.owner,
        ...(form.owner.password ? {} : { password: undefined })
      },
      content: {
        ...form.content,
        heroImage: form.content.heroImage?.url ? form.content.heroImage : { url: '', alt: '' },
        heroCarousel: {
          direction: form.content.heroCarousel?.direction === 'upward' ? 'upward' : 'side',
          speed: Math.min(Math.max(Number(form.content.heroCarousel?.speed) || 4, 1), 15),
          images: (form.content.heroCarousel?.images || []).filter(image => image.url)
        },
        services: form.content.services.filter(service => service.title || service.description || service.image?.url),
        products: form.content.products.filter(
          product => product.title || product.description || product.category || product.image?.url
        )
      }
    };

    try {
      setIsSaving(true);
      setStatus(websiteCreated ? 'Updating website…' : 'Creating website…');
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Failed to save website. Review the form and try again.');
        setStatus(null);
        return;
      }

      localStorage.setItem('currentTenant', JSON.stringify(data));
      setTenantId(data._id);
      setWebsiteCreated(Boolean(data.websiteCreated));
      updateFormFromTenant(data);
      setStatus(websiteCreated ? 'Website updated successfully.' : 'Website created successfully.');
    } catch (err) {
      console.error(err);
      setError('Unable to save your website. Check your connection and try again.');
      setStatus(null);
    } finally {
      setIsSaving(false);
    }
  };

  const saveButtonLabel = isSaving ? (websiteCreated ? 'Updating Website…' : 'Creating Website…') : websiteCreated ? 'Update Website' : 'Create Website';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentTenant');
    router.push('/auth');
  };

  if (checkingAuth) {
    return (
      <main className="container py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-slate-600">Checking your account…</p>
        </div>
      </main>
    );
  }

  if (!authToken) {
    return (
      <main className="container py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-balance text-3xl font-bold">Login Required</h1>
          <p className="mt-3 text-slate-600">
            Sign in first, then create your website. After login, only you can edit your own website.
          </p>
          <div className="mt-6">
            <Link
              href="/auth"
              className="inline-block rounded-full bg-[var(--primary)] px-6 py-3 text-white transition-[background-color,transform] duration-200 hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Go To Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-balance text-3xl font-bold">{websiteCreated ? 'Edit Website' : 'Create Website'}</h1>
              <p className="mt-2 break-words text-slate-600">
                You are logged in as <span className="font-medium text-slate-900">{form.owner.email}</span>.{' '}
                {websiteCreated ? 'Update your website details here.' : 'Complete your website details to publish your site.'}
              </p>
            </div>
            <button type="button" onClick={handleLogout} className={secondaryButtonClass}>
              Sign Out
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                hasUnsavedChanges ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {hasUnsavedChanges ? 'Unsaved Changes' : 'All Changes Saved'}
            </span>
            <span className="text-sm text-slate-500">
              Leaving this page before saving will show a browser warning.
            </span>
          </div>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {error || status || ''}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8" aria-busy={isSaving}>
            <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-balance text-xl font-semibold">Website Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <LabeledInput
                  label="Business Name"
                  name="businessName"
                  autoComplete="organization"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="SmileCare Clinic…"
                  required
                />

                <LabeledInput
                  label="Slug"
                  name="slug"
                  autoComplete="off"
                  spellCheck={false}
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                  placeholder="smilecare…"
                  required
                />

                <LabeledInput
                  label="Subdomain"
                  name="subdomain"
                  autoComplete="off"
                  spellCheck={false}
                  value={form.subdomain}
                  onChange={e => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
                  placeholder="smilecare…"
                  required
                />

                <LabeledSelect
                  label="Business Type"
                  name="businessType"
                  value={form.businessType}
                  onChange={e => setForm({ ...form, businessType: e.target.value })}
                >
                  <option value="doctor">Doctor</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="shopping">Shopping</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="small-business">Small Business</option>
                </LabeledSelect>
              </div>

              <p className="text-sm text-slate-500">{businessTypeHelp[form.businessType]}</p>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-700">Owner Email</p>
                <p className="mt-1 break-words font-semibold text-slate-900">{form.owner.email}</p>
                <div className="mt-4">
                  <LabeledInput
                    label="New Password"
                    hint="Leave this blank to keep your current password."
                    type="password"
                    name="ownerPassword"
                    autoComplete="new-password"
                    value={form.owner.password}
                    onChange={e => handleOwnerChange('password', e.target.value)}
                    placeholder="Create a stronger password…"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-balance text-xl font-semibold">Website Content</h2>

              <LabeledInput
                label="Homepage Title"
                name="contentTitle"
                autoComplete="off"
                value={form.content.title}
                onChange={e => handleContentChange('title', e.target.value)}
                placeholder="Welcome to SmileCare…"
              />

              <LabeledTextarea
                label="Homepage Description"
                name="contentDescription"
                autoComplete="off"
                rows="4"
                value={form.content.description}
                onChange={e => handleContentChange('description', e.target.value)}
                placeholder="Describe your business, audience, and core services…"
              />

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div>
                  <h3 className="text-lg font-semibold">Hero Image</h3>
                  <p className="mt-1 text-sm text-slate-600">This image appears in the main hero section of your homepage.</p>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Upload Hero Image</span>
                  <input
                    type="file"
                    name="heroImageUpload"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700`}
                  />
                  <p className={uploadHintClass}>Upload a wide image for the strongest homepage presentation.</p>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <LabeledInput
                    label="Hero Image Alt Text"
                    name="heroImageAlt"
                    autoComplete="off"
                    value={form.content.heroImage.alt}
                    onChange={e => handleHeroImageChange('alt', e.target.value)}
                    placeholder="Dentist greeting a patient in a bright clinic…"
                  />

                  <LabeledInput
                    label="Hero Image URL"
                    name="heroImageUrl"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    value={form.content.heroImage.url}
                    onChange={e => handleHeroImageChange('url', e.target.value)}
                    placeholder="https://example.com/hero-image.jpg…"
                  />
                </div>

                {form.content.heroImage.url ? (
                  <img
                    src={form.content.heroImage.url}
                    alt={form.content.heroImage.alt || 'Hero preview'}
                    width="1200"
                    height="560"
                    loading="lazy"
                    className="h-56 w-full rounded-3xl object-cover"
                  />
                ) : null}
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div>
                  <h3 className="text-lg font-semibold">Hero Carousel</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Add multiple hero images and choose whether they slide from the side or upward.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Upload Carousel Images</span>
                    <input
                      type="file"
                      name="heroCarouselUpload"
                      accept="image/*"
                      multiple
                      onChange={handleHeroCarouselUpload}
                      className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700`}
                    />
                    <p className={uploadHintClass}>Select multiple images at once, then upload more later if needed.</p>
                  </label>

                  <div className="space-y-4">
                    <LabeledSelect
                      label="Slide Direction"
                      name="heroCarouselDirection"
                      value={form.content.heroCarousel.direction}
                      onChange={e => handleHeroCarouselChange('direction', e.target.value)}
                    >
                      <option value="side">Side</option>
                      <option value="upward">Upward</option>
                    </LabeledSelect>

                    <LabeledInput
                      label="Slide Speed In Seconds"
                      name="heroCarouselSpeed"
                      type="number"
                      min="1"
                      max="15"
                      step="1"
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.content.heroCarousel.speed}
                      onChange={e => handleHeroCarouselChange('speed', e.target.value)}
                      placeholder="4…"
                    />
                  </div>
                </div>

                <button type="button" onClick={addEmptyHeroCarouselImage} className={secondaryButtonClass}>
                  Add Carousel Slide
                </button>

                {form.content.heroCarousel.images.length > 0 ? (
                  <div className="space-y-4">
                    {form.content.heroCarousel.images.map((image, index) => (
                      <div key={`${image.url}-${index}`} className="rounded-3xl border border-slate-200 p-4">
                        <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
                          <img
                            src={image.url}
                            alt={image.alt || `Hero slide ${index + 1}`}
                            width="320"
                            height="200"
                            loading="lazy"
                            className="h-40 w-full rounded-2xl object-cover"
                          />

                          <div className="space-y-3 min-w-0">
                            <LabeledInput
                              label="Slide Alt Text"
                              name={`heroSlideAlt${index}`}
                              autoComplete="off"
                              value={image.alt || ''}
                              onChange={e => handleHeroCarouselImageChange(index, 'alt', e.target.value)}
                              placeholder={`Hero slide ${index + 1} description…`}
                            />

                            <LabeledInput
                              label="Slide Image URL"
                              name={`heroSlideUrl${index}`}
                              type="url"
                              inputMode="url"
                              autoComplete="off"
                              spellCheck={false}
                              value={image.url || ''}
                              onChange={e => handleHeroCarouselImageChange(index, 'url', e.target.value)}
                              placeholder="https://example.com/slide-image.jpg…"
                            />

                            <button type="button" onClick={() => removeHeroCarouselImage(index)} className={dangerButtonClass}>
                              Remove Slide
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No hero carousel images added yet.</p>
                )}
              </div>

              {!isRestaurant && !isShopping ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">Services</h3>
                    <button type="button" onClick={addService} className={actionButtonClass}>
                      Add Service
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.content.services.map((service, index) => (
                      <div key={index} className="rounded-3xl border border-slate-300 bg-white p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <LabeledInput
                            label={`Service ${index + 1} Title`}
                            name={`serviceTitle${index}`}
                            autoComplete="off"
                            value={service.title}
                            onChange={e => handleServiceChange(index, 'title', e.target.value)}
                            placeholder="Consultation & planning…"
                          />

                          <LabeledInput
                            label={`Service ${index + 1} Description`}
                            name={`serviceDescription${index}`}
                            autoComplete="off"
                            value={service.description}
                            onChange={e => handleServiceChange(index, 'description', e.target.value)}
                            placeholder="Tell visitors what this service includes…"
                          />
                        </div>

                        <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">Service Image</p>
                            <p className="mt-1 text-sm text-slate-500">Add an image only if you want this service card to show one.</p>
                          </div>

                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">Upload Service Image</span>
                            <input
                              type="file"
                              name={`serviceImageUpload${index}`}
                              accept="image/*"
                              onChange={e => handleServiceImageUpload(index, e)}
                              className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700`}
                            />
                          </label>

                          <div className="grid gap-4 md:grid-cols-2">
                            <LabeledInput
                              label="Service Image URL"
                              name={`serviceImageUrl${index}`}
                              type="url"
                              inputMode="url"
                              autoComplete="off"
                              spellCheck={false}
                              value={service.image?.url || ''}
                              onChange={e => handleServiceImageChange(index, 'url', e.target.value)}
                              placeholder="https://example.com/service-image.jpg…"
                            />

                            <LabeledInput
                              label="Service Image Alt Text"
                              name={`serviceImageAlt${index}`}
                              autoComplete="off"
                              value={service.image?.alt || ''}
                              onChange={e => handleServiceImageChange(index, 'alt', e.target.value)}
                              placeholder="Person reviewing campaign results…"
                            />
                          </div>

                          {service.image?.url ? (
                            <img
                              src={service.image.url}
                              alt={service.image.alt || `Service ${index + 1}`}
                              width="720"
                              height="352"
                              loading="lazy"
                              className="h-44 w-full rounded-2xl object-cover"
                            />
                          ) : null}
                        </div>

                        <button type="button" onClick={() => removeService(index)} className={`mt-3 ${dangerButtonClass}`}>
                          Remove Service
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{productSectionTitle}</h3>
                      <p className="mt-1 text-sm text-slate-500">{productSectionDescription}</p>
                    </div>
                    <button type="button" onClick={addProduct} className={actionButtonClass}>
                      {isRestaurant ? 'Add Menu Item' : 'Add Product'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.content.products.map((product, index) => (
                      <div key={index} className="rounded-3xl border border-slate-300 bg-white p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <LabeledInput
                            label={`${isRestaurant ? 'Menu Item' : 'Product'} Name`}
                            name={`productTitle${index}`}
                            autoComplete="off"
                            value={product.title}
                            onChange={e => handleProductChange(index, 'title', e.target.value)}
                            placeholder={isRestaurant ? 'Truffle pasta…' : 'Signature planner…'}
                          />

                          <LabeledInput
                            label="Category"
                            name={`productCategory${index}`}
                            autoComplete="off"
                            value={product.category || ''}
                            onChange={e => handleProductChange(index, 'category', e.target.value)}
                            placeholder={isRestaurant ? 'Starters, mains, desserts…' : 'Office, lifestyle, essentials…'}
                          />

                          <LabeledTextarea
                            label="Description"
                            name={`productDescription${index}`}
                            autoComplete="off"
                            rows="3"
                            className={`${textAreaClass} md:col-span-2`}
                            value={product.description}
                            onChange={e => handleProductChange(index, 'description', e.target.value)}
                            placeholder={isRestaurant ? 'Describe the ingredients, flavor, or serving style…' : 'Describe the product benefits and details…'}
                          />

                          <LabeledInput
                            label="Price"
                            name={`productPrice${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            autoComplete="off"
                            value={product.price}
                            onChange={e => handleProductChange(index, 'price', e.target.value)}
                            placeholder="19.99…"
                          />
                        </div>

                        <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{isRestaurant ? 'Menu Image' : 'Product Image'}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {isRestaurant
                                ? 'Add an image if you want this item to stand out in the restaurant menu.'
                                : 'Add an image if you want this product card to show one.'}
                            </p>
                          </div>

                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">Upload {isRestaurant ? 'Menu' : 'Product'} Image</span>
                            <input
                              type="file"
                              name={`productImageUpload${index}`}
                              accept="image/*"
                              onChange={e => handleProductImageUpload(index, e)}
                              className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700`}
                            />
                          </label>

                          <div className="grid gap-4 md:grid-cols-2">
                            <LabeledInput
                              label={`${isRestaurant ? 'Menu' : 'Product'} Image URL`}
                              name={`productImageUrl${index}`}
                              type="url"
                              inputMode="url"
                              autoComplete="off"
                              spellCheck={false}
                              value={product.image?.url || ''}
                              onChange={e => handleProductImageChange(index, 'url', e.target.value)}
                              placeholder="https://example.com/product-image.jpg…"
                            />

                            <LabeledInput
                              label={`${isRestaurant ? 'Menu' : 'Product'} Image Alt Text`}
                              name={`productImageAlt${index}`}
                              autoComplete="off"
                              value={product.image?.alt || ''}
                              onChange={e => handleProductImageChange(index, 'alt', e.target.value)}
                              placeholder={isRestaurant ? 'Plated pasta with basil garnish…' : 'Planner cover with weekly layout…'}
                            />
                          </div>

                          {product.image?.url ? (
                            <img
                              src={product.image.url}
                              alt={product.image.alt || `${product.title || 'Product'} preview`}
                              width="720"
                              height="352"
                              loading="lazy"
                              className="h-44 w-full rounded-2xl object-cover"
                            />
                          ) : null}
                        </div>

                        <button type="button" onClick={() => removeProduct(index)} className={`mt-3 ${dangerButtonClass}`}>
                          Remove {isRestaurant ? 'Menu Item' : 'Product'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div>
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <p className="mt-1 text-sm text-slate-500">This information appears on your site so customers can reach you quickly.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <LabeledInput
                    label="Phone"
                    name="contactPhone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.content.contactInfo.phone}
                    onChange={e => handleContactInfoChange('phone', e.target.value)}
                    placeholder="+91 98765 43210…"
                  />

                  <LabeledInput
                    label="Email"
                    name="contactEmail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={form.content.contactInfo.email}
                    onChange={e => handleContactInfoChange('email', e.target.value)}
                    placeholder="hello@smilecare.com…"
                  />

                  <LabeledInput
                    label="Address"
                    name="contactAddress"
                    autoComplete="street-address"
                    value={form.content.contactInfo.address}
                    onChange={e => handleContactInfoChange('address', e.target.value)}
                    placeholder="12 Park Street, Kolkata…"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div>
                  <h3 className="text-lg font-semibold">Gallery Images</h3>
                  <p className="mt-1 text-sm text-slate-500">Add extra images for galleries, highlights, and supporting sections.</p>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Upload Gallery Image</span>
                  <input
                    type="file"
                    name="galleryImageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700`}
                  />
                </label>

                {form.content.images.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {form.content.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={image.alt || `Upload ${index + 1}`}
                        width="480"
                        height="320"
                        loading="lazy"
                        className="h-40 w-full rounded-3xl object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No gallery images uploaded yet.</p>
                )}
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-balance text-xl font-semibold">Theme</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <LabeledInput
                  label="Primary Color"
                  name="primaryColor"
                  type="color"
                  value={form.theme.primaryColor}
                  onChange={e => handleFieldChange('theme', 'primaryColor', e.target.value)}
                  className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-2 py-2 shadow-sm transition-[border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                />

                <LabeledInput
                  label="Secondary Color"
                  name="secondaryColor"
                  type="color"
                  value={form.theme.secondaryColor}
                  onChange={e => handleFieldChange('theme', 'secondaryColor', e.target.value)}
                  className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-2 py-2 shadow-sm transition-[border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                />

                <LabeledInput
                  label="Font Family"
                  name="fontFamily"
                  autoComplete="off"
                  value={form.theme.fontFamily}
                  onChange={e => handleFieldChange('theme', 'fontFamily', e.target.value)}
                  placeholder="Outfit, sans-serif…"
                />

                <LabeledSelect
                  label="Layout"
                  name="layout"
                  value={form.theme.layout}
                  onChange={e => handleFieldChange('theme', 'layout', e.target.value)}
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </LabeledSelect>
              </div>
            </section>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" disabled={isSaving} className="rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70">
                {saveButtonLabel}
              </button>

              {websiteCreated && form.slug ? (
                <Link href={`/site/${form.slug}`} className={secondaryButtonClass}>
                  Open Published Website
                </Link>
              ) : null}
            </div>

            {status ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}
          </form>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <h2 className="text-balance text-xl font-semibold text-slate-900">Live Preview</h2>
                <p className="mt-1 text-sm text-slate-600">Preview your site while you create or edit it.</p>
              </div>

              {websiteCreated && form.slug ? (
                <Link href={`/site/${form.slug}`} className={secondaryButtonClass}>
                  Open Page
                </Link>
              ) : null}
            </div>

            <div className="max-h-[85vh] overflow-auto bg-slate-100">
              <div className="min-w-[720px] origin-top-left scale-[0.42] sm:scale-[0.52] lg:scale-[0.6] xl:scale-[0.48] 2xl:scale-[0.58]">
                <div className="w-[1680px]">
                  <WebsiteRenderer tenant={previewTenant} />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
