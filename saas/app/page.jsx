const { h } = window.Lungo;

export const metadata = { title: "SaaSKit — Built with Lungo", description: "A SaaS starter template." };

export default function Home() {
  return (
    <div class="max-w-4xl mx-auto py-20 px-6 text-center">
      <span class="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-6">
        Built with Lungo
      </span>
      <h1 class="text-5xl font-extrabold tracking-tight mb-6 text-gray-900">
        Ship your SaaS <span class="text-blue-600">faster</span>
      </h1>
      <p class="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
        Authentication, dashboard, settings, pricing — all wired up and ready to customize. Powered by Go.
      </p>
      <div class="flex gap-4 justify-center">
        <a href="/login" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium no-underline">
          Get Started
        </a>
        <a href="/pricing" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium no-underline">
          View Pricing
        </a>
      </div>

      <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div class="p-6 rounded-xl border border-gray-200 bg-white">
          <div class="text-2xl mb-3">⚡</div>
          <h3 class="font-bold mb-2">Single Binary</h3>
          <p class="text-sm text-gray-500">Deploy as one file. No Node.js, no runtime dependencies.</p>
        </div>
        <div class="p-6 rounded-xl border border-gray-200 bg-white">
          <div class="text-2xl mb-3">🔒</div>
          <h3 class="font-bold mb-2">Auth Ready</h3>
          <p class="text-sm text-gray-500">Login flow, session management, and protected routes out of the box.</p>
        </div>
        <div class="p-6 rounded-xl border border-gray-200 bg-white">
          <div class="text-2xl mb-3">📊</div>
          <h3 class="font-bold mb-2">Dashboard</h3>
          <p class="text-sm text-gray-500">Stats, charts, activity feed — all connected to Go API routes.</p>
        </div>
      </div>
    </div>
  );
}
