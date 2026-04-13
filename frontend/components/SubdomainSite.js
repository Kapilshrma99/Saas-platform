'use client';
import { useEffect, useState } from 'react';
import WebsiteRenderer from './WebsiteRenderer';

export default function SubdomainSite() {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const host = window.location.host.split(':')[0];
    const subdomain = host.split('.')?.[0];
    if (!subdomain || subdomain === 'localhost' || subdomain === 'www') {
      setLoading(false);
      return;
    }
    fetch(`/api/tenants/${subdomain}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setTenant(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container p-10">Loading tenant...</div>;
  return <WebsiteRenderer tenant={tenant} />;
}
