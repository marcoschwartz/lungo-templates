const { h, useState } = window.Lungo;

export const metadata = {
  title: "Sign In — MyApp",
};

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">MyApp</h1>
          <p class="text-stone-500 text-sm">Sign in to your account</p>
        </div>

        <form method="POST" action="/__action/login" class="space-y-4">
          {error ? (
            <div class="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          ) : null}

          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              required
              class="w-full px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-amber-500/50 placeholder-stone-600"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              class="w-full px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-amber-500/50 placeholder-stone-600"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            class="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            Sign In
          </button>
        </form>

        <p class="text-center text-stone-600 text-xs mt-6">
          Powered by OmniKit + Lungo
        </p>
      </div>
    </div>
  );
}
