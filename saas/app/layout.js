const { h, useState, useRouter, useEffect, useRef } = window.Lungo;

// Cache user across navigations
let cachedUser = null;

function NavLink({ href, children }) {
  const router = useRouter();
  const isActive = router.pathname === href;

  return h`
    <a href=${href} class=${isActive
      ? "flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm"
      : "flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors"}>
      ${children}
    </a>
  `;
}

export default function Layout({ children }) {
  const [user, setUser] = useState(() => cachedUser);
  const router = useRouter();
  const fetched = useRef(false);

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      fetch("/api/me")
        .then(r => { if (r.ok) return r.json(); throw new Error("no auth"); })
        .then(data => { cachedUser = data; setUser(data); })
        .catch(() => { cachedUser = null; setUser(null); });
    }
  }, []);

  const isPublic = router.pathname === "/" || router.pathname === "/login" || router.pathname === "/pricing";

  if (isPublic) {
    return h`
      <div class="min-h-screen bg-white">
        <nav class="flex items-center justify-between px-6 h-16 border-b border-gray-200">
          <a href="/" class="text-xl font-bold text-blue-600 no-underline">SaaSKit</a>
          <div class="flex items-center gap-4">
            <a href="/pricing" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
            ${user
              ? h`<a href="/dashboard" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors no-underline">Dashboard</a>`
              : h`<a href="/login" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors no-underline">Sign In</a>`}
          </div>
        </nav>
        ${children}
      </div>
    `;
  }

  return h`
    <div class="min-h-screen flex bg-gray-50">
      <aside class="w-64 bg-white border-r border-gray-200 p-4 flex flex-col shrink-0">
        <a href="/" class="text-xl font-bold text-blue-600 no-underline mb-8 px-4">SaaSKit</a>
        <nav class="flex flex-col gap-1">
          <${NavLink} href="/dashboard">Dashboard<//>
          <${NavLink} href="/tasks">Tasks<//>
          <${NavLink} href="/settings">Settings<//>
          <${NavLink} href="/pricing">Pricing<//>
        </nav>
        <div class="mt-auto pt-4 border-t border-gray-200">
          ${user ? h`
            <div class="flex items-center gap-3 px-4 py-2">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">${user.avatar}</div>
              <div>
                <div class="text-sm font-medium text-gray-900">${user.name}</div>
                <div class="text-xs text-gray-400">${user.plan} plan</div>
              </div>
            </div>
          ` : null}
          <form method="POST" action="/action/logout">
            <button
              type="submit"
              class="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors mt-2"
            >Sign out</button>
          </form>
        </div>
      </aside>
      <main class="flex-1 p-8">
        ${children}
      </main>
    </div>
  `;
}
