'use client';

import { useEffect, useMemo, useState } from 'react';
import BookingForm from './BookingForm';
import { applyTheme } from '../services/theme';

const sitePages = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'offerings', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' }
];

const businessPresets = {
  doctor: {
    badge: 'Care Studio',
    offeringLabel: 'Treatments',
    homeTitle: 'Modern care, calm experience, trusted expertise.',
    homeDescription: 'Create a reassuring digital presence with clear services, specialist highlights, and simple appointment paths.',
    sectionTone: 'Clean, calm, and confidence-building presentation for patients and families.',
    surfaceClass:
      'bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,255,255,0.72)),radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_28%)]',
    accentPanelClass: 'bg-slate-950 text-white',
    mutedPanelClass: 'bg-cyan-50/80'
  },
  restaurant: {
    badge: 'Dining House',
    offeringLabel: 'Menu',
    homeTitle: 'Atmosphere, signature dishes, and easy reservations.',
    homeDescription: 'Turn the website into a digital dining experience with richer presentation, featured menu items, and direct bookings.',
    sectionTone: 'Warm, appetizing, and designed to feel like an invitation in.',
    surfaceClass:
      'bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,248,240,0.78)),radial-gradient(circle_at_top_left,rgba(251,146,60,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_28%)]',
    accentPanelClass: 'bg-[#1f1307] text-white',
    mutedPanelClass: 'bg-orange-50/85'
  },
  shopping: {
    badge: 'Storefront',
    offeringLabel: 'Products',
    homeTitle: 'A polished storefront designed to help products stand out.',
    homeDescription: 'Blend visual merchandising, featured items, and a sharper brand voice into one clean customer-facing experience.',
    sectionTone: 'Confident, product-led, and focused on visual clarity.',
    surfaceClass:
      'bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(244,247,255,0.78)),radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_28%)]',
    accentPanelClass: 'bg-slate-950 text-white',
    mutedPanelClass: 'bg-indigo-50/80'
  },
  freelancer: {
    badge: 'Independent Studio',
    offeringLabel: 'Services',
    homeTitle: 'A personal brand presence with clarity and creative confidence.',
    homeDescription: 'Showcase your expertise, your process, and your best offers with a website that feels premium and personal.',
    sectionTone: 'Expressive, sharp, and tailored to solo-brand storytelling.',
    surfaceClass:
      'bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(250,247,255,0.78)),radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.14),transparent_28%)]',
    accentPanelClass: 'bg-slate-950 text-white',
    mutedPanelClass: 'bg-fuchsia-50/70'
  },
  default: {
    badge: 'Brand Website',
    offeringLabel: 'Services',
    homeTitle: 'A stronger digital front door for the business.',
    homeDescription: 'Present your services, visuals, and contact details with a cleaner and more premium customer experience.',
    sectionTone: 'Balanced, premium, and easy for visitors to navigate.',
    surfaceClass:
      'bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(247,249,252,0.78)),radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]',
    accentPanelClass: 'bg-slate-950 text-white',
    mutedPanelClass: 'bg-slate-50/85'
  }
};

