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

export default function DashboardPage() {
  const [form, setForm] = useState(initialForm);
  const [tenantId, setTenantId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [websiteCreated, setWebsiteCreated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const isRestaurant = form.businessType === 'restaurant';
  const isShopping = form.businessType === 'shopping';
  const businessTypeHelp = {
    doctor: 'Best for clinics, doctors, and appointment-based healthcare websites.',
    restaurant: 'Best for food businesses that show menu items and take meal orders.',
    shopping: 'Best for ecommerce stores that list products and accept customer orders.',
    freelancer: 'Best for personal services, portfolios, and direct client enquiries.',
    'small-business': 'Best for local businesses that mainly need services, contact info, and branding.'
  };
  const productSectionTitle = isRestaurant ? 'Menu Items' : 'Products';
  const productSectionDescription = isRestaurant
    ? 'Create the dishes customers can browse and order from your restaurant website.'
    : 'Create the catalog items you want shoppers to see on your website.';

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
      setError('Unable to load your account.');
    } finally {
      setCheckingAuth(false);
    }
  };

  const updateFormFromTenant = tenant => {
    setForm(prev => ({
      ...prev,
      name: tenant.name || '',
      slug: tenant.slug || '',
      subdomain: tenant.subdomain || '',
      businessType: tenant.businessType || 'freelancer',
      owner: {
        email: tenant.owner?.email || '',
        password: ''
      },
      content: {
        title: tenant.content?.title || '',
        description: tenant.content?.description || '',
        heroImage: tenant.content?.heroImage || { url: '', alt: '' },
        heroCarousel: {
          direction: tenant.content?.heroCarousel?.direction || 'side',
          speed: tenant.content?.heroCarousel?.speed || 4,
          images: tenant.content?.heroCarousel?.images || []
        },
        services: tenant.content?.services?.length
          ? tenant.content.services.map(service => ({
              title: service.title || '',
              description: service.description || '',
              image: {
                url: service.image?.url || '',
                alt: service.image?.alt || ''
              }
            }))
          : [{ title: '', description: '', image: { url: '', alt: '' } }],
        products: tenant.content?.products?.length
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
        images: tenant.content?.images || [],
        contactInfo: tenant.content?.contactInfo || { phone: '', email: '', address: '' }
      },
      theme: {
        primaryColor: tenant.theme?.primaryColor || '#2f80ed',
        secondaryColor: tenant.theme?.secondaryColor || '#f2c94c',
        fontFamily: tenant.theme?.fontFamily || 'Inter, sans-serif',
        layout: tenant.theme?.layout || 'modern'
      }
    }));
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
      throw new Error(data.error || 'Upload failed');
    }
    return data.url;
  };

  const handleImageUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setError('Please log in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading image...');
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
      setError('Please log in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading hero image...');
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
      setError('Please log in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading hero carousel images...');
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
      setError('Please log in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading service image...');
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
      setError('Please log in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading menu image...');
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
      setStatus('Menu image uploaded successfully. Save your website to publish it.');
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
      setError('Please log in before creating or editing your website.');
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

    setStatus(websiteCreated ? 'Updating website...' : 'Creating website...');
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
      setError(data.error || data.message || 'Failed to save website.');
      setStatus(null);
      return;
    }

    localStorage.setItem('currentTenant', JSON.stringify(data));
    setTenantId(data._id);
    setWebsiteCreated(Boolean(data.websiteCreated));
    updateFormFromTenant(data);
    setStatus(websiteCreated ? 'Website updated successfully.' : 'Website created successfully.');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentTenant');
    router.push('/auth');
  };

  if (checkingAuth) {
    return (
      <main className="container py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-slate-600">Checking your account...</p>
        </div>
      </main>
    );
  }

  if (!authToken) {
    return (
      <main className="container py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-bold">Login Required</h1>
          <p className="mt-3 text-slate-600">
            Sign in first, then you can create your website. After login, only you can edit your own website.
          </p>
          <div className="mt-6">
            <Link href="/auth" className="rounded-full bg-primary px-6 py-3 text-white inline-block">
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
        <div className="rounded-3xl border border-slate-200 p-10 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{websiteCreated ? 'Edit Website' : 'Create Website'}</h1>
              <p className="mt-2 text-slate-600">
                You are logged in as {form.owner.email}. {websiteCreated ? 'Update only your own website here.' : 'Complete your website details to publish your site.'}
              </p>
            </div>
            <button type="button" onClick={handleLogout} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm">
              Logout
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
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
                <p className="mt-2 text-sm text-slate-500">{businessTypeHelp[form.businessType]}</p>
              </label>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-700">Owner email</p>
              <p className="mt-1 font-semibold text-slate-900">{form.owner.email}</p>
              <label className="mt-4 block">
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
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold">Website Content</h2>
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

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
              <div>
                <h3 className="text-lg font-semibold">Hero Image</h3>
                <p className="mt-1 text-sm text-slate-600">This image appears in the main hero section of the website homepage.</p>
              </div>
              <input type="file" accept="image/*" onChange={handleHeroImageUpload} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Hero image alt text</span>
                  <input
                    value={form.content.heroImage.alt}
                    onChange={e => handleHeroImageChange('alt', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Describe the hero image"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Hero image URL</span>
                  <input
                    value={form.content.heroImage.url}
                    onChange={e => handleHeroImageChange('url', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="https://..."
                  />
                </label>
              </div>
              {form.content.heroImage.url ? (
                <img
                  src={form.content.heroImage.url}
                  alt={form.content.heroImage.alt || 'Hero preview'}
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
                <div>
                  <span className="text-sm font-medium text-slate-700">Upload hero carousel images</span>
                  <input type="file" accept="image/*" multiple onChange={handleHeroCarouselUpload} className="mt-2 block w-full" />
                  <p className="mt-2 text-sm text-slate-500">You can select multiple images at once and upload more later too.</p>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Slide direction</span>
                    <select
                      value={form.content.heroCarousel.direction}
                      onChange={e => handleHeroCarouselChange('direction', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    >
                      <option value="side">Side</option>
                      <option value="upward">Upward</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Slide speed in seconds</span>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      step="1"
                      value={form.content.heroCarousel.speed}
                      onChange={e => handleHeroCarouselChange('speed', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={addEmptyHeroCarouselImage}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
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
                          className="h-40 w-full rounded-2xl object-cover"
                        />
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">Slide alt text</span>
                            <input
                              value={image.alt || ''}
                              onChange={e => handleHeroCarouselImageChange(index, 'alt', e.target.value)}
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                              placeholder={`Hero slide ${index + 1}`}
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">Slide image URL</span>
                            <input
                              value={image.url || ''}
                              onChange={e => handleHeroCarouselImageChange(index, 'url', e.target.value)}
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                              placeholder="https://..."
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeHeroCarouselImage(index)}
                            className="text-sm font-medium text-red-700"
                          >
                            Remove slide
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
                      <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Service Image (optional)</p>
                          <p className="mt-1 text-sm text-slate-500">Add an image only if you want this service card to show one.</p>
                        </div>
                        <input type="file" accept="image/*" onChange={e => handleServiceImageUpload(index, e)} />
                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            value={service.image?.url || ''}
                            onChange={e => handleServiceImageChange(index, 'url', e.target.value)}
                            className="rounded-xl border border-slate-300 px-4 py-3"
                            placeholder="Service image URL"
                          />
                          <input
                            value={service.image?.alt || ''}
                            onChange={e => handleServiceImageChange(index, 'alt', e.target.value)}
                            className="rounded-xl border border-slate-300 px-4 py-3"
                            placeholder="Service image alt text"
                          />
                        </div>
                        {service.image?.url ? (
                          <img
                            src={service.image.url}
                            alt={service.image.alt || `Service ${index + 1}`}
                            className="h-44 w-full rounded-2xl object-cover"
                          />
                        ) : null}
                      </div>
                      <button type="button" onClick={() => removeService(index)} className="mt-3 text-sm text-red-700">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{productSectionTitle}</h3>
                    <p className="mt-1 text-sm text-slate-500">{productSectionDescription}</p>
                  </div>
                  <button type="button" onClick={addProduct} className="rounded-full bg-primary px-4 py-2 text-white">
                    {isRestaurant ? 'Add Menu Item' : 'Add Product'}
                  </button>
                </div>
                <div className="space-y-4">
                  {form.content.products.map((product, index) => (
                    <div key={index} className="rounded-3xl border border-slate-300 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={product.title}
                          onChange={e => handleProductChange(index, 'title', e.target.value)}
                          className="rounded-xl border border-slate-300 px-4 py-3"
                          placeholder={isRestaurant ? 'Menu item name' : 'Product name'}
                        />
                        <input
                          value={product.category || ''}
                          onChange={e => handleProductChange(index, 'category', e.target.value)}
                          className="rounded-xl border border-slate-300 px-4 py-3"
                          placeholder={isRestaurant ? 'Category e.g. Starters' : 'Category'}
                        />
                        <textarea
                          value={product.description}
                          onChange={e => handleProductChange(index, 'description', e.target.value)}
                          className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
                          rows="3"
                          placeholder={isRestaurant ? 'Describe the dish' : 'Describe the product'}
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.price}
                          onChange={e => handleProductChange(index, 'price', e.target.value)}
                          className="rounded-xl border border-slate-300 px-4 py-3"
                          placeholder="Price"
                        />
                      </div>
                      <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{isRestaurant ? 'Menu Image (optional)' : 'Product Image (optional)'}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {isRestaurant
                              ? 'Add an image if you want this item to stand out in the restaurant menu.'
                              : 'Add an image if you want this product card to show one.'}
                          </p>
                        </div>
                        <input type="file" accept="image/*" onChange={e => handleProductImageUpload(index, e)} />
                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            value={product.image?.url || ''}
                            onChange={e => handleProductImageChange(index, 'url', e.target.value)}
                            className="rounded-xl border border-slate-300 px-4 py-3"
                            placeholder={isRestaurant ? 'Menu image URL' : 'Product image URL'}
                          />
                          <input
                            value={product.image?.alt || ''}
                            onChange={e => handleProductImageChange(index, 'alt', e.target.value)}
                            className="rounded-xl border border-slate-300 px-4 py-3"
                            placeholder={isRestaurant ? 'Menu image alt text' : 'Product image alt text'}
                          />
                        </div>
                        {product.image?.url ? (
                          <img
                            src={product.image.url}
                            alt={product.image.alt || `${product.title || 'Product'} preview`}
                            className="h-44 w-full rounded-2xl object-cover"
                          />
                        ) : null}
                      </div>
                      <button type="button" onClick={() => removeProduct(index)} className="mt-3 text-sm text-red-700">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images</h3>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {form.content.images.map((image, index) => (
                  <img key={index} src={image.url} alt={image.alt || `Upload ${index + 1}`} className="h-40 w-full rounded-3xl object-cover" />
                ))}
              </div>
            </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
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
                {websiteCreated ? 'Update Website' : 'Create Website'}
              </button>
              {websiteCreated && (
                <button type="button" onClick={() => router.push(`/site/${form.slug}`)} className="rounded-full border border-slate-300 px-6 py-3">
                  Open Published Website
                </button>
              )}
            </div>

            {status && <p className="text-sm text-green-700">{status}</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Live Preview</h2>
                <p className="mt-1 text-sm text-slate-600">
                  The owner can see the website here while creating or editing it.
                </p>
              </div>
              {websiteCreated && form.slug ? (
                <button
                  type="button"
                  onClick={() => router.push(`/site/${form.slug}`)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm"
                >
                  Open Page
                </button>
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
