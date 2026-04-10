'use client';

import { useState } from 'react';
import PricingCard from '../../components/ui/PricingCard';

const plans = [
  { name: 'Basic', price: '₹99/mo', features: ['Single website', 'Basic templates', 'Booking form'], plan: 'basic' },
  { name: 'Pro', price: '₹399/mo', features: ['Custom domain', 'Advanced themes', 'Priority support', 'Analytics dashboard'], plan: 'pro' },
  { name: 'Premium', price: '₹699/mo', features: ['Unlimited pages', 'E-commerce tools', 'White label', 'API access'], plan: 'premium' }
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">Simple, transparent pricing</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Choose the plan that's right for you. All plans include our core features, 24/7 support, and a 14-day free trial.
          </p>
          
          <div className="mt-8 flex justify-center items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Monthly</span>
            <button 
              onClick={() => setYearly(!yearly)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${yearly ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${yearly ? 'translate-x-5' : 'translate-x-0'}`}></span>
            </button>
            <span className="text-sm font-medium text-slate-500">Yearly <span className="text-indigo-600">(Save 20%)</span></span>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map(plan => (
            <PricingCard key={plan.plan} plan={plan} yearly={yearly} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-base text-slate-500">
            Need a custom solution for your enterprise? <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Contact our sales team</a>
          </p>
        </div>
      </div>
    </div>
  );
}

