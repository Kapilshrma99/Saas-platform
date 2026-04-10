import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background blobs */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-50 blur-3xl" />
      <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-pink-50 blur-3xl opacity-50" />

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 md:pt-32 md:pb-40">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left">
            <div className="lg:w-1/2">
              <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                New: AI-Powered Templates
              </span>
              <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl">
                Build your <span className="gradient-text">dream business</span> faster.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 md:text-xl">
                Launch a modern, high-converting business website with dynamic themes, integrated bookings, and seamless subscription payments. No code required.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/pricing" className="rounded-full bg-indigo-600 px-8 py-4 text-center font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95">
                  Get Started Free
                </Link>
                <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-8 py-4 text-center font-bold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95">
                  Live Demo
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500 lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <span>Trusted by 2,000+ creators</span>
              </div>
            </div>

            <div className="mt-16 lg:mt-0 lg:w-1/2 lg:pl-12">
              <div className="relative">
                <div className="animate-float overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-indigo-100">
                  <img 
                    src="/dashboard-hero.png" 
                    alt="Platform Dashboard" 
                    className="rounded-xl w-full h-auto"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-2xl bg-indigo-600 shadow-xl sm:h-32 sm:w-32" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to succeed</h2>
            <p className="mt-4 text-slate-600">Powerful features designed to help your business grow without the technical headache.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: 'Dynamic Themes', desc: 'Choose from dozens of professionally designed themes that look great on any device.' },
              { title: 'Smart Bookings', desc: 'Integrated scheduling system that lets your customers book services directly.' },
              { title: 'Global Payments', desc: 'Accept payments in 135+ currencies with local payment methods enabled.' }
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-indigo-200 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

