import WebsiteRenderer from '../../../components/WebsiteRenderer';

const backendApiOrigins = [
  process.env.INTERNAL_API_URL,
  process.env.NEXT_PUBLIC_API_URL,
  'http://localhost:5000',
  'http://backend:5000'
].filter(Boolean);

const fetchTenant = async slug => {
  for (const origin of backendApiOrigins) {
    try {
      const res = await fetch(`${origin}/api/tenants/${slug}`, { cache: 'no-store' });
      if (res.ok) return res.json();
      if (res.status === 404) return null;
    } catch (error) {
      console.error(`Failed to fetch tenant from ${origin}:`, error);
    }
  }

  return null;
};

export default async function SitePage({ params }) {
  const tenant = await fetchTenant(params.slug);
  return <WebsiteRenderer tenant={tenant} />;
}
