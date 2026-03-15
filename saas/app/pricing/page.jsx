const { h } = window.Lungo;

export const metadata = { title: "Pricing", description: "Simple, transparent pricing." };
export const loader = { url: "/api/pricing" };

function PricingCard({ plan }) {
  return (
    <div class={"rounded-2xl border p-8 flex flex-col " + (plan.popular ? "border-blue-600 ring-2 ring-blue-600 relative" : "border-gray-200")}>
      {plan.popular && (
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
          Most Popular
        </span>
      )}
      <h3 class="text-lg font-bold mb-1">{plan.name}</h3>
      <div class="mb-4">
        <span class="text-4xl font-extrabold">{plan.price === 0 ? "Free" : "$" + plan.price}</span>
        {plan.price > 0 && (<span class="text-gray-500 text-sm">/{plan.period}</span>)}
      </div>
      <ul class="flex flex-col gap-2 mb-8 flex-1">
        {plan.features.map(f => (
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <span class="text-green-500">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button class={"w-full py-2.5 rounded-lg font-medium transition-colors " + (plan.popular
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "border border-gray-300 text-gray-700 hover:bg-gray-50")}>
        {plan.cta}
      </button>
    </div>
  );
}

export default function Pricing({ data }) {
  const plans = Array.isArray(data) ? data : [];

  return (
    <div class="max-w-5xl mx-auto py-20 px-6">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold mb-4">Simple pricing</h1>
        <p class="text-xl text-gray-500">No hidden fees. Cancel anytime.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <PricingCard plan={plan} />
        ))}
      </div>
    </div>
  );
}
