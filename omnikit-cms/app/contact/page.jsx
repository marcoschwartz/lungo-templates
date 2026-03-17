const { h, useState } = window.Lungo;

export const metadata = {
  title: "Contact — MySite",
  description: "Get in touch with us"
};

export default function ContactPage() {
  return (
    <div class="max-w-2xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div class="mb-10">
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Contact</span>
        </h1>
        <p class="text-lg text-stone-400">Have a question or want to work together?</p>
      </div>

      <form method="POST" action="/action/contact" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-stone-300 mb-1.5">Name</label>
          <input
            type="text"
            name="name"
            class="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-sm focus:outline-none focus:border-amber-500/50 placeholder-stone-600"
            placeholder="Your name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-300 mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            required
            class="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-sm focus:outline-none focus:border-amber-500/50 placeholder-stone-600"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-300 mb-1.5">Message</label>
          <textarea
            name="message"
            rows="5"
            required
            class="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-sm focus:outline-none focus:border-amber-500/50 placeholder-stone-600 resize-none"
            placeholder="What's on your mind?"
          ></textarea>
        </div>
        <button type="submit" class="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-700 transition-all">
          Send Message
        </button>
      </form>
    </div>
  );
}
