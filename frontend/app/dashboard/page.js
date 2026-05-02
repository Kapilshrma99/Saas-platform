'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import WebsiteRenderer from '../../components/WebsiteRenderer';

const clamp = (value, min, max, fallback = min) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return fallback;
  return Math.min(Math.max(numericValue, min), max);
};

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
    reviews: [{ name: '', role: '', quote: '', rating: 5 }],
    blogsEnabled: false,
    blogPosts: [{ id: '', title: '', excerpt: '', content: '', date: '', author: '', image: { url: '', alt: '' } }],
    images: [],
    contactInfo: { phone: '', email: '', address: '' },
    customSections: []
  },
  theme: {
    primaryColor: '#2f80ed',
    secondaryColor: '#f2c94c',
    fontFamily: 'Inter, sans-serif',
    layout: 'modern',
    siteWidth: 1600,
    heroTitleSize: 72,
    sectionRadius: 36,
    cardRadius: 28
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

const createId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyReview = () => ({
  name: '',
  role: '',
  quote: '',
  rating: 5
});

const createEmptyBlogPost = () => ({
  id: createId('blog'),
  title: '',
  excerpt: '',
  content: '',
  date: '',
  author: '',
  image: { url: '', alt: '' }
});

const createEmptyCustomBlock = type => ({
  id: createId('block'),
  type,
  column: 1,
  align: 'left',
  content: '',
  image: { url: '', alt: '' },
  video: { url: '', title: '' }
});

const createEmptyCustomSection = () => ({
  id: createId('section'),
  page: 'home',
  placement: 'bottom',
  title: '',
  description: '',
  layout: 'single',
  blocks: [createEmptyCustomBlock('heading')]
});

const normalizeCustomBlock = block => ({
  id: block?.id || createId('block'),
  type: block?.type || 'text',
  column: clamp(block?.column, 1, 2, 1),
  align: block?.align || 'left',
  content: block?.content || '',
  image: {
    url: block?.image?.url || '',
    alt: block?.image?.alt || ''
  },
  video: {
    url: block?.video?.url || '',
    title: block?.video?.title || ''
  }
});

const normalizeCustomSection = section => ({
  id: section?.id || createId('section'),
  page: section?.page || 'home',
  placement: section?.placement || 'bottom',
  title: section?.title || '',
  description: section?.description || '',
  layout: section?.layout === 'two-column' ? 'two-column' : 'single',
  blocks: Array.isArray(section?.blocks) && section.blocks.length > 0
    ? section.blocks.map(normalizeCustomBlock)
    : [createEmptyCustomBlock('heading')]
});

const sanitizeCustomBlock = block => {
  const normalizedBlock = normalizeCustomBlock(block);
  const hasContent = normalizedBlock.type === 'image'
    ? normalizedBlock.image.url
    : normalizedBlock.type === 'video'
      ? normalizedBlock.video.url
      : normalizedBlock.content;

  return hasContent ? normalizedBlock : null;
};

const sanitizeCustomSection = section => {
  const normalizedSection = normalizeCustomSection(section);
  const blocks = normalizedSection.blocks.map(sanitizeCustomBlock).filter(Boolean);
  const hasSectionContent = normalizedSection.title || normalizedSection.description || blocks.length > 0;
  if (!hasSectionContent) return null;

  return {
    ...normalizedSection,
    blocks: blocks.length > 0 ? blocks : [createEmptyCustomBlock('text')]
  };
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
      reviews: tenant?.content?.reviews?.length
        ? tenant.content.reviews.map(review => ({
            name: review.name || '',
            role: review.role || '',
            quote: review.quote || '',
            rating: clamp(review.rating, 1, 5, 5)
          }))
        : [createEmptyReview()],
      blogsEnabled: Boolean(tenant?.content?.blogsEnabled),
      blogPosts: tenant?.content?.blogPosts?.length
        ? tenant.content.blogPosts.map(post => ({
            id: post.id || createId('blog'),
            title: post.title || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            date: post.date || '',
            author: post.author || '',
            image: {
              url: post.image?.url || '',
              alt: post.image?.alt || ''
            }
          }))
        : [createEmptyBlogPost()],
      images: tenant?.content?.images || [],
      contactInfo: tenant?.content?.contactInfo || { phone: '', email: '', address: '' },
      customSections: tenant?.content?.customSections?.length
        ? tenant.content.customSections.map(normalizeCustomSection)
        : []
    },
    theme: {
      primaryColor: tenant?.theme?.primaryColor || '#2f80ed',
      secondaryColor: tenant?.theme?.secondaryColor || '#f2c94c',
      fontFamily: tenant?.theme?.fontFamily || 'Inter, sans-serif',
      layout: tenant?.theme?.layout || 'modern',
      siteWidth: clamp(tenant?.theme?.siteWidth, 960, 1680, 1600),
      heroTitleSize: clamp(tenant?.theme?.heroTitleSize, 48, 96, 72),
      sectionRadius: clamp(tenant?.theme?.sectionRadius, 16, 48, 36),
      cardRadius: clamp(tenant?.theme?.cardRadius, 12, 40, 28)
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

function ResizableThemeCard({ label, hint, value, min, max, unit, onChange, previewStyle, valueLabel }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return undefined;

    const updateValueFromPointer = clientX => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      onChange(Math.round(min + ratio * (max - min)));
    };

    const handlePointerMove = event => updateValueFromPointer(event.clientX);
    const handlePointerUp = () => setDragging(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, max, min, onChange]);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
          <p className="mt-1 text-sm text-slate-500">{hint}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{valueLabel || `${value}${unit}`}</span>
      </div>

      <div className="mt-4 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex min-h-[140px] items-end justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(47,128,237,0.14),rgba(242,201,76,0.18))] p-4">
          <div className="relative rounded-[inherit] border border-slate-300/80 bg-white/90 shadow-sm transition-all duration-150" style={previewStyle}>
            <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full border border-slate-400 bg-white shadow-sm" />
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-4 h-4 cursor-ew-resize rounded-full bg-slate-200"
        onPointerDown={event => {
          setDragging(true);
          const rect = trackRef.current?.getBoundingClientRect();
          if (!rect) return;
          const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
          onChange(Math.round(min + ratio * (max - min)));
        }}
      >
        <div className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--secondary))]" style={{ width: `${percent}%` }}>
          <div className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full border-4 border-white bg-slate-900 shadow-md" />
        </div>
      </div>
    </div>
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const router = useRouter();

  const isRestaurant = form.businessType === 'restaurant';
  const isShopping = form.businessType === 'shopping';
  const productSectionTitle = isRestaurant ? 'Menu Items' : 'Products';
  const productSectionDescription = isRestaurant
    ? 'Create the dishes customers can browse and order from your restaurant website.'
    : 'Create the catalog items you want shoppers to see on your website.';

  const formSnapshot = useMemo(() => JSON.stringify(form), [form]);
  const hasUnsavedChanges = formSnapshot !== lastSavedSnapshot;
  const previewShellWidth = clamp(form.theme.siteWidth, 960, 1680, 1600);

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
        ),
        reviews: (form.content.reviews || [])
          .map(review => ({
            ...review,
            rating: clamp(review.rating, 1, 5, 5)
          }))
          .filter(review => review.name || review.role || review.quote),
        blogsEnabled: Boolean(form.content.blogsEnabled),
        blogPosts: (form.content.blogPosts || [])
          .map(post => ({
            ...post,
            id: post.id || createId('blog')
          }))
          .filter(post => post.title || post.excerpt || post.content || post.author || post.date || post.image?.url),
        customSections: (form.content.customSections || []).map(sanitizeCustomSection).filter(Boolean)
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

  const handleThemeNumberChange = (key, value, min, max, fallback) => {
    handleFieldChange('theme', key, clamp(value, min, max, fallback));
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

  const handleReviewChange = (index, key, value) => {
    const reviews = [...(form.content.reviews || [])];
    reviews[index] = { ...reviews[index], [key]: key === 'rating' ? clamp(value, 1, 5, 5) : value };
    handleContentChange('reviews', reviews);
  };

  const addReview = () => {
    handleContentChange('reviews', [...(form.content.reviews || []), createEmptyReview()]);
  };

  const removeReview = index => {
    const reviews = (form.content.reviews || []).filter((_, reviewIndex) => reviewIndex !== index);
    handleContentChange('reviews', reviews.length ? reviews : [createEmptyReview()]);
  };

  const handleBlogPostChange = (index, key, value) => {
    const blogPosts = [...(form.content.blogPosts || [])];
    blogPosts[index] = { ...blogPosts[index], [key]: value };
    handleContentChange('blogPosts', blogPosts);
  };

  const handleBlogPostImageChange = (index, key, value) => {
    const blogPosts = [...(form.content.blogPosts || [])];
    blogPosts[index] = {
      ...blogPosts[index],
      image: {
        url: blogPosts[index]?.image?.url || '',
        alt: blogPosts[index]?.image?.alt || '',
        [key]: value
      }
    };
    handleContentChange('blogPosts', blogPosts);
  };

  const addBlogPost = () => {
    handleContentChange('blogPosts', [...(form.content.blogPosts || []), createEmptyBlogPost()]);
  };

  const removeBlogPost = index => {
    const blogPosts = (form.content.blogPosts || []).filter((_, blogIndex) => blogIndex !== index);
    handleContentChange('blogPosts', blogPosts.length ? blogPosts : [createEmptyBlogPost()]);
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

  const handleBlogImageUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setError('Please sign in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading blog image...');
      const url = await uploadImage(file);
      setForm(prev => {
        const blogPosts = [...(prev.content.blogPosts || [])];
        blogPosts[index] = {
          ...blogPosts[index],
          image: {
            url,
            alt: blogPosts[index]?.image?.alt || file.name
          }
        };

        return {
          ...prev,
          content: {
            ...prev.content,
            blogPosts
          }
        };
      });
      setStatus('Blog image uploaded successfully. Save your website to publish it.');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus(null);
    } finally {
      event.target.value = '';
    }
  };

  const updateCustomSections = updater => {
    setForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        customSections: updater(prev.content.customSections || [])
      }
    }));
  };

  const addCustomSection = () => {
    updateCustomSections(sections => [...sections, createEmptyCustomSection()]);
  };

  const removeCustomSection = sectionId => {
    updateCustomSections(sections => sections.filter(section => section.id !== sectionId));
  };

  const moveCustomSection = (sectionId, direction) => {
    updateCustomSections(sections => {
      const index = sections.findIndex(section => section.id === sectionId);
      if (index < 0) return sections;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= sections.length) return sections;
      const nextSections = [...sections];
      const [item] = nextSections.splice(index, 1);
      nextSections.splice(nextIndex, 0, item);
      return nextSections;
    });
  };

  const updateCustomSection = (sectionId, key, value) => {
    updateCustomSections(sections =>
      sections.map(section => (section.id === sectionId ? { ...section, [key]: value } : section))
    );
  };

  const addCustomBlock = (sectionId, type) => {
    updateCustomSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              blocks: [...section.blocks, createEmptyCustomBlock(type)]
            }
          : section
      )
    );
  };

  const removeCustomBlock = (sectionId, blockId) => {
    updateCustomSections(sections =>
      sections.map(section => {
        if (section.id !== sectionId) return section;
        const nextBlocks = section.blocks.filter(block => block.id !== blockId);
        return {
          ...section,
          blocks: nextBlocks.length > 0 ? nextBlocks : [createEmptyCustomBlock('text')]
        };
      })
    );
  };

  const moveCustomBlock = (sectionId, blockId, direction) => {
    updateCustomSections(sections =>
      sections.map(section => {
        if (section.id !== sectionId) return section;
        const index = section.blocks.findIndex(block => block.id === blockId);
        if (index < 0) return section;
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= section.blocks.length) return section;
        const nextBlocks = [...section.blocks];
        const [item] = nextBlocks.splice(index, 1);
        nextBlocks.splice(nextIndex, 0, item);
        return { ...section, blocks: nextBlocks };
      })
    );
  };

  const updateCustomBlock = (sectionId, blockId, updater) => {
    updateCustomSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              blocks: section.blocks.map(block =>
                block.id === blockId ? { ...block, ...updater(block) } : block
              )
            }
          : section
      )
    );
  };

  const handleCustomBlockImageUpload = async (sectionId, blockId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!authToken) {
      setError('Please sign in before uploading images.');
      return;
    }

    try {
      setError(null);
      setStatus('Uploading custom section image...');
      const url = await uploadImage(file);
      updateCustomBlock(sectionId, blockId, block => ({
        image: {
          ...block.image,
          url,
          alt: block.image?.alt || file.name
        }
      }));
      setStatus('Custom section image uploaded successfully. Save your website to publish it.');
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
      theme: {
        ...form.theme,
        siteWidth: clamp(form.theme.siteWidth, 960, 1680, 1600),
        heroTitleSize: clamp(form.theme.heroTitleSize, 48, 96, 72),
        sectionRadius: clamp(form.theme.sectionRadius, 16, 48, 36),
        cardRadius: clamp(form.theme.cardRadius, 12, 40, 28)
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
        ),
        reviews: (form.content.reviews || [])
          .map(review => ({
            ...review,
            rating: clamp(review.rating, 1, 5, 5)
          }))
          .filter(review => review.name || review.role || review.quote),
        blogsEnabled: Boolean(form.content.blogsEnabled),
        blogPosts: (form.content.blogPosts || [])
          .map(post => ({
            ...post,
            id: post.id || createId('blog')
          }))
          .filter(post => post.title || post.excerpt || post.content || post.author || post.date || post.image?.url),
        customSections: (form.content.customSections || []).map(sanitizeCustomSection).filter(Boolean)
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
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-600 p-8 text-white shadow-sm shadow-cyan-500/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Website builder</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{websiteCreated ? 'Edit Your Website' : 'Create Your Website'}</h1>
                <p className="mt-3 max-w-2xl text-sm/relaxed text-cyan-100">
                  Build your business landing page faster with clear sections, live preview, and polished styling.
                  Start with the essentials and update content as you go.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <button type="button" onClick={() => setShowPreviewModal(true)} className={actionButtonClass}>
                  Preview
                </button>
                <button type="button" onClick={handleLogout} className={secondaryButtonClass}>
                  Sign Out
                </button>
              </div>
            </div>
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
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Reviews</h3>
                    <p className="mt-1 text-sm text-slate-500">Show customer feedback as a dedicated reviews section on the website.</p>
                  </div>
                  <button type="button" onClick={addReview} className={actionButtonClass}>
                    Add Review
                  </button>
                </div>

                <div className="space-y-4">
                  {(form.content.reviews || []).map((review, index) => (
                    <div key={`review-${index}`} className="rounded-3xl border border-slate-300 bg-slate-50 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <LabeledInput
                          label={`Reviewer ${index + 1} Name`}
                          name={`reviewName${index}`}
                          autoComplete="off"
                          value={review.name}
                          onChange={e => handleReviewChange(index, 'name', e.target.value)}
                          placeholder="Aarav Mehta..."
                        />

                        <LabeledInput
                          label="Role or Company"
                          name={`reviewRole${index}`}
                          autoComplete="off"
                          value={review.role}
                          onChange={e => handleReviewChange(index, 'role', e.target.value)}
                          placeholder="Patient, Client, Founder..."
                        />

                        <LabeledTextarea
                          label="Review Quote"
                          name={`reviewQuote${index}`}
                          autoComplete="off"
                          rows="4"
                          className={`${textAreaClass} md:col-span-2`}
                          value={review.quote}
                          onChange={e => handleReviewChange(index, 'quote', e.target.value)}
                          placeholder="Share the testimonial you want visitors to read..."
                        />

                        <LabeledInput
                          label="Rating"
                          name={`reviewRating${index}`}
                          type="number"
                          min="1"
                          max="5"
                          step="1"
                          inputMode="numeric"
                          autoComplete="off"
                          value={review.rating}
                          onChange={e => handleReviewChange(index, 'rating', e.target.value)}
                          placeholder="5"
                        />
                      </div>

                      <button type="button" onClick={() => removeReview(index)} className={`mt-3 ${dangerButtonClass}`}>
                        Remove Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Blogs Page</h3>
                    <p className="mt-1 text-sm text-slate-500">Turn this on only when you want a blogs page in the site navigation.</p>
                  </div>
                  <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(form.content.blogsEnabled)}
                      onChange={e => handleContentChange('blogsEnabled', e.target.checked)}
                    />
                    Enable Blogs Page
                  </label>
                </div>

                {Boolean(form.content.blogsEnabled) ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-slate-500">Add posts that will appear on the published blogs page.</p>
                      <button type="button" onClick={addBlogPost} className={actionButtonClass}>
                        Add Blog Post
                      </button>
                    </div>

                    {(form.content.blogPosts || []).map((post, index) => (
                      <div key={post.id || `blog-${index}`} className="rounded-3xl border border-slate-300 bg-slate-50 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <LabeledInput
                            label="Post Title"
                            name={`blogTitle${index}`}
                            autoComplete="off"
                            value={post.title}
                            onChange={e => handleBlogPostChange(index, 'title', e.target.value)}
                            placeholder="5 ways to improve your first visit..."
                          />

                          <LabeledInput
                            label="Author"
                            name={`blogAuthor${index}`}
                            autoComplete="off"
                            value={post.author}
                            onChange={e => handleBlogPostChange(index, 'author', e.target.value)}
                            placeholder="Team SmileCare..."
                          />

                          <LabeledInput
                            label="Publish Date"
                            name={`blogDate${index}`}
                            type="date"
                            value={post.date || ''}
                            onChange={e => handleBlogPostChange(index, 'date', e.target.value)}
                          />

                          <LabeledInput
                            label="Short Excerpt"
                            name={`blogExcerpt${index}`}
                            autoComplete="off"
                            value={post.excerpt}
                            onChange={e => handleBlogPostChange(index, 'excerpt', e.target.value)}
                            placeholder="A short summary shown in the blog card..."
                          />

                          <LabeledTextarea
                            label="Blog Content"
                            name={`blogContent${index}`}
                            autoComplete="off"
                            rows="6"
                            className={`${textAreaClass} md:col-span-2`}
                            value={post.content}
                            onChange={e => handleBlogPostChange(index, 'content', e.target.value)}
                            placeholder="Write the full blog post here..."
                          />
                        </div>

                        <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">Upload Blog Image</span>
                            <input
                              type="file"
                              name={`blogImageUpload${index}`}
                              accept="image/*"
                              onChange={e => handleBlogImageUpload(index, e)}
                              className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700`}
                            />
                          </label>

                          <div className="grid gap-4 md:grid-cols-2">
                            <LabeledInput
                              label="Blog Image URL"
                              name={`blogImageUrl${index}`}
                              type="url"
                              inputMode="url"
                              autoComplete="off"
                              spellCheck={false}
                              value={post.image?.url || ''}
                              onChange={e => handleBlogPostImageChange(index, 'url', e.target.value)}
                              placeholder="https://example.com/blog-image.jpg..."
                            />

                            <LabeledInput
                              label="Blog Image Alt Text"
                              name={`blogImageAlt${index}`}
                              autoComplete="off"
                              value={post.image?.alt || ''}
                              onChange={e => handleBlogPostImageChange(index, 'alt', e.target.value)}
                              placeholder="Describe the blog cover image..."
                            />
                          </div>

                          {post.image?.url ? (
                            <img
                              src={post.image.url}
                              alt={post.image.alt || `Blog post ${index + 1}`}
                              width="720"
                              height="352"
                              loading="lazy"
                              className="h-44 w-full rounded-2xl object-cover"
                            />
                          ) : null}
                        </div>

                        <button type="button" onClick={() => removeBlogPost(index)} className={`mt-3 ${dangerButtonClass}`}>
                          Remove Blog Post
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Blogs are disabled for this site right now.</p>
                )}
              </div>

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

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Custom Sections</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Add your own sections and choose which page they appear on. You can mix headings, text, images, and videos.
                    </p>
                  </div>
                  <button type="button" onClick={addCustomSection} className={actionButtonClass}>
                    Add Section
                  </button>
                </div>

                {form.content.customSections.length > 0 ? (
                  <div className="space-y-5">
                    {form.content.customSections.map((section, sectionIndex) => (
                      <div key={section.id} className="rounded-3xl border border-slate-300 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Section {sectionIndex + 1}</p>
                            <p className="mt-1 text-sm text-slate-500">Choose the page, placement, layout, and content blocks for this section.</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => moveCustomSection(section.id, -1)} className={secondaryButtonClass}>
                              Move Up
                            </button>
                            <button type="button" onClick={() => moveCustomSection(section.id, 1)} className={secondaryButtonClass}>
                              Move Down
                            </button>
                            <button type="button" onClick={() => removeCustomSection(section.id)} className={dangerButtonClass}>
                              Remove Section
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <LabeledInput
                            label="Section Title"
                            name={`customSectionTitle${sectionIndex}`}
                            autoComplete="off"
                            value={section.title}
                            onChange={e => updateCustomSection(section.id, 'title', e.target.value)}
                            placeholder="Why clients choose us..."
                          />

                          <LabeledInput
                            label="Section Description"
                            name={`customSectionDescription${sectionIndex}`}
                            autoComplete="off"
                            value={section.description}
                            onChange={e => updateCustomSection(section.id, 'description', e.target.value)}
                            placeholder="Optional short intro for this section..."
                          />

                          <LabeledSelect
                            label="Page"
                            name={`customSectionPage${sectionIndex}`}
                            value={section.page}
                            onChange={e => updateCustomSection(section.id, 'page', e.target.value)}
                          >
                            <option value="home">Home</option>
                            <option value="about">About</option>
                            <option value="offerings">Offerings</option>
                            <option value="gallery">Gallery</option>
                            <option value="blogs">Blogs</option>
                            <option value="contact">Contact</option>
                          </LabeledSelect>

                          <LabeledSelect
                            label="Placement"
                            name={`customSectionPlacement${sectionIndex}`}
                            value={section.placement}
                            onChange={e => updateCustomSection(section.id, 'placement', e.target.value)}
                          >
                            <option value="top">Top of page</option>
                            <option value="middle">Middle of page</option>
                            <option value="bottom">Bottom of page</option>
                          </LabeledSelect>

                          <LabeledSelect
                            label="Layout"
                            name={`customSectionLayout${sectionIndex}`}
                            value={section.layout}
                            onChange={e => updateCustomSection(section.id, 'layout', e.target.value)}
                          >
                            <option value="single">Single column</option>
                            <option value="two-column">Two columns</option>
                          </LabeledSelect>
                        </div>

                        <div className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="text-base font-semibold text-slate-900">Blocks</h4>
                              <p className="mt-1 text-sm text-slate-500">Add content pieces and move them into the order you want.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => addCustomBlock(section.id, 'heading')} className={secondaryButtonClass}>
                                Add Heading
                              </button>
                              <button type="button" onClick={() => addCustomBlock(section.id, 'text')} className={secondaryButtonClass}>
                                Add Text
                              </button>
                              <button type="button" onClick={() => addCustomBlock(section.id, 'image')} className={secondaryButtonClass}>
                                Add Image
                              </button>
                              <button type="button" onClick={() => addCustomBlock(section.id, 'video')} className={secondaryButtonClass}>
                                Add Video
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {section.blocks.map((block, blockIndex) => (
                              <div key={block.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Block {blockIndex + 1} ({block.type})
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                      {block.type === 'heading'
                                        ? 'Use this for large section titles or callouts.'
                                        : block.type === 'text'
                                          ? 'Use this for paragraphs, selling points, or extra detail.'
                                          : block.type === 'image'
                                            ? 'Use this to place a visual anywhere inside the section.'
                                            : 'Use a YouTube, Vimeo, or direct MP4 link for video content.'}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => moveCustomBlock(section.id, block.id, -1)} className={secondaryButtonClass}>
                                      Up
                                    </button>
                                    <button type="button" onClick={() => moveCustomBlock(section.id, block.id, 1)} className={secondaryButtonClass}>
                                      Down
                                    </button>
                                    <button type="button" onClick={() => removeCustomBlock(section.id, block.id)} className={dangerButtonClass}>
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                  <LabeledSelect
                                    label="Alignment"
                                    name={`customBlockAlign${sectionIndex}${blockIndex}`}
                                    value={block.align}
                                    onChange={e =>
                                      updateCustomBlock(section.id, block.id, currentBlock => ({
                                        align: e.target.value,
                                        column: currentBlock.column
                                      }))
                                    }
                                  >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                  </LabeledSelect>

                                  <LabeledSelect
                                    label="Column"
                                    name={`customBlockColumn${sectionIndex}${blockIndex}`}
                                    value={block.column}
                                    onChange={e =>
                                      updateCustomBlock(section.id, block.id, () => ({
                                        column: clamp(e.target.value, 1, 2, 1)
                                      }))
                                    }
                                  >
                                    <option value="1">Column 1</option>
                                    <option value="2">Column 2</option>
                                  </LabeledSelect>
                                </div>

                                {block.type === 'image' ? (
                                  <div className="mt-4 space-y-4">
                                    <label className="block">
                                      <span className="text-sm font-medium text-slate-700">Upload Image</span>
                                      <input
                                        type="file"
                                        name={`customBlockImageUpload${sectionIndex}${blockIndex}`}
                                        accept="image/*"
                                        onChange={e => handleCustomBlockImageUpload(section.id, block.id, e)}
                                        className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700`}
                                      />
                                    </label>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                      <LabeledInput
                                        label="Image URL"
                                        name={`customBlockImageUrl${sectionIndex}${blockIndex}`}
                                        type="url"
                                        inputMode="url"
                                        autoComplete="off"
                                        spellCheck={false}
                                        value={block.image?.url || ''}
                                        onChange={e =>
                                          updateCustomBlock(section.id, block.id, currentBlock => ({
                                            image: {
                                              ...currentBlock.image,
                                              url: e.target.value
                                            }
                                          }))
                                        }
                                        placeholder="https://example.com/custom-section-image.jpg"
                                      />

                                      <LabeledInput
                                        label="Image Alt Text"
                                        name={`customBlockImageAlt${sectionIndex}${blockIndex}`}
                                        autoComplete="off"
                                        value={block.image?.alt || ''}
                                        onChange={e =>
                                          updateCustomBlock(section.id, block.id, currentBlock => ({
                                            image: {
                                              ...currentBlock.image,
                                              alt: e.target.value
                                            }
                                          }))
                                        }
                                        placeholder="Describe this image..."
                                      />
                                    </div>

                                    {block.image?.url ? (
                                      <img
                                        src={block.image.url}
                                        alt={block.image.alt || `Custom block ${blockIndex + 1}`}
                                        width="960"
                                        height="540"
                                        loading="lazy"
                                        className="h-52 w-full rounded-2xl object-cover"
                                      />
                                    ) : null}
                                  </div>
                                ) : block.type === 'video' ? (
                                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    <LabeledInput
                                      label="Video URL"
                                      name={`customBlockVideoUrl${sectionIndex}${blockIndex}`}
                                      type="url"
                                      inputMode="url"
                                      autoComplete="off"
                                      spellCheck={false}
                                      value={block.video?.url || ''}
                                      onChange={e =>
                                        updateCustomBlock(section.id, block.id, currentBlock => ({
                                          video: {
                                            ...currentBlock.video,
                                            url: e.target.value
                                          }
                                        }))
                                      }
                                      placeholder="https://www.youtube.com/watch?v=..."
                                    />

                                    <LabeledInput
                                      label="Video Title"
                                      name={`customBlockVideoTitle${sectionIndex}${blockIndex}`}
                                      autoComplete="off"
                                      value={block.video?.title || ''}
                                      onChange={e =>
                                        updateCustomBlock(section.id, block.id, currentBlock => ({
                                          video: {
                                            ...currentBlock.video,
                                            title: e.target.value
                                          }
                                        }))
                                      }
                                      placeholder="Customer testimonial video..."
                                    />
                                  </div>
                                ) : (
                                  <LabeledTextarea
                                    label={block.type === 'heading' ? 'Heading Text' : 'Text Content'}
                                    name={`customBlockContent${sectionIndex}${blockIndex}`}
                                    autoComplete="off"
                                    rows={block.type === 'heading' ? '2' : '5'}
                                    value={block.content || ''}
                                    onChange={e =>
                                      updateCustomBlock(section.id, block.id, () => ({
                                        content: e.target.value
                                      }))
                                    }
                                    placeholder={block.type === 'heading' ? 'Your new section headline...' : 'Write the text you want visitors to read...'}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No custom sections added yet.</p>
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

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-100 p-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Resize With Mouse</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Drag the controls below to change the published website width, headline size, and roundness.
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <ResizableThemeCard
                    label="Website Width"
                    hint="Make the whole site feel wider or more compact."
                    value={clamp(form.theme.siteWidth, 960, 1680, 1600)}
                    min={960}
                    max={1680}
                    unit="px"
                    onChange={nextValue => handleThemeNumberChange('siteWidth', nextValue, 960, 1680, 1600)}
                    previewStyle={{
                      width: `${90 + ((clamp(form.theme.siteWidth, 960, 1680, 1600) - 960) / 720) * 130}px`,
                      height: '76px'
                    }}
                  />

                  <ResizableThemeCard
                    label="Hero Title Size"
                    hint="Change how big the main heading appears."
                    value={clamp(form.theme.heroTitleSize, 48, 96, 72)}
                    min={48}
                    max={96}
                    unit="px"
                    onChange={nextValue => handleThemeNumberChange('heroTitleSize', nextValue, 48, 96, 72)}
                    previewStyle={{
                      width: `${120 + ((clamp(form.theme.heroTitleSize, 48, 96, 72) - 48) / 48) * 70}px`,
                      height: `${28 + ((clamp(form.theme.heroTitleSize, 48, 96, 72) - 48) / 48) * 48}px`
                    }}
                  />

                  <ResizableThemeCard
                    label="Section Roundness"
                    hint="Control the outer shape of big sections like nav, hero, and footer."
                    value={clamp(form.theme.sectionRadius, 16, 48, 36)}
                    min={16}
                    max={48}
                    unit="px"
                    onChange={nextValue => handleThemeNumberChange('sectionRadius', nextValue, 16, 48, 36)}
                    previewStyle={{
                      width: '170px',
                      height: '96px',
                      borderRadius: `${clamp(form.theme.sectionRadius, 16, 48, 36)}px`
                    }}
                  />

                  <ResizableThemeCard
                    label="Card Roundness"
                    hint="Adjust smaller cards and information blocks across the site."
                    value={clamp(form.theme.cardRadius, 12, 40, 28)}
                    min={12}
                    max={40}
                    unit="px"
                    onChange={nextValue => handleThemeNumberChange('cardRadius', nextValue, 12, 40, 28)}
                    previewStyle={{
                      width: '144px',
                      height: '88px',
                      borderRadius: `${clamp(form.theme.cardRadius, 12, 40, 28)}px`
                    }}
                  />
                </div>
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

        <aside className="space-y-6 xl:sticky xl:top-24">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-100 to-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Website at a glance</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">{form.name || 'Your site preview'}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {form.slug ? `Accessible at /site/${form.slug}` : 'Add a slug and save to publish your website.'}
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{websiteCreated ? 'Published' : 'Draft'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Type</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 capitalize">{form.businessType.replace('-', ' ')}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Theme</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 capitalize">{form.theme.layout}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button type="button" onClick={() => setShowPreviewModal(true)} className={actionButtonClass}>
                Live Preview
              </button>
              {websiteCreated && form.slug ? (
                <Link href={`/site/${form.slug}`} className={secondaryButtonClass}>
                  Open Published Website
                </Link>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Quick start</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">Build faster</h3>

            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <strong className="block text-slate-900">1. Enter your basics</strong>
                Add your business name, slug, and select the type of service.
              </li>
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <strong className="block text-slate-900">2. Add hero content</strong>
                Upload a hero image and write a short homepage message.
              </li>
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <strong className="block text-slate-900">3. Customize sections</strong>
                Add services, products, reviews, and gallery images.
              </li>
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <strong className="block text-slate-900">4. Pick a style</strong>
                Use the Theme section to refine colors, fonts, and layout.
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <h2 className="text-balance text-xl font-semibold text-slate-900">Live Preview</h2>
                <p className="mt-1 text-sm text-slate-600">Preview your site while you create or edit it.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100">
              <div className="min-w-[720px] origin-top-left scale-[0.6] sm:scale-[0.75] md:scale-[0.85]">
                <div style={{ width: `${previewShellWidth}px` }}>
                  <WebsiteRenderer tenant={previewTenant} />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4">
              {websiteCreated && form.slug ? (
                <Link href={`/site/${form.slug}`} className={actionButtonClass}>
                  Open Published Website
                </Link>
              ) : (
                <p className="text-sm text-slate-500">Publish your website to view it live.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
