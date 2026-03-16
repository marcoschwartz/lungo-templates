const { h, useState, useEffect, useRouter } = window.Lungo;

function NavLink({ href, icon, children }) {
  const router = useRouter();
  const isActive = router.pathname === href || (href !== "/" && router.pathname.startsWith(href));
  return (
    <a
      href={href}
      class={isActive
        ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 font-medium text-sm"
        : "flex items-center gap-3 px-3 py-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors text-sm"}
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const isAuthPage = router.pathname === "/login";

  useEffect(() => { setMenuOpen(false); }, [router.pathname]);

  if (isAuthPage) {
    return (
      <div class="min-h-screen bg-[#0f0a06] text-stone-100">
        {children}
      </div>
    );
  }

  const nav = (
    <div class="flex flex-col gap-1 p-3">
      <NavLink href="/dashboard" icon={<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z"/></svg>}>
        Dashboard
      </NavLink>
      <NavLink href="/data" icon={<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>}>
        Data
      </NavLink>
      <NavLink href="/storage" icon={<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>}>
        Storage
      </NavLink>
      <NavLink href="/settings" icon={<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}>
        Settings
      </NavLink>
    </div>
  );

  return (
    <div class="min-h-screen bg-[#0f0a06] text-stone-100 flex">
      <aside class="hidden md:flex w-56 flex-col border-r border-stone-800 bg-[#0a0704]">
        <div class="p-4 border-b border-stone-800">
          <a href="/dashboard" class="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent no-underline">
            MyApp
          </a>
        </div>
        {nav}
        <div class="mt-auto p-3 border-t border-stone-800">
          <form method="POST" action="/__action/logout">
            <button type="submit" class="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors text-sm w-full">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      <div class="flex-1 flex flex-col">
        <header class="md:hidden flex items-center justify-between px-4 h-14 border-b border-stone-800">
          <a href="/dashboard" class="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent no-underline">
            MyApp
          </a>
          <button onclick={() => setMenuOpen(!menuOpen)} class="text-stone-400 p-2" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </header>
        {menuOpen ? (
          <div class="md:hidden border-b border-stone-800 bg-[#0a0704]">
            {nav}
          </div>
        ) : null}
        <main class="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
