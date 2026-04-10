import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 p-10 shadow-sm">
          <h1 className="text-4xl font-bold">Multi-tenant Website Builder</h1>
          <p className="mt-4 text-lg text-slate-700">
            Launch a responsive business website with dynamic themes, bookings, and subscription payments.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/pricing" className="rounded-full bg-primary px-6 py-3 text-white">View Pricing</Link>
            <Link href="/dashboard" className="rounded-full border border-slate-300 px-6 py-3">Open Dashboard</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
