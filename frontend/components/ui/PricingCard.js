export default function PricingCard({ plan }) {
  return (
    <div className="rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-2xl font-semibold">{plan.name}</h3>
      <p className="mt-2 text-3xl font-bold">{plan.price}</p>
      <ul className="mt-6 space-y-3 text-slate-600">
        {plan.features.map((feature, index) => <li key={index}>• {feature}</li>)}
      </ul>
      <button className="mt-8 w-full rounded-full bg-primary px-6 py-3 text-white">Buy {plan.name}</button>
    </div>
  );
}
