'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import BookingForm from './BookingForm';
import ProductOrderForm from './businesses/restaurant/ProductOrderForm';
import {
  getBusinessPreset,
  getBusinessTypeLabel,
  getOfferings,
  shouldShowBookingForm,
  shouldShowOrderForm
} from './businesses';
import { applyTheme } from '../services/theme';

function SectionShell({ kicker, title, description, aside, children, className = '' }) {
  return (
    <section
      className={`website-section relative overflow-hidden rounded-[2.4rem] border border-white/65 bg-white/74 p-7 shadow-[0_32px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-10 ${className}`}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div>
          {kicker ? <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[var(--primary)]">{kicker}</p> : null}
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">{title}</h2>
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
    <div className="website-card rounded-[1.9rem] border border-dashed border-slate-300 bg-white/72 p-8 text-base text-slate-500">
      {message}
    </div>
  );
}

function SurfaceCard({ className = '', children }) {
  return <div className={`website-card rounded-[1.9rem] border border-slate-200/80 bg-white/84 shadow-sm ${className}`}>{children}</div>;
}

function InfoCard({ label, value, href, hint }) {
  const content = href ? (
    <a href={href} className="mt-4 inline-flex break-all text-xl font-semibold tracking-tight text-slate-950 transition hover:text-[var(--primary)]">
      {value}
    </a>
  ) : (
    <p className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
  );

  return (
    <SurfaceCard className="p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{label}</p>
      {content}
      {hint ? <p className="mt-3 text-sm leading-7 text-slate-500">{hint}</p> : null}
    </SurfaceCard>
  );
}

function HighlightBadge({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm ${className}`}>
      <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_0_6px_rgba(255,255,255,0.65)]" />
      {children}
    </div>
  );
}

function ReviewStars({ rating }) {
  const count = Math.max(1, Math.min(Number(rating) || 5, 5));
  return <p className="text-lg tracking-[0.3em] text-amber-500">{Array.from({ length: count }, () => '*').join(' ')}</p>;
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

function splitStory(description, fallbackName) {
  const source = (description || `${fallbackName} shares its story, offerings, and contact information here.`).trim();
  const segments = source
    .split(/(?<=[.!?])\s+/)
    .map(item => item.trim())
    .filter(Boolean);

  if (segments.length > 1) {
    return segments;
  }

  return [
    source,
    `${fallbackName} uses this space to introduce the brand, explain what it offers, and guide visitors toward the next step.`
  ];
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const numericPrice = Number(value);
  if (Number.isNaN(numericPrice)) return null;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2
  }).format(numericPrice);
}

function formatDisplayDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getVideoEmbedData(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace('www.', '');

    if (host.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v');
      if (!videoId) return null;
      return { type: 'embed', src: `https://www.youtube.com/embed/${videoId}` };
    }

    if (host === 'youtu.be') {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      if (!videoId) return null;
      return { type: 'embed', src: `https://www.youtube.com/embed/${videoId}` };
    }

    if (host.includes('vimeo.com')) {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      if (!videoId) return null;
      return { type: 'embed', src: `https://player.vimeo.com/video/${videoId}` };
    }

    return { type: 'video', src: url };
  } catch {
    return null;
  }
}

function getReadableCountLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
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
  const customSections = useMemo(
    () => (Array.isArray(content.customSections) ? content.customSections.filter(Boolean) : []),
    [content.customSections]
  );
  const reviews = useMemo(
    () => (Array.isArray(content.reviews) ? content.reviews.filter(review => review?.name || review?.role || review?.quote) : []),
    [content.reviews]
  );
  const blogPosts = useMemo(
    () =>
      Array.isArray(content.blogPosts)
        ? content.blogPosts.filter(post => post?.title || post?.excerpt || post?.content || post?.author || post?.date || post?.image?.url)
        : [],
    [content.blogPosts]
  );
  const images = useMemo(() => (Array.isArray(content.images) ? content.images.filter(image => image?.url) : []), [content.images]);
  const contactInfo = content.contactInfo || {};
  const businessTypeLabel = getBusinessTypeLabel(tenant?.businessType);
  const preset = getBusinessPreset(tenant?.businessType);
  const offerings = useMemo(() => getOfferings(content, tenant?.businessType), [content, tenant?.businessType]);
  const showOrderForm = shouldShowOrderForm(tenant?.businessType);
  const showBookingForm = shouldShowBookingForm(tenant?.businessType);
  const blogsEnabled = Boolean(content.blogsEnabled) && blogPosts.length > 0;
  const websiteWidth = Math.min(Math.max(Number(tenant?.theme?.siteWidth) || 1600, 960), 1680);
  const offeringLabel = preset.offeringLabel;

  const themeClasses = {
    pageBackgroundClass: preset.pageBackgroundClass || 'bg-[linear-gradient(180deg,#f7fbff_0%,#f4efe6_38%,#f7f9fc_100%)]',
    ambientBackgroundClass:
      preset.ambientBackgroundClass ||
      'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(250,204,21,0.12),transparent_26%),radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.10),transparent_24%)]',
    navClass: preset.navClass || 'border-white/70 bg-white/76',
    brandMarkClass: preset.brandMarkClass || 'bg-slate-950 text-white shadow-[0_16px_35px_rgba(15,23,42,0.16)]',
    heroGlassClass: preset.heroGlassClass || 'border-white/80 bg-white/85 text-slate-600 shadow-sm',
    heroNoteClass: preset.heroNoteClass || 'border-white/80 bg-white/72 text-slate-600 shadow-sm',
    audienceCardClass: preset.audienceCardClass || 'border-white/70 bg-white/65 text-slate-700 shadow-sm',
    primaryButtonClass:
      preset.primaryButtonClass ||
      'bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:bg-slate-900',
    secondaryButtonClass:
      preset.secondaryButtonClass ||
      'border-slate-200 bg-white/88 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white',
    featureCardClass:
      preset.featureCardClass ||
      'border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]',
    sectionCardClass: preset.sectionCardClass || 'border-white/70 bg-white/76',
    galleryFrameClass: preset.galleryFrameClass || 'border-slate-200/80 bg-slate-100',
    footerClass: preset.footerClass || 'border-white/70 bg-white/80',
    footerButtonClass: preset.footerButtonClass || 'bg-slate-950 text-white hover:bg-slate-900',
    contactBannerSecondaryClass:
      preset.contactBannerSecondaryClass || 'border-white/20 bg-white/10 text-white hover:bg-white/15'
  };

  const heroImage = content.heroImage || {};
  const heroCarousel = content.heroCarousel || {};
  const heroSlideDirection = heroCarousel.direction === 'upward' ? 'upward' : 'side';
  const heroSlideSpeed = Math.min(Math.max(Number(heroCarousel.speed) || 4, 1), 15);
  const heroSlides = (heroCarousel.images || []).filter(image => image?.url);
  const fallbackHeroSlides = heroImage.url
    ? [{ url: heroImage.url, alt: heroImage.alt || `${tenant?.name || 'Business'} hero image` }]
    : images[0]?.url
      ? [{ url: images[0].url, alt: images[0].alt || `${tenant?.name || 'Business'} hero image` }]
      : [];
  const resolvedHeroSlides = heroSlides.length > 0 ? heroSlides : fallbackHeroSlides;
  const hasHeroBackground = resolvedHeroSlides.length > 0;
  const activeHeroImage = resolvedHeroSlides[activeHeroSlide] || resolvedHeroSlides[0] || null;
  const heroTitle = content.title || preset.homeTitle;
  const aboutParagraphs = splitStory(content.description, tenant?.name || 'This business');
  const featuredOfferings = offerings.slice(0, 4);
  const featuredImages = images.slice(0, 5);
  const categorySummary = getReadableCountLabel(offerings.length, offeringLabel.toLowerCase());
  const gallerySummary = getReadableCountLabel(images.length, 'gallery item');
  const reviewSummary = reviews.length > 0 ? getReadableCountLabel(reviews.length, 'review') : 'No reviews yet';

  const stats = useMemo(
    () => [
      { label: 'Category', value: businessTypeLabel },
      { label: offeringLabel, value: String(offerings.length) },
      { label: 'Gallery', value: String(images.length) },
      ...(reviews.length > 0 ? [{ label: 'Reviews', value: String(reviews.length) }] : [])
    ],
    [businessTypeLabel, offeringLabel, offerings.length, images.length, reviews.length]
  );

  const navPages = useMemo(
    () => [
      { id: 'home', label: 'Home', summary: preset.badge },
      { id: 'about', label: 'About', summary: 'Story and identity' },
      { id: 'offerings', label: offeringLabel, summary: categorySummary },
      { id: 'gallery', label: 'Gallery', summary: gallerySummary },
      ...(blogsEnabled ? [{ id: 'blogs', label: 'Blogs', summary: getReadableCountLabel(blogPosts.length, 'post') }] : []),
      { id: 'contact', label: 'Contact', summary: 'Direct action paths' }
    ],
    [blogsEnabled, blogPosts.length, categorySummary, gallerySummary, offeringLabel, preset.badge]
  );

  const heroNotes = [
    preset.badge,
    `${offerings.length || 0} curated ${offeringLabel.toLowerCase()}`,
    contactInfo.email || contactInfo.phone || 'Direct contact ready'
  ];

  const quickActions = [
    { label: `Explore ${offeringLabel}`, page: 'offerings', hint: categorySummary },
    { label: 'Browse Gallery', page: 'gallery', hint: gallerySummary },
    ...(blogsEnabled ? [{ label: 'Read Blogs', page: 'blogs', hint: getReadableCountLabel(blogPosts.length, 'story', 'stories') }] : []),
    { label: 'Contact Business', page: 'contact', hint: showBookingForm ? preset.ctaLabel : 'Fastest next step' }
  ];

  const contactCards = [
    {
      label: 'Phone',
      value: contactInfo.phone || 'Not provided',
      href: contactInfo.phone ? `tel:${contactInfo.phone}` : null,
      hint: contactInfo.phone ? 'Best for quick conversations.' : 'Add a phone number to improve response speed.'
    },
    {
      label: 'Email',
      value: contactInfo.email || 'Not provided',
      href: contactInfo.email ? `mailto:${contactInfo.email}` : null,
      hint: contactInfo.email ? 'Great for detailed enquiries.' : 'Add an email address for longer enquiries.'
    },
    {
      label: 'Address',
      value: contactInfo.address || 'Not provided',
      href: null,
      hint: contactInfo.address ? 'Useful for local visitors planning a visit.' : 'Add an address if customers visit in person.'
    }
  ];

  const storyHighlights = [
    {
      label: 'Positioning',
      value: preset.badge,
      detail: preset.sectionTone
    },
    {
      label: 'Focus',
      value: `${offerings.length || 0} ${offeringLabel.toLowerCase()}`,
      detail: `${tenant?.name || 'This business'} keeps the key offer clear and easy to scan.`
    },
    {
      label: 'Next Step',
      value: showBookingForm ? preset.ctaLabel : showOrderForm ? 'Order or Enquire' : 'Reach Out',
      detail: showBookingForm ? 'Visitors can move directly from discovery to enquiry.' : 'Visitors are guided toward products and contact details.'
    }
  ];

  const collectionMetrics = [
    {
      label: 'Offerings',
      value: categorySummary,
      detail: `Built around ${offeringLabel.toLowerCase()} that are easy to scan and compare.`
    },
    {
      label: 'Visual Library',
      value: gallerySummary,
      detail: 'Image coverage creates trust and adds atmosphere across the site.'
    },
    {
      label: 'Proof',
      value: reviewSummary,
      detail: 'Social proof helps move visitors toward action with less hesitation.'
    }
  ];

  const currentPageMeta = navPages.find(page => page.id === activePage) || navPages[0];

  const goToPage = page => {
    startTransition(() => {
      setActivePage(page);
    });
  };

  const renderCustomSectionBlock = (block, index, layout) => {
    const alignmentClass =
      block.align === 'center' ? 'text-center items-center' : block.align === 'right' ? 'text-right items-end' : 'text-left items-start';
    const columnClass = layout === 'two-column' && Number(block.column) === 2 ? 'lg:col-start-2' : '';

    if (block.type === 'image' && block.image?.url) {
      return (
        <SurfaceCard key={block.id || `${block.type}-${index}`} className={`overflow-hidden ${columnClass}`}>
          <img
            src={block.image.url}
            alt={block.image.alt || `Custom section image ${index + 1}`}
            className="h-full max-h-[30rem] w-full object-cover"
          />
        </SurfaceCard>
      );
    }

    if (block.type === 'video' && block.video?.url) {
      const videoData = getVideoEmbedData(block.video.url);
      if (!videoData) return null;

      return (
        <div key={block.id || `${block.type}-${index}`} className={`website-card overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-slate-950 shadow-sm ${columnClass}`}>
          <div className="aspect-video w-full">
            {videoData.type === 'embed' ? (
              <iframe
                src={videoData.src}
                title={block.video.title || `Custom video ${index + 1}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="h-full w-full">
                <source src={videoData.src} />
              </video>
            )}
          </div>
        </div>
      );
    }

    if (!block.content) return null;

    if (block.type === 'heading') {
      return (
        <div key={block.id || `${block.type}-${index}`} className={`flex ${alignmentClass} ${columnClass}`}>
          <h3 className="max-w-[18ch] text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">{block.content}</h3>
        </div>
      );
    }

    return (
      <div key={block.id || `${block.type}-${index}`} className={`flex ${alignmentClass} ${columnClass}`}>
        <p className="max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-600">{block.content}</p>
      </div>
    );
  };

  const renderCustomSections = (page, placement) => {
    const matchingSections = customSections.filter(section => section?.page === page && section?.placement === placement);
    if (matchingSections.length === 0) return null;

    return matchingSections.map((section, index) => {
      const blocks = Array.isArray(section.blocks) ? section.blocks : [];
      const layoutClass = section.layout === 'two-column' ? 'lg:grid-cols-2' : 'grid-cols-1';

      return (
        <SectionShell
          key={section.id || `${page}-${placement}-${index}`}
          kicker="Custom Section"
          title={section.title || `Section ${index + 1}`}
          description={section.description || undefined}
        >
          <div className={`grid gap-5 ${layoutClass}`}>
            {blocks.map((block, blockIndex) => renderCustomSectionBlock(block, blockIndex, section.layout)).filter(Boolean)}
          </div>
        </SectionShell>
      );
    });
  };

  useEffect(() => {
    if (resolvedHeroSlides.length <= 1) {
      setActiveHeroSlide(0);
      return undefined;
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
      <main className="website-shell website-canvas mx-auto w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Website not found</h1>
          <p className="mt-3 text-slate-600">Check your link and try again.</p>
        </div>
      </main>
    );
  }

  const renderCollectionCards = items =>
    items.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => {
          const price = formatPrice(item.price);
          const image = item.image?.url ? item.image : images[index % Math.max(images.length, 1)];

          return (
            <article
              key={`${item.title || 'item'}-${index}`}
              className={`website-card group overflow-hidden rounded-[2rem] border shadow-sm transition ${themeClasses.featureCardClass}`}
            >
              {image?.url ? (
                <div className="relative overflow-hidden">
                  <img src={image.url} alt={image.alt || item.title || `${offeringLabel} ${index + 1}`} className="h-56 w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>
              ) : null}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Item {index + 1}</p>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{item.title || `${offeringLabel} ${index + 1}`}</h3>
                  </div>
                  {price ? <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white">{price}</span> : null}
                </div>
                <p className="mt-4 text-base leading-7 text-slate-600">{item.description || 'More details coming soon.'}</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Presented as part of the main collection</span>
                  <button
                    type="button"
                    onClick={() => goToPage('contact')}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Enquire
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    ) : (
      <EmptyState message={`No ${offeringLabel.toLowerCase()} added yet.`} />
    );

  const renderFeaturedOfferings = () =>
    featuredOfferings.length > 0 ? (
      <SectionShell
        kicker="Highlights"
        title={`Featured ${offeringLabel}`}
        description="A tighter selection gives visitors a faster path to the most important services or products."
        aside={
          <SurfaceCard className={`p-5 ${preset.mutedPanelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Selection</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Lead with the strongest offers first, then let visitors explore the broader catalog when they are ready.
            </p>
          </SurfaceCard>
        }
      >
        {renderCollectionCards(featuredOfferings)}
      </SectionShell>
    ) : null;

  const renderVisualSpotlight = () =>
    featuredImages.length > 0 ? (
      <SectionShell
        kicker="Showcase"
        title="Visual Spotlight"
        description="Larger image surfaces and staggered crops make the site feel more polished and alive."
        aside={
          <div className={`website-card rounded-[1.85rem] p-5 shadow-xl ${preset.accentPanelClass}`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Spotlight</p>
            <p className="mt-3 text-sm leading-7 text-white/72">{preset.spotlightTitle}</p>
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-4">
            <SurfaceCard className="overflow-hidden border-slate-200/80 bg-slate-100">
              <img
                src={featuredImages[0].url}
                alt={featuredImages[0].alt || `${tenant.name || 'Business'} featured visual`}
                className="h-[420px] w-full object-cover"
              />
            </SurfaceCard>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredImages.slice(1, 3).map((image, index) => (
                <SurfaceCard key={`${image.url}-${index}`} className="overflow-hidden border-slate-200/80 bg-slate-100">
                  <img src={image.url} alt={image.alt || `Gallery image ${index + 2}`} className="h-52 w-full object-cover" />
                </SurfaceCard>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className={`website-card rounded-[2rem] p-7 shadow-xl ${preset.accentPanelClass}`}>
              <p className="text-[11px] uppercase tracking-[0.38em] text-white/55">Visual Direction</p>
              <h3 className="mt-4 text-3xl font-black tracking-[-0.04em]">{tenant.name || 'Business Website'} looks current, tangible, and worth exploring.</h3>
              <p className="mt-4 text-base leading-8 text-white/72">
                Pairing one strong lead visual with supporting crops gives the page a more editorial rhythm and helps every business type feel more premium.
              </p>
            </div>
            {featuredImages.slice(3, 5).map((image, index) => (
              <SurfaceCard key={`${image.url}-stack-${index}`} className="overflow-hidden border-slate-200/80 bg-slate-100">
                <img src={image.url} alt={image.alt || `Gallery image ${index + 4}`} className="h-48 w-full object-cover" />
              </SurfaceCard>
            ))}
          </div>
        </div>
      </SectionShell>
    ) : null;

  const renderReviewsSection = () =>
    reviews.length > 0 ? (
      <SectionShell
        kicker="Social Proof"
        title="What Customers Say"
        description="Customer feedback is brought into the same visual language as the rest of the website."
        aside={
          <SurfaceCard className={`p-5 ${preset.mutedPanelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Trust Signal</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Real feedback helps new visitors move from curiosity to confidence with less friction.</p>
          </SurfaceCard>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review, index) => (
            <SurfaceCard key={`${review.name || 'review'}-${index}`} className="p-6">
              <ReviewStars rating={review.rating} />
              <p className="mt-4 text-base leading-8 text-slate-600">{review.quote || 'A customer review will appear here soon.'}</p>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="font-bold tracking-tight text-slate-950">{review.name || `Customer ${index + 1}`}</p>
                {review.role ? <p className="mt-1 text-sm text-slate-500">{review.role}</p> : null}
              </div>
            </SurfaceCard>
          ))}
        </div>
      </SectionShell>
    ) : null;

  const renderBlogsPage = () => (
    <div className="space-y-8">
      {renderCustomSections('blogs', 'top')}

      <SectionShell
        kicker="Insights"
        title="Blogs"
        description={`Stories, updates, and practical ideas from ${tenant.name || 'this business'}.`}
        aside={
          <SurfaceCard className={`p-5 ${preset.mutedPanelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Editorial</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">The blog gives the business room to teach, update, and steadily build authority over time.</p>
          </SurfaceCard>
        }
      >
        {blogPosts.length > 0 ? (
          <div className="space-y-5">
            {blogPosts.map((post, index) => (
              <article key={post.id || `${post.title || 'blog'}-${index}`} className={`website-card overflow-hidden rounded-[2rem] border shadow-sm ${themeClasses.featureCardClass}`}>
                <div className={`grid gap-0 ${post.image?.url ? 'xl:grid-cols-[20rem_minmax(0,1fr)]' : 'grid-cols-1'}`}>
                  {post.image?.url ? (
                    <img
                      src={post.image.url}
                      alt={post.image.alt || post.title || `Blog post ${index + 1}`}
                      className="h-full min-h-[18rem] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      {post.author ? <span>{post.author}</span> : null}
                      {post.author && post.date ? <span className="h-1 w-1 rounded-full bg-slate-300" /> : null}
                      {post.date ? <span>{formatDisplayDate(post.date)}</span> : null}
                    </div>
                    <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{post.title || `Blog Post ${index + 1}`}</h3>
                    {post.excerpt ? <p className="mt-4 text-lg leading-8 text-slate-600">{post.excerpt}</p> : null}
                    {post.content ? <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-600">{post.content}</p> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No blog posts published yet." />
        )}
      </SectionShell>

      {renderCustomSections('blogs', 'middle')}
      {renderCustomSections('blogs', 'bottom')}
    </div>
  );

  const renderHomePage = () => (
    <div className="space-y-8">
      {renderCustomSections('home', 'top')}

      <section
        className={`website-section relative overflow-hidden rounded-[3rem] border border-white/65 px-7 py-8 shadow-[0_36px_120px_rgba(15,23,42,0.14)] sm:px-10 sm:py-10 lg:px-12 lg:py-12 ${
          hasHeroBackground ? 'bg-slate-950/70' : preset.surfaceClass
        }`}
      >
        {hasHeroBackground ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`h-full w-full transition-transform duration-700 ease-out ${heroSlideDirection === 'upward' ? 'flex flex-col' : 'flex'}`}
                style={
                  heroSlideDirection === 'upward'
                    ? { transform: `translateY(-${activeHeroSlide * 100}%)` }
                    : { transform: `translateX(-${activeHeroSlide * 100}%)` }
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
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.58)_42%,rgba(15,23,42,0.48))]" />
          </>
        ) : null}

        <div className="absolute left-0 top-20 h-48 w-48 rounded-full bg-[var(--primary)]/12 blur-3xl" />
        <div className="absolute bottom-[-3rem] right-[-2rem] h-56 w-56 rounded-full bg-[var(--secondary)]/18 blur-3xl" />

        <div
          className={`relative mx-auto grid gap-10 lg:items-center ${
            hasHeroBackground
              ? 'xl:grid-cols-[minmax(0,1.18fr)_25rem]'
              : 'xl:grid-cols-[minmax(0,1.2fr)_25rem]'
          }`}
          style={{ maxWidth: `${Math.max(websiteWidth - 96, 960)}px` }}
        >
          <div className="max-w-[860px] space-y-8">
            <HighlightBadge className={themeClasses.heroGlassClass}>{preset.badge} for {tenant.name || 'your business'}</HighlightBadge>

            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[var(--primary)]">{businessTypeLabel}</p>
              <h1 className="website-hero-title max-w-[13ch] text-5xl font-black tracking-[-0.07em] text-slate-950 sm:text-6xl xl:text-7xl">{heroTitle}</h1>
              <p className="max-w-[62ch] text-lg leading-8 text-slate-600 sm:text-xl">{content.description || preset.homeDescription}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => goToPage(showOrderForm ? 'offerings' : 'contact')}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition ${themeClasses.primaryButtonClass}`}
              >
                {preset.ctaLabel}
              </button>
              <button
                type="button"
                onClick={() => goToPage('gallery')}
                className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${themeClasses.secondaryButtonClass}`}
              >
                See Visuals
              </button>
            </div>

            <div className="grid max-w-[880px] gap-3 md:grid-cols-3">
              {heroNotes.map(note => (
                <div key={note} className={`website-card rounded-[1.45rem] border px-4 py-4 text-sm ${themeClasses.heroNoteClass}`}>
                  {note}
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {preset.audiencePoints.map(point => (
                <div key={point} className={`website-card rounded-[1.4rem] border px-4 py-4 text-sm font-medium ${themeClasses.audienceCardClass}`}>
                  {point}
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

          <div className="w-full max-w-[400px] justify-self-center space-y-4 lg:justify-self-end">
            <div className={`website-card rounded-[2.15rem] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.24)] ${preset.accentPanelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.38em] text-white/55">Brand Snapshot</p>
                  <p className="mt-3 text-2xl font-black tracking-tight">{tenant.name || 'Business Website'}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sm font-black uppercase tracking-[0.18em] text-white">
                  {getInitials(tenant.name)}
                </div>
              </div>
              <div className="mt-8 grid gap-4">
                {stats.map(item => (
                  <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`website-card rounded-[2rem] border border-white/80 p-6 shadow-sm ${preset.mutedPanelClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-400">{preset.audienceTitle}</p>
                  <p className="mt-3 text-lg font-bold tracking-tight text-slate-950">{currentPageMeta.summary}</p>
                </div>
                {activeHeroImage?.url ? (
                  <div className="hidden h-16 w-16 overflow-hidden rounded-[1.1rem] border border-white/80 bg-white/70 sm:block">
                    <img src={activeHeroImage.url} alt={activeHeroImage.alt || 'Active hero slide'} className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </div>
              <div className="mt-5 space-y-3">
                {quickActions.map(action => (
                  <button
                    key={action.page}
                    type="button"
                    onClick={() => goToPage(action.page)}
                    className="flex w-full items-center justify-between rounded-[1.2rem] border border-slate-200/80 bg-white/85 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
                  >
                    <div>
                      <span className="block text-sm font-semibold text-slate-800">{action.label}</span>
                      <span className="mt-1 block text-xs tracking-[0.22em] text-slate-400 uppercase">{action.hint}</span>
                    </div>
                    <span className="text-sm text-slate-400">Open</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className={`website-card rounded-[2.2rem] border p-7 shadow-sm ${preset.mutedPanelClass} ${themeClasses.sectionCardClass}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-400">Brand Direction</p>
          <h2 className="mt-4 max-w-[18ch] text-3xl font-black tracking-[-0.05em] text-slate-950">{preset.spotlightTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{preset.sectionTone}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {storyHighlights.map(item => (
            <div key={item.label} className={`website-card rounded-[1.85rem] border p-6 shadow-sm backdrop-blur ${themeClasses.sectionCardClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{item.label}</p>
              <p className="mt-4 text-xl font-bold tracking-tight text-slate-950">{item.value}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionShell
        kicker="Overview"
        title="A business website that feels intentional from the first screen."
        description="These supporting panels make the homepage more informative without turning it into a wall of content."
        aside={
          <div className={`website-card rounded-[1.85rem] p-5 shadow-xl ${preset.accentPanelClass}`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Momentum</p>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Strong hierarchy, clearer business signals, and better visual framing all help visitors decide faster.
            </p>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {collectionMetrics.map(metric => (
            <SurfaceCard key={metric.label} className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{metric.label}</p>
              <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{metric.value}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{metric.detail}</p>
            </SurfaceCard>
          ))}
        </div>
      </SectionShell>

      {renderCustomSections('home', 'middle')}
      {renderFeaturedOfferings()}
      {renderReviewsSection()}
      {renderVisualSpotlight()}

      {showOrderForm || showBookingForm ? (
        <SectionShell
          kicker={showOrderForm ? 'Order' : 'Connect'}
          title={preset.ctaLabel}
          description={
            showOrderForm
              ? tenant?.businessType === 'restaurant'
                ? 'Let guests choose dishes, pay online if they want, and send the order directly to the owner.'
                : 'Let shoppers choose products, pay online if they want, and place an order directly from the website.'
              : 'Turn the website into an active channel for leads, bookings, and direct conversations.'
          }
          aside={
            <div className={`website-card rounded-[1.85rem] p-5 shadow-xl ${preset.accentPanelClass}`}>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Quick Note</p>
              <p className="mt-3 text-sm leading-7 text-white/72">
                {showOrderForm
                  ? tenant?.businessType === 'restaurant'
                    ? 'This turns the restaurant page into a real ordering channel instead of only a brochure.'
                    : 'This turns the storefront into a product catalog with a built-in checkout path.'
                  : 'This section is designed to feel integrated into the brand rather than like a generic form block.'}
              </p>
            </div>
          }
        >
          {showOrderForm ? <ProductOrderForm tenant={tenant} /> : <BookingForm tenant={tenant} />}
        </SectionShell>
      ) : null}

      {renderCustomSections('home', 'bottom')}
    </div>
  );

  const renderAboutPage = () => (
    <div className="space-y-8">
      {renderCustomSections('about', 'top')}

      <SectionShell
        kicker="Story"
        title={`About ${tenant.name || 'Us'}`}
        description="A more refined brand story section that adds personality without losing clarity."
        aside={
          <div className={`website-card rounded-[1.85rem] p-6 shadow-xl ${preset.accentPanelClass}`}>
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
        <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-4">
            {aboutParagraphs.map((paragraph, index) => (
              <SurfaceCard key={`${paragraph}-${index}`} className="p-7">
                <p className="text-lg leading-9 text-slate-600">{paragraph}</p>
              </SurfaceCard>
            ))}
          </div>
          <div className="space-y-4">
            <SurfaceCard className={`p-7 ${preset.mutedPanelClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Brand Perspective</p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                This page gives the website a stronger narrative center, helping visitors understand the personality behind the business.
              </p>
            </SurfaceCard>
            {storyHighlights.map(item => (
              <SurfaceCard key={item.label} className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-xl font-bold tracking-tight text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </SectionShell>

      {renderCustomSections('about', 'middle')}
      {renderCustomSections('about', 'bottom')}
    </div>
  );

  const renderOfferingsPage = () => (
    <div className="space-y-8">
      {renderCustomSections('offerings', 'top')}

      <SectionShell
        kicker="Offerings"
        title={offeringLabel}
        description={`Everything here is presented as part of ${tenant.name || 'this business'}'s own website.`}
        aside={
          <SurfaceCard className={`p-5 ${preset.mutedPanelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Collection</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">A complete overview for visitors who want to go beyond the homepage preview.</p>
          </SurfaceCard>
        }
      >
        {renderCollectionCards(offerings)}
      </SectionShell>

      {renderCustomSections('offerings', 'middle')}
      {renderCustomSections('offerings', 'bottom')}
    </div>
  );

  const renderGalleryPage = () => (
    <div className="space-y-8">
      {renderCustomSections('gallery', 'top')}

      <SectionShell
        kicker="Visuals"
        title="Gallery"
        description="A stronger visual showcase with larger crops, staggered sizing, and a more modern editorial rhythm."
        aside={
          <div className={`website-card rounded-[1.85rem] p-5 shadow-xl ${preset.accentPanelClass}`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">Visual Tone</p>
            <p className="mt-3 text-sm leading-7 text-white/72">Richer spacing and larger image surfaces help the business look more premium at a glance.</p>
          </div>
        }
      >
        {images.length > 0 ? (
          <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
              <SurfaceCard className="overflow-hidden border-slate-200/80 bg-slate-100">
                <img src={images[0].url} alt={images[0].alt || 'Featured gallery image'} className="h-[460px] w-full object-cover" />
              </SurfaceCard>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {images.slice(1, 3).map((image, index) => (
                  <SurfaceCard key={`${image.url}-featured-${index}`} className="overflow-hidden border-slate-200/80 bg-slate-100">
                    <img src={image.url} alt={image.alt || `Featured image ${index + 2}`} className="h-[220px] w-full object-cover" />
                  </SurfaceCard>
                ))}
              </div>
            </div>
            <div className="grid auto-rows-[220px] gap-4 md:grid-cols-2 xl:grid-cols-3">
              {images.slice(3).map((image, index) => {
                const tallCard = index % 4 === 1;
                return (
                  <div
                    key={`${image.url}-${index}`}
                    className={`website-card group overflow-hidden rounded-[1.95rem] border shadow-sm ${themeClasses.galleryFrameClass} ${
                      tallCard ? 'md:row-span-2 md:min-h-[460px]' : ''
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Image ${index + 4}`}
                      className={`w-full object-cover transition duration-500 group-hover:scale-105 ${tallCard ? 'h-full min-h-[460px]' : 'h-[220px]'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState message="No gallery images available right now." />
        )}
      </SectionShell>

      {renderCustomSections('gallery', 'middle')}
      {renderCustomSections('gallery', 'bottom')}
    </div>
  );

  const renderContactPage = () => (
    <div className="space-y-8">
      {renderCustomSections('contact', 'top')}

      <SectionShell
        kicker="Reach Out"
        title="Contact"
        description="A clearer, more actionable contact area that feels like part of the product rather than an afterthought."
        aside={
          <SurfaceCard className={`p-5 ${preset.mutedPanelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Response Paths</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Surface the quickest ways for customers to start a conversation and keep confidence high.</p>
          </SurfaceCard>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map(card => (
            <InfoCard key={card.label} label={card.label} value={card.value} href={card.href} hint={card.hint} />
          ))}
        </div>
      </SectionShell>

      <section className={`website-section rounded-[2.4rem] border border-white/70 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.10)] ${preset.accentPanelClass}`}>
        <div className="grid gap-8 xl:grid-cols-[1fr_20rem] xl:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-white/55">Next Step</p>
            <h2 className="mt-4 max-w-[16ch] text-4xl font-black tracking-[-0.05em]">{tenant.name || 'This business'} is ready for the next conversation.</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
              Whether visitors are comparing services, browsing products, or deciding when to reach out, this section gives them a clear path forward.
            </p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => goToPage('offerings')}
              className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Review {offeringLabel}
            </button>
            <button
              type="button"
              onClick={() => goToPage('gallery')}
              className={`w-full rounded-full border px-5 py-3 text-sm font-semibold transition ${themeClasses.contactBannerSecondaryClass}`}
            >
              View Gallery
            </button>
          </div>
        </div>
      </section>

      {renderCustomSections('contact', 'middle')}

      {showOrderForm || showBookingForm ? (
        <SectionShell
          kicker={showOrderForm ? 'Order' : 'Booking'}
          title={preset.ctaLabel}
          description={
            showOrderForm
              ? tenant?.businessType === 'restaurant'
                ? 'Let guests choose menu items, pay online if they want, and send the order directly to the owner.'
                : 'Let customers choose products, pay online if they want, and place an order directly with the business.'
              : 'Let the contact experience end in action, not confusion.'
          }
        >
          {showOrderForm ? <ProductOrderForm tenant={tenant} /> : <BookingForm tenant={tenant} />}
        </SectionShell>
      ) : null}

      {renderCustomSections('contact', 'bottom')}
    </div>
  );

  const activePageContent =
    activePage === 'home'
      ? renderHomePage()
      : activePage === 'about'
        ? renderAboutPage()
        : activePage === 'offerings'
          ? renderOfferingsPage()
          : activePage === 'gallery'
            ? renderGalleryPage()
            : activePage === 'blogs' && blogsEnabled
              ? renderBlogsPage()
              : renderContactPage();

  return (
    <main
      className={`website-shell min-h-screen text-slate-900 ${themeClasses.pageBackgroundClass}`}
      style={{ fontFamily: 'var(--font-family, Inter, sans-serif)' }}
    >
      <div className="relative overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-[42rem] ${themeClasses.ambientBackgroundClass}`} />
        <div className="absolute left-[8%] top-24 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute right-[10%] top-[28rem] h-56 w-56 rounded-full bg-[var(--secondary)]/10 blur-3xl" />

        <div className="website-canvas relative mx-auto w-full space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8" style={{ maxWidth: `${websiteWidth}px` }}>
          <nav className={`website-section sticky top-4 z-20 rounded-[2.3rem] border px-4 py-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6 ${themeClasses.navClass}`}>
            <div className="flex items-center justify-between gap-4 xl:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`website-card flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] text-sm font-black uppercase tracking-[0.18em] ${themeClasses.brandMarkClass}`}>
                  {getInitials(tenant.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black tracking-[-0.04em] text-slate-950">{tenant.name || 'Business Website'}</p>
                  <p className="truncate text-sm capitalize text-slate-500">{businessTypeLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNavOpen(open => !open)}
                aria-expanded={isNavOpen}
                aria-label="Toggle navigation menu"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-slate-700 transition ${themeClasses.secondaryButtonClass}`}
              >
                <span className="text-lg leading-none">{isNavOpen ? 'X' : '='}</span>
              </button>
            </div>

            <div className="hidden xl:grid xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center xl:gap-6">
              <div className="flex items-center gap-4">
                <div className={`website-card flex h-14 w-14 items-center justify-center rounded-[1.4rem] text-sm font-black uppercase tracking-[0.18em] ${themeClasses.brandMarkClass}`}>
                  {getInitials(tenant.name)}
                </div>
                <div>
                  <p className="text-xl font-black tracking-[-0.04em] text-slate-950">{tenant.name || 'Business Website'}</p>
                  <p className="text-sm capitalize text-slate-500">{businessTypeLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {navPages.map(page => {
                  const isActive = page.id === activePage;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => goToPage(page.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? `${themeClasses.brandMarkClass} shadow-[0_14px_28px_rgba(15,23,42,0.14)]`
                          : 'bg-white/82 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden text-right 2xl:block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{currentPageMeta.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{currentPageMeta.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => goToPage('contact')}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${themeClasses.primaryButtonClass}`}
                >
                  Contact
                </button>
              </div>
            </div>

            <div className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 xl:hidden ${isNavOpen ? 'mt-4 max-h-[36rem] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 border-t border-white/70 pt-4">
                <div className="rounded-[1.5rem] border border-white/70 bg-white/60 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{currentPageMeta.label}</p>
                  <p className="mt-2 text-sm text-slate-600">{currentPageMeta.summary}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {navPages.map(page => {
                    const isActive = page.id === activePage;
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => goToPage(page.id)}
                        className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                          isActive
                            ? `${themeClasses.brandMarkClass} shadow-[0_14px_28px_rgba(15,23,42,0.14)]`
                            : 'bg-white/82 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{page.label}</span>
                        <span className={`mt-1 block text-xs ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{page.summary}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => goToPage('contact')}
                  className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${themeClasses.primaryButtonClass}`}
                >
                  Contact
                </button>
              </div>
            </div>
          </nav>

          {activePageContent}

          <footer className={`website-section rounded-[2.2rem] border p-8 text-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10 ${themeClasses.footerClass}`}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_0.85fr_0.9fr]">
              <div className="space-y-5">
                <div>
                  <p className="text-lg font-bold tracking-tight text-slate-950">{tenant.name || 'Business Website'}</p>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
                    {content.description || `${tenant.name || 'This business'} offers a polished digital presence with clear navigation, highlights, and direct contact paths.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600">{businessTypeLabel}</div>
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600">{categorySummary}</div>
                  <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-600">{gallerySummary}</div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Navigation</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {navPages.map(page => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => goToPage(page.id)}
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
                onClick={() => goToPage('contact')}
                className={`rounded-full px-5 py-2.5 font-semibold transition ${themeClasses.footerButtonClass}`}
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
