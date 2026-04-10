export default function PricingCard({ plan }) {
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
          <span className="text-4xl font-extrabold tracking-tight text-slate-900">{plan.price.split('/')[0]}</span>
          <span className="text-sm font-semibold text-slate-500">/mo</span>
        </div>
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

      <button className={`w-full rounded-2xl py-4 font-bold transition-all active:scale-95 ${
        isPro 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' 
          : 'bg-slate-900 text-white hover:bg-slate-800'
      }`}>
        Subscribe to {plan.name}
      </button>
    </div>
  );
}

