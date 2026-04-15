'use client';
import { useEffect, useMemo, useState } from 'react';
import BookingForm from './BookingForm';
import { applyTheme } from '../services/theme';

const sitePages = [
  { id: 'front-page', label: 'Front Page' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'about-us', label: 'About Us' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'ai-mode', label: 'AI Mode' },
  { id: 'help', label: 'Help' },
  { id: 'policy', label: 'Policy' },
  { id: 'terms', label: 'Terms & Conditions' }
];

function formatPlan(plan) {
  if (!plan) return 'Basic';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function getHeroSubtitle(businessType) {
  switch (businessType) {
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
}

function getBusinessSection(tenant, content, services, products) {
  switch (tenant.businessType) {
    case 'doctor':
      return (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Medical Services</h2>
            <p className="mt-4 text-slate-600">
              {content?.description || 'Expert care for your patients, with easy appointment booking.'}
            </p>
            <div className="mt-6 space-y-4">
              {services.map((service, index) => (
                <div key={index} className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
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
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Today&apos;s Menu</h2>
            <div className="mt-6 space-y-4">
              {services.map((item, index) => (
                <div key={index} className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
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
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Featured Products</h2>
            <div className="mt-6 space-y-4">
              {products.map((product, index) => (
                <div key={index} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-slate-900">{product.title}</h3>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                      ${product.price || '0.00'}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-600">{product.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Contact & Support</h2>
            <p className="mt-4 text-slate-600">
              {content?.description || 'Need help with an order? Reach out and we will assist you.'}
            </p>
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
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">What We Offer</h2>
            <div className="mt-6 space-y-4">
              {services.map((service, index) => (
                <div key={index} className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
                  <p className="mt-2 text-slate-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
          <BookingForm tenant={tenant} />
        </section>
      );
  }
}

function SectionShell({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function WebsiteRenderer({ tenant }) {
  const [activePage, setActivePage] = useState('front-page');

  useEffect(() => {
    if (tenant?.theme) {
      applyTheme(tenant.theme);
    }
  }, [tenant]);

  useEffect(() => {
    setActivePage('front-page');
  }, [tenant?._id]);

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
  const services = content?.services?.length
    ? content.services
    : [{ title: 'Service 1', description: 'Describe your first service.' }];
  const products = content?.products?.length
    ? content.products
    : [{ title: 'Sample Product', description: 'Add products in your dashboard for shopping websites.', price: 0 }];
  const stats = useMemo(
    () => [
      { label: 'Business Type', value: tenant.businessType || 'General' },
      { label: 'Services', value: String(services.length) },
      { label: 'Gallery Items', value: String(content?.images?.length || 0) },
      { label: 'Plan', value: formatPlan(subscription?.plan) }
    ],
    [content?.images?.length, services.length, subscription?.plan, tenant.businessType]
  );

  const renderFrontPage = () => (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <header className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              {getHeroSubtitle(tenant.businessType)}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              {content?.title || tenant.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              {content?.description || 'A beautiful website built for your business.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActivePage('about-us')}
                className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Explore Brand
              </button>
              <button
                type="button"
                onClick={() => setActivePage('help')}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Need Help
              </button>
            </div>
          </header>
          <div className="grid gap-4">
            {stats.map(item => (
              <div key={item.label} className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {getBusinessSection(tenant, content, services, products)}

      <SectionShell
        eyebrow="Showcase"
        title="Gallery"
        description="Visual proof of your brand, work, or customer experience. Upload images in the dashboard to make this section feel truly yours."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(content?.images || []).map((image, index) => (
            <div key={index} className="overflow-hidden rounded-3xl bg-slate-100">
              <img src={image.url} alt={image.alt || `Image ${index + 1}`} className="h-48 w-full object-cover" />
            </div>
          ))}
          {content?.images?.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500">
              Upload images in the dashboard to showcase your business.
            </div>
          )}
        </div>
      </SectionShell>
    </div>
  );

  const renderIntroductionPage = () => (
    <SectionShell
      eyebrow="Introduction"
      title={`Welcome to ${tenant.name}`}
      description="This page gives visitors a quick understanding of who you are, what you do, and why your business matters before they explore the rest of the site."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Who We Are</h3>
          <p className="mt-3 text-slate-600">
            {tenant.name} is a modern {tenant.businessType || 'business'} brand focused on clarity, consistency, and customer trust.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">What We Deliver</h3>
          <p className="mt-3 text-slate-600">
            We turn your core offer into a clear online experience with service highlights, gallery content, bookings, and branded presentation.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">How To Start</h3>
          <p className="mt-3 text-slate-600">
            Browse the front page, review the services, then use the help or booking sections if you want to contact the team quickly.
          </p>
        </div>
      </div>
    </SectionShell>
  );

  const renderAboutPage = () => (
    <SectionShell
      eyebrow="About Us"
      title="A stronger story behind the brand"
      description="Use this area to explain your mission, values, and the promise you make to every customer. For now it is generated from the tenant profile so every site has a usable About page."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">Our Story</h3>
            <p className="mt-3 leading-7 text-slate-600">
              {tenant.name} was built to create a more polished, trustworthy online presence. This website highlights the business through clean design,
              focused messaging, and a customer-friendly journey.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">What Customers Can Expect</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-900">Clarity</p>
                <p className="mt-2 text-sm text-slate-600">Easy-to-understand services, products, and next steps.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-900">Consistency</p>
                <p className="mt-2 text-sm text-slate-600">A branded experience across every section of the website.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-900">Responsiveness</p>
                <p className="mt-2 text-sm text-slate-600">Clear contact options for questions, bookings, and support.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-900">Growth</p>
                <p className="mt-2 text-sm text-slate-600">A setup that can evolve as the business expands.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Quick Facts</p>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm text-white/60">Brand Name</p>
              <p className="text-xl font-semibold">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Business Type</p>
              <p className="text-xl font-semibold capitalize">{tenant.businessType}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Public Slug</p>
              <p className="text-xl font-semibold">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Subdomain</p>
              <p className="text-xl font-semibold">{tenant.subdomain}</p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );

  const renderDashboardPage = () => (
    <SectionShell
      eyebrow="Dashboard"
      title="Business snapshot"
      description="This is a lightweight public-facing dashboard view that summarizes content, site readiness, and contact details without exposing private controls."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Website Health</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white p-4">
              <span className="text-slate-600">Subscription</span>
              <span className="font-semibold capitalize text-slate-900">{subscription?.status || 'inactive'}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white p-4">
              <span className="text-slate-600">Current Plan</span>
              <span className="font-semibold text-slate-900">{formatPlan(subscription?.plan)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white p-4">
              <span className="text-slate-600">Services Listed</span>
              <span className="font-semibold text-slate-900">{services.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white p-4">
              <span className="text-slate-600">Images Uploaded</span>
              <span className="font-semibold text-slate-900">{content?.images?.length || 0}</span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Contact Overview</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-2 font-semibold text-slate-900">{content?.contactInfo?.phone || 'Phone not set'}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 font-semibold text-slate-900">{content?.contactInfo?.email || 'Email not set'}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-slate-500">Address</p>
              <p className="mt-2 font-semibold text-slate-900">{content?.contactInfo?.address || 'Address not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );

  const renderAiModePage = () => (
    <SectionShell
      eyebrow="AI Mode"
      title="AI-assisted growth mode"
      description="This page presents the site as an intelligent digital assistant for the business, highlighting where automation and AI can improve conversion, support, and content quality."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <h3 className="text-xl font-semibold">Smart Copy</h3>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Generate sharper headlines, cleaner service descriptions, and stronger calls to action for every page.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">AI Recommendations</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Suggest improvements based on missing images, weak descriptions, incomplete contact details, or low content depth.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Visitor Assistance</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Offer instant answers about services, pricing, bookings, and next steps through an AI-powered support flow.
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Suggested AI Actions</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 text-slate-600">
            Write an About Us page based on business type and current services.
          </div>
          <div className="rounded-2xl bg-white p-4 text-slate-600">
            Improve SEO titles and descriptions for the front page and policy sections.
          </div>
          <div className="rounded-2xl bg-white p-4 text-slate-600">
            Create quick customer support responses for the help page.
          </div>
          <div className="rounded-2xl bg-white p-4 text-slate-600">
            Recommend missing media or trust-building content based on site completeness.
          </div>
        </div>
      </div>
    </SectionShell>
  );

  const renderHelpPage = () => (
    <SectionShell
      eyebrow="Help"
      title="How can we help?"
      description="A clear support page reduces friction. Visitors can understand the next step immediately, whether they want information, booking help, or direct contact."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Support Channels</h3>
          <div className="mt-5 space-y-4 text-slate-600">
            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-slate-900">Phone Support</p>
              <p className="mt-2">{content?.contactInfo?.phone || 'Phone not set'}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-slate-900">Email Support</p>
              <p className="mt-2">{content?.contactInfo?.email || 'Email not set'}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-slate-900">Office Address</p>
              <p className="mt-2">{content?.contactInfo?.address || 'Address not set'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h3>
          <div className="mt-5 space-y-4">
            {[
              ['How do I book a service?', 'Use the front page booking form or contact the business directly through the listed support channels.'],
              ['Where can I see pricing or offerings?', 'Your services and products appear on the front page and can be expanded as content is added in the dashboard.'],
              ['How quickly will I get a response?', 'Response times depend on the business workflow, but the help page provides the best direct contact options.']
            ].map(([question, answer]) => (
              <div key={question} className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-900">{question}</p>
                <p className="mt-2 text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );

  const renderPolicyPage = () => (
    <SectionShell
      eyebrow="Policy"
      title="Policy overview"
      description="This page gives you a professional policy presence even before custom legal text is added. It can later be replaced with business-specific privacy, refund, and data handling policies."
    >
      <div className="space-y-4">
        {[
          {
            title: 'Privacy',
            body: 'Customer information submitted through this website is used only for communication, booking coordination, and service delivery unless otherwise stated.'
          },
          {
            title: 'Data Handling',
            body: 'Operational data such as contact submissions and bookings may be stored securely to help the business manage customer interactions.'
          },
          {
            title: 'Service Policy',
            body: 'Availability, turnaround times, pricing, and fulfillment terms may vary based on the business category and should be confirmed directly when needed.'
          }
        ].map(section => (
          <div key={section.title} className="rounded-3xl bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );

  const renderTermsPage = () => (
    <SectionShell
      eyebrow="Terms"
      title="Terms & Conditions"
      description="These default terms help establish expectations for site usage and customer interaction. They are general placeholders and can be customized later for each tenant."
    >
      <div className="grid gap-4">
        {[
          'By using this website, visitors agree to use the content and services lawfully and respectfully.',
          'Bookings, product availability, and support commitments are subject to confirmation by the business.',
          'Published content may be updated, revised, or removed at any time to reflect current offerings or business policies.',
          'If you have questions about services or obligations, contact the business directly using the details on the Help page.'
        ].map(item => (
          <div key={item} className="rounded-2xl bg-slate-50 p-5 text-slate-600">
            {item}
          </div>
        ))}
      </div>
    </SectionShell>
  );

  const pageContent = {
    'front-page': renderFrontPage(),
    introduction: renderIntroductionPage(),
    'about-us': renderAboutPage(),
    dashboard: renderDashboardPage(),
    'ai-mode': renderAiModePage(),
    help: renderHelpPage(),
    policy: renderPolicyPage(),
    terms: renderTermsPage()
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.05),_transparent_35%),linear-gradient(180deg,_#ffffff,_#f8fafc)]">
      <div className="container space-y-8 py-8">
        <header className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Website Mode</p>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{tenant.name}</h1>
              <p className="mt-2 text-slate-600">
                Browse dedicated pages for company story, support, policy, dashboard, and AI-led presentation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sitePages.map(page => {
                const isActive = page.id === activePage;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => setActivePage(page.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-lg'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {pageContent[activePage]}

        <footer className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">Contact</p>
              <p>{content?.contactInfo?.phone || 'Phone not set'}</p>
              <p>{content?.contactInfo?.email || 'Email not set'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Subscription: {subscription?.status || 'inactive'}</p>
              <p className="text-sm text-slate-500">Plan: {subscription?.plan || 'basic'}</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