function SectionShell({ kicker, title, description, aside, children }) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/72 p-7 shadow-[0_30px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-10">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div>
          {kicker ? <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[var(--primary)]">{kicker}</p> : null}
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">{title}</h2>
          {description ? <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p> : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white/70 p-8 text-slate-500">
      {message}
    </div>
  );
}

function getBusinessTypeLabel(businessType) {
  return businessType ? businessType.replace('-', ' ') : 'business';
}

function getInitials(name) {
  if (!name) return 'BW';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getOfferings(content, businessType) {
  if (businessType === 'shopping') {
    return content?.products?.filter(product => product.title || product.description) || [];
  }
  return content?.services?.filter(service => service.title || service.description) || [];
}

export default function WebsiteRenderer({ tenant }) {
  const [activePage, setActivePage] = useState('home');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  useEffect(() => {
    if (tenant?.theme) {
      applyTheme(tenant.theme);
    }
  }, [tenant]);

  useEffect(() => {
    setActivePage('home');
    setIsNavOpen(false);
    setActiveHeroSlide(0);
  }, [tenant?._id]);

  useEffect(() => {
    setIsNavOpen(false);
  }, [activePage]);

  const content = tenant?.content || {};
  const businessTypeLabel = getBusinessTypeLabel(tenant?.businessType);
  const preset = businessPresets[tenant?.businessType] || businessPresets.default;
  const offerings = getOfferings(content, tenant?.businessType);
  const contactInfo = content.contactInfo || {};
  const images = content.images || [];
  const heroImage = content.heroImage || {};
  const heroCarousel = content.heroCarousel || {};
  const heroSlideDirection = heroCarousel.direction === 'upward' ? 'upward' : 'side';
  const heroSlideSpeed = Math.min(Math.max(Number(heroCarousel.speed) || 4, 1), 15);
  const heroSlides = (heroCarousel.images || []).filter(image => image?.url);
  const fallbackHeroSlides = heroImage.url
    ? [{ url: heroImage.url, alt: heroImage.alt || `${tenant.name || 'Business'} hero image` }]
    : images[0]?.url
      ? [{ url: images[0].url, alt: images[0].alt || `${tenant.name || 'Business'} hero image` }]
      : [];
  const resolvedHeroSlides = heroSlides.length > 0 ? heroSlides : fallbackHeroSlides;
  const hasHeroBackground = resolvedHeroSlides.length > 0;
  const offeringLabel = preset.offeringLabel;
  const heroTitle = content.title || preset.homeTitle;
  const aboutText =
    content.description || `${tenant?.name || 'This business'} shares its story, offerings, and contact information here.`;
  const showBookingForm = tenant?.businessType !== 'shopping';

  const stats = useMemo(
    () => [
      { label: 'Category', value: businessTypeLabel },
      { label: offeringLabel, value: String(offerings.length) },
      { label: 'Gallery', value: String(images.length) }
    ],
    [businessTypeLabel, offeringLabel, offerings.length, images.length]
  );

  const heroNotes = [
    `${preset.badge}`,
    `${offerings.length || 0} curated ${offeringLabel.toLowerCase()}`,
    contactInfo.email || contactInfo.phone || 'Direct contact ready'
  ];

  useEffect(() => {
    if (resolvedHeroSlides.length <= 1) {
      setActiveHeroSlide(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroSlide(currentIndex => (currentIndex + 1) % resolvedHeroSlides.length);
    }, heroSlideSpeed * 1000);

    return () => window.clearInterval(intervalId);
  }, [heroSlideSpeed, resolvedHeroSlides.length]);

  useEffect(() => {
    if (activeHeroSlide >= resolvedHeroSlides.length) {
      setActiveHeroSlide(0);
    }
  }, [activeHeroSlide, resolvedHeroSlides.length]);

  if (!tenant) {
    return (
      <main className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Website not found</h1>
          <p className="mt-3 text-slate-600">Check your link and try again.</p>
        </div>
      </main>
    );
  }

  const renderHomePage = () => (
    <div className="space-y-8">
      <section
        className={`relative overflow-hidden rounded-[2.75rem] border border-white/65 px-7 py-8 shadow-[0_34px_120px_rgba(15,23,42,0.14)] sm:px-10 sm:py-10 lg:px-12 lg:py-12 ${
          hasHeroBackground ? 'bg-slate-950/70' : preset.surfaceClass
        }`}
      >
        {hasHeroBackground ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`h-full w-full transition-transform duration-700 ease-out ${
                  heroSlideDirection === 'upward' ? 'flex flex-col' : 'flex'
                }`}
                style={
                  heroSlideDirection === 'upward'
                    ? {
                        transform: `translateY(-${activeHeroSlide * 100}%)`
                      }
                    : {
                        transform: `translateX(-${activeHeroSlide * 100}%)`
                      }
                }
              >
                {resolvedHeroSlides.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("${image.url}")`,
                      flex: '0 0 100%',
                      width: '100%',
                      height: '100%'
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42)_42%,rgba(15,23,42,0.36))]" />
          </>
        ) : null}
        <div className="absolute left-0 top-20 h-48 w-48 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute bottom-[-3rem] right-[-2rem] h-56 w-56 rounded-full bg-[var(--secondary)]/15 blur-3xl" />

        <div
          className={`relative mx-auto grid max-w-[1500px] gap-10 lg:items-center ${
            hasHeroBackground
              ? 'lg:grid-cols-[minmax(0,1.25fr)_22rem] xl:grid-cols-[minmax(0,1.35fr)_23rem]'
              : 'lg:grid-cols-[minmax(0,1.3fr)_22rem] xl:grid-cols-[minmax(0,1.4fr)_23rem]'
          }`}
        >
          <div className="max-w-[820px] space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_0_6px_rgba(255,255,255,0.65)]" />
              {preset.badge} for {tenant.name || 'your business'}
            </div>

            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[var(--primary)]">
                {businessTypeLabel}
              </p>
              <h1 className="max-w-[13ch] text-5xl font-black tracking-[-0.06em] text-slate-950 sm:text-6xl xl:text-7xl">
                {heroTitle}
              </h1>
              <p className="max-w-[62ch] text-lg leading-8 text-slate-600 sm:text-xl">
                {content.description || preset.homeDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActivePage('offerings')}
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-900"
              >
                Explore {offeringLabel}
              </button>
              <button
                type="button"
                onClick={() => setActivePage('contact')}
                className="rounded-full border border-slate-200 bg-white/88 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                Get In Touch
              </button>
            </div>

            <div className="grid max-w-[880px] gap-3 md:grid-cols-3">
              {heroNotes.map(note => (
                <div key={note} className="rounded-[1.4rem] border border-white/80 bg-white/72 px-4 py-4 text-sm text-slate-600 shadow-sm">
                  {note}
                </div>
              ))}
            </div>

            {resolvedHeroSlides.length > 1 ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  {resolvedHeroSlides.map((image, index) => (
                    <button
                      key={`${image.url}-dot-${index}`}
                      type="button"
                      onClick={() => setActiveHeroSlide(index)}
                      aria-label={`Go to hero slide ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeHeroSlide ? 'w-9 bg-slate-950' : 'w-2.5 bg-slate-950/30 hover:bg-slate-950/50'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Sliding {heroSlideDirection === 'upward' ? 'upward' : 'sideways'} every {heroSlideSpeed}s
                </p>
              </div>
            ) : null}
          </div>

          <div className="w-full max-w-[368px] justify-self-center space-y-4 lg:justify-self-end">
            <div className={`rounded-[2rem] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.24)] ${preset.accentPanelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.38em] text-white/55">Brand Snapshot</p>
                  <p className="mt-3 text-2xl font-black tracking-tight">{tenant.name || 'Business Website'}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sm font-black uppercase tracking-[0.18em] text-white">
                  {getInitials(tenant.name)}
                </div>
              </div>
              <div className="mt-8 space-y-5">
                {stats.map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="text-sm text-white/65">{item.label}</span>
                    <span className="text-lg font-semibold capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[2rem] border border-white/80 p-6 shadow-sm ${preset.mutedPanelClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-400">Creative Direction</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{preset.sectionTone}</p>
            </div>
          </div>
        </div>
      </section>

      {offerings.length > 0 ? (
        <SectionShell
          kicker="Highlights"
          title={`Featured ${offeringLabel}`}
          description="The most important entries are surfaced with a cleaner, more editorial presentation."
          aside={
            <div className={`rounded-[1.75rem] border border-slate-200/80 p-5 shadow-sm ${preset.mutedPanelClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Selection</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A focused preview of what visitors should notice first when they land on the site.
              </p>
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {offerings.slice(0, 4).map((item, index) => (
              <article
                key={`${item.title || 'item'}-${index}`}
                className="group rounded-[1.9rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">0{index + 1}</p>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                      {item.title || `${offeringLabel} ${index + 1}`}
                    </h3>
                  </div>
                  {'price' in item && item.price !== undefined ? (
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white">
                      ${item.price || 0}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {item.description || 'More details coming soon.'}
                </p>
                <div className="mt-6 h-px bg-gradient-to-r from-[var(--primary)]/35 to-transparent opacity-0 transition group-hover:opacity-100" />
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {showBookingForm ? (
        <SectionShell
          kicker="Connect"
          title={tenant.businessType === 'doctor' ? 'Book Appointment' : tenant.businessType === 'restaurant' ? 'Reserve or Enquire' : 'Book or Enquire'}
          description="Turn the website into an active channel for leads, bookings, and direct conversations."
          aside={
            <div className={`rounded-[1.75rem] p-5 shadow-xl ${preset.accentPanelClass}`}>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Quick Note</p>
              <p className="mt-3 text-sm leading-7 text-white/72">
                This section is designed to feel integrated into the brand rather than like a generic form block.
              </p>
            </div>
          }
        >
          <BookingForm tenant={tenant} />
        </SectionShell>
      ) : null}
    </div>
  );

  const renderAboutPage = () => (
    <SectionShell
      kicker="Story"
      title={`About ${tenant.name || 'Us'}`}
      description="A more refined, brand-led section for the owner’s message and business identity."
      aside={
        <div className={`rounded-[1.75rem] p-6 shadow-xl ${preset.accentPanelClass}`}>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Identity</p>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm text-white/60">Business Name</p>
              <p className="mt-2 text-xl font-semibold">{tenant.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Business Type</p>
              <p className="mt-2 text-xl font-semibold capitalize">{businessTypeLabel}</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/80 p-7 shadow-sm">
          <p className="text-lg leading-9 text-slate-600">{aboutText}</p>
        </div>
        <div className={`rounded-[1.9rem] border border-slate-200/80 p-7 shadow-sm ${preset.mutedPanelClass}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Brand Perspective</p>
          <p className="mt-4 text-base leading-8 text-slate-600">
            This page gives the website a stronger narrative center, helping visitors understand the personality behind the business.
          </p>
        </div>
      </div>
    </SectionShell>
  );

  const renderOfferingsPage = () => (
    <SectionShell
      kicker="Offerings"
      title={offeringLabel}
      description={`Everything here is presented as part of ${tenant.name || 'this business'}'s own website.`}
      aside={
        <div className={`rounded-[1.75rem] border border-slate-200/80 p-5 shadow-sm ${preset.mutedPanelClass}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Collection</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            A complete overview for visitors who want to go beyond the homepage preview.
          </p>
        </div>
      }
    >
      {offerings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {offerings.map((item, index) => (
            <article
              key={`${item.title || 'item'}-${index}`}
              className="rounded-[1.9rem] border border-slate-200/80 bg-white/86 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Item {index + 1}</p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                    {item.title || `${offeringLabel} ${index + 1}`}
                  </h3>
                </div>
                {'price' in item && item.price !== undefined ? (
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white">
                    ${item.price || 0}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {item.description || 'More details coming soon.'}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState message={`No ${offeringLabel.toLowerCase()} added yet.`} />
      )}
    </SectionShell>
  );

  const renderGalleryPage = () => (
    <SectionShell
      kicker="Visuals"
      title="Gallery"
      description="A stronger visual showcase with larger crops and a more modern editorial rhythm."
      aside={
        <div className={`rounded-[1.75rem] p-5 shadow-xl ${preset.accentPanelClass}`}>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Visual Tone</p>
          <p className="mt-3 text-sm leading-7 text-white/72">
            Richer spacing and larger image surfaces help the business look more premium at a glance.
          </p>
        </div>
      }
    >
      {images.length > 0 ? (
        <div className="grid auto-rows-[220px] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => {
            const tallCard = index % 3 === 0;
            return (
              <div
                key={`${image.url}-${index}`}
                className={`group overflow-hidden rounded-[1.9rem] border border-slate-200/75 bg-slate-100 shadow-sm ${
                  tallCard ? 'md:row-span-2 md:min-h-[460px]' : ''
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  className={`w-full object-cover transition duration-500 group-hover:scale-105 ${
                    tallCard ? 'h-full min-h-[460px]' : 'h-[220px]'
                  }`}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState message="No gallery images available right now." />
      )}
    </SectionShell>
  );

  const renderContactPage = () => (
    <SectionShell
      kicker="Reach Out"
      title="Contact"
      description="A direct, user-facing contact section that feels part of the design system rather than an afterthought."
      aside={
        <div className={`rounded-[1.75rem] border border-slate-200/80 p-5 shadow-sm ${preset.mutedPanelClass}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Response Paths</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Surface the quickest ways for customers to start a conversation.
          </p>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/86 p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Phone</p>
          <p className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{contactInfo.phone || 'Not provided'}</p>
        </div>
        <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/86 p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Email</p>
          <p className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{contactInfo.email || 'Not provided'}</p>
        </div>
        <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/86 p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Address</p>
          <p className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{contactInfo.address || 'Not provided'}</p>
        </div>
      </div>
    </SectionShell>
  );

  const pageContent = {
    home: renderHomePage(),
    about: renderAboutPage(),
    offerings: renderOfferingsPage(),
    gallery: renderGalleryPage(),
    contact: renderContactPage()
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#f4efe6_38%,#f7f9fc_100%)] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(250,204,21,0.12),transparent_26%),radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.10),transparent_24%)]" />

        <div className="relative mx-auto w-full max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="sticky top-4 z-20 rounded-[2.2rem] border border-white/70 bg-white/76 px-4 py-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4 xl:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-slate-950 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_35px_rgba(15,23,42,0.16)]">
                  {getInitials(tenant.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black tracking-[-0.04em] text-slate-950">
                    {tenant.name || 'Business Website'}
                  </p>
                  <p className="truncate text-sm capitalize text-slate-500">{businessTypeLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNavOpen(open => !open)}
                aria-expanded={isNavOpen}
                aria-label="Toggle navigation menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/88 text-slate-700 transition hover:bg-white"
              >
                <span className="text-lg leading-none">{isNavOpen ? '×' : '☰'}</span>
              </button>
            </div>

            <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-slate-950 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_35px_rgba(15,23,42,0.16)]">
                  {getInitials(tenant.name)}
                </div>
                <div>
                  <p className="text-xl font-black tracking-[-0.04em] text-slate-950">{tenant.name || 'Business Website'}</p>
                  <p className="text-sm capitalize text-slate-500">{businessTypeLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {sitePages.map(page => {
                  const isActive = page.id === activePage;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setActivePage(page.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.14)]'
                          : 'bg-white/82 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setActivePage('contact')}
                className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(59,130,246,0.24)] transition hover:brightness-95"
              >
                Contact
              </button>
            </div>

            <div className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 xl:hidden ${isNavOpen ? 'mt-4 max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 border-t border-white/70 pt-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {sitePages.map(page => {
                    const isActive = page.id === activePage;
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => setActivePage(page.id)}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                          isActive
                            ? 'bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.14)]'
                            : 'bg-white/82 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {page.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('contact')}
                  className="w-full rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(59,130,246,0.24)] transition hover:brightness-95"
                >
                  Contact
                </button>
              </div>
            </div>
          </nav>

          {pageContent[activePage]}

          <footer className="rounded-[2.1rem] border border-white/70 bg-white/80 p-8 text-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_0.8fr_0.9fr]">
              <div className="space-y-5">
                <div>
                  <p className="text-lg font-bold tracking-tight text-slate-950">{tenant.name || 'Business Website'}</p>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
                    {content.description || `${tenant.name || 'This business'} offers a polished digital presence with clear navigation, highlights, and direct contact paths.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600">
                    {businessTypeLabel}
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600">
                    {offerings.length} {offeringLabel.toLowerCase()}
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600">
                    {images.length} gallery items
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Navigation</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sitePages.map(page => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setActivePage(page.id)}
                      className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Contact Details</p>
                <div className="space-y-3 text-sm leading-7 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-950">Phone:</span> {contactInfo.phone || 'Not provided'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Email:</span> {contactInfo.email || 'Not provided'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Address:</span> {contactInfo.address || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>{tenant.name || 'Business Website'} is ready for enquiries, bookings, and discovery.</p>
              <button
                type="button"
                onClick={() => setActivePage('contact')}
                className="rounded-full bg-slate-950 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-900"
              >
                Contact Now
              </button>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
