const { h } = window.Lungo;

export const metadata = { title: "About", description: "About this app." };

export default function About() {
  return (
    <div>
      <h1 class="text-4xl font-extrabold mb-4">About</h1>
      <p class="text-gray-500">This app is built with Lungo — a Next.js-like framework powered by Go.</p>
    </div>
  );
}
