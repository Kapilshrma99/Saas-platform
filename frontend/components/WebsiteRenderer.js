'use client';
import { useEffect } from 'react';
import BookingForm from './BookingForm';
import { applyTheme } from '../services/theme';

export default function WebsiteRenderer({ tenant }) {
  useEffect(() => {
    if (tenant?.theme) {
      applyTheme(tenant.theme);
    }
  }, [tenant]);

  if (!tenant) {
    return (
      <main className="container">
        <div className="rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Tenant not found</h1>
          <p className="mt-3 text-slate-600">Check your slug or subdomain and try again.</p>
        </div>
      </main>
    );
  }

  const { content, subscription } = tenant;
  const services = content?.services?.length ? content.services : [{ title: 'Service 1', description: 'Describe your first service.' }];
  const products = content?.products?.length ? content.products : [{ title: 'Sample Product', description: 'Add products in your dashboard for shopping websites.', price: 0 }];

  const renderHeroSubtitle = () => {
    switch (tenant.businessType) {
      case 'doctor':
        return 'Health & Appointments';
      case 'restaurant':
        return 'Reserve Your Table';
      case 'shopping':
        return 'Shop Our Best Items';
      case 'freelancer':
        return 'Professional Services';
      default:
        return 'Business Services';
    }
  };

  const renderBusinessSection = () => {
    switch (tenant.businessType) {
      case 'doctor':
        return (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Medical Services</h2>
              <p className="mt-4 text-slate-600">{content?.description || 'Expert care for your patients, with easy appointment booking.'}</p>
              <div className="mt-6 space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="mt-2 text-slate-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <BookingForm tenant={tenant} />
          </section>
        );
      case 'restaurant':
        return (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Today's Menu</h2>
              <div className="mt-6 space-y-4">
                {services.map((item, index) => (
                  <div key={index} className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <BookingForm tenant={tenant} />
          </section>
        );
      case 'shopping':
        return (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Featured Products</h2>
              <div className="mt-6 space-y-4">
                {products.map((product, index) => (
                  <div key={index} className="rounded-3xl bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl font-semibold">{product.title}</h3>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium">${product.price || '0.00'}</span>
                    </div>
                    <p className="mt-2 text-slate-600">{product.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Contact & Support</h2>
              <p className="mt-4 text-slate-600">{content?.description || 'Need help with an order? Reach out and we will assist you.'}</p>
              <div className="mt-6 space-y-3 text-slate-700">
                <p><span className="font-semibold">Phone:</span> {content?.contactInfo?.phone || 'Not set'}</p>
                <p><span className="font-semibold">Email:</span> {content?.contactInfo?.email || 'Not set'}</p>
                <p><span className="font-semibold">Address:</span> {content?.contactInfo?.address || 'Not set'}</p>
              </div>
            </div>
          </section>
        );
      default:
        return (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">What We Offer</h2>
              <div className="mt-6 space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="mt-2 text-slate-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <BookingForm tenant={tenant} />
          </section>
        );
    }
  };

  return (
    <main className="container space-y-12">
      <section className="rounded-3xl border border-slate-200 p-10 shadow-sm">
        <header className="space-y-4">
          <p className="uppercase text-sm tracking-[0.3em] text-primary">{renderHeroSubtitle()}</p>
          <h1 className="text-5xl font-bold">{content?.title || tenant.name}</h1>
          <p className="text-lg text-slate-700">{content?.description || 'A beautiful website built for your business.'}</p>
        </header>
      </section>
      {renderBusinessSection()}
      <section className="rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Gallery</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(content?.images || []).map((image, index) => (
            <div key={index} className="overflow-hidden rounded-3xl bg-slate-100">
              <img src={image.url} alt={image.alt || `Image ${index + 1}`} className="h-48 w-full object-cover" />
            </div>
          ))}
          {content?.images?.length === 0 && <p className="text-slate-500">Upload images in dashboard to showcase your business.</p>}
        </div>
      </section>
      <footer className="rounded-3xl border border-slate-200 p-8 text-slate-700 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">Contact</p>
            <p>{content?.contactInfo?.phone || 'Phone not set'}</p>
            <p>{content?.contactInfo?.email || 'Email not set'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Subscription: {subscription?.status || 'inactive'}</p>
            <p className="text-sm text-slate-500">Plan: {subscription?.plan || 'basic'}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
