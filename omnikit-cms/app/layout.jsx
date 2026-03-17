const { h, useState, useEffect, useRouter } = window.Lungo;

function NavLink({ href, children }) {
  const router = useRouter();
  const isActive = router.pathname === href || (href !== "/" && router.pathname.startsWith(href));
  return (
    <a
      href={href}
      class={isActive
        ? "text-amber-400 font-medium text-sm"
        : "text-stone-400 hover:text-stone-200 transition-colors text-sm"}
    >
      {children}
    </a>
  );
}

export default function Layout({ children }) {
  return (
    <div class="min-h-screen bg-[#0f0a06] text-stone-100">
      <nav class="border-b border-amber-900/20 backdrop-blur-xl bg-[#0f0a06]/80 sticky top-0 z-50">
        <div class="max-w-5xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
          <a href="/" class="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent no-underline">
            MySite
          </a>
          <div class="flex items-center gap-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer class="border-t border-amber-900/20 py-12 px-4">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span class="text-sm text-stone-600">Built with Lungo + OmniKit</span>
          <div class="flex gap-6">
            <a href="/blog" class="text-sm text-stone-500 hover:text-stone-300 no-underline">Blog</a>
            <a href="/contact" class="text-sm text-stone-500 hover:text-stone-300 no-underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
