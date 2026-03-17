const { h, useState } = window.Lungo;

export const metadata = {
  title: "MySite — Powered by Lungo + OmniKit",
  description: "A static site with CMS content, blog, and lead capture."
};

function FeatureCard({ icon, title, description }) {
  return (
    <div class="rounded-xl border border-amber-800/20 bg-amber-900/10 p-6 hover:bg-amber-900/20 transition-all">
      <div class="text-2xl mb-3">{icon}</div>
      <h3 class="text-lg font-semibold text-stone-100 mb-2">{title}</h3>
      <p class="text-sm text-stone-400 leading-relaxed">{description}</p>
    </div>
  );
}

function EmailCapture() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div class="text-center py-4">
        <p class="text-amber-400 font-medium">Thanks for subscribing!</p>
      </div>
    );
  }

  return (
    <form method="POST" action="/action/subscribe" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        class="flex-1 px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-sm focus:outline-none focus:border-amber-500/50 placeholder-stone-600"
      />
      <button type="submit" class="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-700 transition-all whitespace-nowrap">
        Subscribe
      </button>
    </form>
  );
}

export default function HomePage() {
  return (
    <div>
      <section class="max-w-5xl mx-auto px-4 md:px-6 pt-20 md:pt-32 pb-16 text-center">
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span class="bg-gradient-to-r from-stone-100 via-amber-100 to-stone-100 bg-clip-text text-transparent">Your content,</span>
          <br />
          <span class="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">delivered fast.</span>
        </h1>
        <p class="text-xl text-stone-400 max-w-2xl mx-auto mb-10">
          A static site powered by Lungo and OmniKit CMS. Blog posts managed via API, leads captured via messaging, all served as cached HTML.
        </p>
        <div class="flex flex-wrap justify-center gap-4 mb-16">
          <a href="/blog" class="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-700 transition-all no-underline">
            Read the Blog
          </a>
          <a href="/contact" class="px-6 py-3 rounded-lg bg-amber-900/20 text-stone-200 font-semibold text-sm hover:bg-amber-900/30 transition-all no-underline border border-amber-800/30">
            Get in Touch
          </a>
        </div>
      </section>

      <section class="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="&#9889;"
            title="Static + ISR"
            description="Pages cached as pure HTML. Blog posts revalidate every 60 seconds via OmniKit CMS."
          />
          <FeatureCard
            icon="&#9997;"
            title="CMS Managed"
            description="Create and edit blog posts in OmniKit. No code changes needed — content updates automatically."
          />
          <FeatureCard
            icon="&#9993;"
            title="Lead Capture"
            description="Email signups go straight to OmniKit Messaging. Build your audience with zero infrastructure."
          />
        </div>
      </section>

      <section class="max-w-5xl mx-auto px-4 md:px-6 pb-24">
        <div class="rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-800/20 p-10 md:p-14 text-center">
          <h2 class="text-2xl md:text-3xl font-bold text-stone-100 mb-3">Stay in the loop</h2>
          <p class="text-stone-400 mb-6 max-w-md mx-auto">Get updates on new posts and projects. No spam, unsubscribe anytime.</p>
          <EmailCapture />
        </div>
      </section>
    </div>
  );
}
