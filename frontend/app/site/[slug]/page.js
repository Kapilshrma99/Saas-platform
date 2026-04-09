import WebsiteRenderer from '../../../components/WebsiteRenderer';

const fetchTenant = async slug => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${slug}`);
  if (!res.ok) return null;
  return res.json();
};

export default async function SitePage({ params }) {
  const tenant = await fetchTenant(params.slug);
  return <WebsiteRenderer tenant={tenant} />;
}
