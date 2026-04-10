'use client';

import { useState } from 'react';
import axios from 'axios';

export default function PricingCard({ plan, yearly = false }) {
  const [loading, setLoading] = useState(false);
  
  const price = yearly 
    ? (plan.plan === 'basic' ? 79 : plan.plan === 'pro' ? 319 : 559)
    : (plan.plan === 'basic' ? 99 : plan.plan === 'pro' ? 399 : 699);
  
  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/payments/create-subscription', {
        plan: plan.plan,
        yearly
      });

      if (data.razorpaySubscriptionId) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const checkout = new window.Razorpay({
            key: data.razorpayKeyId,
            subscription_id: data.razorpaySubscriptionId,
            name: 'SaaS Platform',
            description: `${plan.name} Plan - ${yearly ? 'Yearly' : 'Monthly'}`,
            handler: async (response) => {
              await axios.post('/api/payments/verify-subscription', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: data.razorpaySubscriptionId,
                razorpay_signature: response.razorpay_signature
              });
              alert('Subscription activated successfully!');
            }
          });
          checkout.open();
        };
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isPro = plan.plan === 'pro';
  
  return (
    <div className={`relative flex flex-col rounded-3xl p-8 transition-all hover:scale-[1.02] ${
      isPro 
        ? 'border-2 border-indigo-600 bg-white shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' 
        : 'border border-slate-200 bg-white shadow-sm'
    }`}>
      {isPro && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
          Most Popular
        </span>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900">₹{price}</span>
          <span className="text-sm font-semibold text-slate-500">/mo</span>
        </div>
        {yearly && <p className="text-xs text-indigo-600 mt-1">Billed yearly</p>}
      </div>

      <ul className="mb-10 flex-1 space-y-4 text-sm text-slate-600">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <svg className={`h-5 w-5 flex-shrink-0 ${isPro ? 'text-indigo-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button 
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full rounded-2xl py-4 font-bold transition-all active:scale-95 ${
        isPro 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' 
          : 'bg-slate-900 text-white hover:bg-slate-800'
      }`}>
        {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
      </button>
    </div>
  );
}

