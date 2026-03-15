const { h, useState, useRouter } = window.Lungo;

export const metadata = { title: "Sign In", description: "Sign in to your account." };

export default function LoginPage() {
  const router = useRouter();
  const error = new URLSearchParams(router.query).get("error");

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-6">
      <div class="w-full max-w-sm">
        <h1 class="text-2xl font-bold text-center mb-2">Welcome back</h1>
        <p class="text-gray-500 text-center text-sm mb-8">Sign in to your account</p>

        {error && (
          <div class="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {decodeURIComponent(error)}
          </div>
        )}

        <form method="POST" action="/action/login" class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value="demo@example.com"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value="demo123"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            class="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </form>

        <p class="text-xs text-gray-400 text-center mt-6">
          Demo: demo@example.com / demo123
        </p>
      </div>
    </div>
  );
}
