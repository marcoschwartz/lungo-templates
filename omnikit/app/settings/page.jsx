const { h, useState, useEffect } = window.Lungo;

export const metadata = {
  title: "Settings — MyApp",
};

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setUser(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div class="text-stone-500 py-12 text-center">Loading...</div>;
  }

  return (
    <div class="max-w-2xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-stone-100">Settings</h1>
        <p class="text-stone-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div class="rounded-xl border border-stone-800 bg-stone-900/50 p-6 mb-6">
        <h2 class="text-lg font-semibold text-stone-200 mb-4">Profile</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-stone-400 mb-1">Email</label>
            <div class="px-4 py-2.5 rounded-lg bg-stone-800 text-stone-300 text-sm">
              {user ? user.email : "—"}
            </div>
          </div>
          <div>
            <label class="block text-sm text-stone-400 mb-1">Display Name</label>
            <div class="px-4 py-2.5 rounded-lg bg-stone-800 text-stone-300 text-sm">
              {user ? (user.display_name || user.username || "—") : "—"}
            </div>
          </div>
          {user && user.plan ? (
            <div>
              <label class="block text-sm text-stone-400 mb-1">Plan</label>
              <div class="inline-flex px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium uppercase">
                {user.plan}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div class="rounded-xl border border-stone-800 bg-stone-900/50 p-6 mb-6">
        <h2 class="text-lg font-semibold text-stone-200 mb-4">API Configuration</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-stone-400 mb-1">API Endpoint</label>
            <code class="block px-4 py-2.5 rounded-lg bg-stone-800 text-amber-400 text-sm font-mono">
              Configured server-side
            </code>
          </div>
          <div>
            <label class="block text-sm text-stone-400 mb-1">Authentication</label>
            <code class="block px-4 py-2.5 rounded-lg bg-stone-800 text-emerald-400 text-sm font-mono">
              {user ? "Authenticated (httpOnly cookie)" : "Not authenticated"}
            </code>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-red-900/30 bg-red-900/10 p-6">
        <h2 class="text-lg font-semibold text-stone-200 mb-2">Danger Zone</h2>
        <p class="text-stone-500 text-sm mb-4">Sign out of your account on this device.</p>
        <form method="POST" action="/__action/logout">
          <button type="submit" class="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors border border-red-500/20">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
