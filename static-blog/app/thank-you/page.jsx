const { h } = window.Lungo;

export const metadata = {
  title: "Thank You — MySite"
};

export default function ThankYouPage() {
  return (
    <div class="max-w-2xl mx-auto px-4 md:px-6 py-24 text-center">
      <div class="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      </div>
      <h1 class="text-2xl font-bold text-stone-100 mb-3">Thank you!</h1>
      <p class="text-stone-400 mb-8">Your message has been received. We'll get back to you soon.</p>
      <a href="/" class="inline-flex items-center px-6 py-3 rounded-lg bg-amber-900/20 text-stone-200 font-medium text-sm hover:bg-amber-900/30 transition-all no-underline border border-amber-800/30">
        Back to Home
      </a>
    </div>
  );
}
