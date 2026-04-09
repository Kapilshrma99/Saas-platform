import PricingCard from '../../components/ui/PricingCard';

const plans = [
  { name: 'Basic', price: '₹99/mo', features: ['Single website', 'Basic templates', 'Booking form'], plan: 'basic' },
  { name: 'Pro', price: '₹399/mo', features: ['Custom domain', 'Advanced themes', 'Priority support'], plan: 'pro' },
  { name: 'Premium', price: '₹699/mo', features: ['Unlimited pages', 'E-commerce tools', 'White label'], plan: 'premium' }
];

export default function PricingPage() {
  return (
    <main className="container">
      <div className="space-y-4 rounded-3xl border border-slate-200 p-10 shadow-sm">
        <h1 className="text-4xl font-bold">Pricing Plans</h1>
        <p className="text-slate-600">Choose the plan that fits your business and start building instantly.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map(plan => <PricingCard key={plan.plan} plan={plan} />)}
        </div>
      </div>
    </main>
  );
}
