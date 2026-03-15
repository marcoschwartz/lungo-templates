const { h, useRouter } = window.Lungo;

function NavLink({ href, children }) {
  const router = useRouter();
  const isActive = router.pathname === href;

  return h`
    <a
      href=${href}
      class=${isActive
        ? "text-blue-600 font-semibold px-3 py-2"
        : "text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors"}
    >
      ${children}
    </a>
  `;
}

export default function Layout({ children }) {
  return h`
    <div class="min-h-screen flex flex-col bg-white">
      <nav class="flex items-center px-6 border-b border-gray-200 h-16">
        <a href="/" class="text-xl font-bold text-blue-600 no-underline mr-8">
          My App
        </a>
        <div class="flex items-center gap-1">
          <${NavLink} href="/">Home<//>
          <${NavLink} href="/about">About<//>
        </div>
      </nav>
      <main class="flex-1 py-10 px-6 max-w-4xl mx-auto w-full">
        ${children}
      </main>
      <footer class="border-t border-gray-200 py-6 text-center text-gray-400 text-sm">
        Built with Lungo
      </footer>
    </div>
  `;
}
