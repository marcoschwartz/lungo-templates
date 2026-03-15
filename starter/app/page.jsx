const { h, useState, useEffect } = window.Lungo;

export const metadata = { title: "My App", description: "Built with Lungo." };

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then(r => r.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div>
      <h1 class="text-4xl font-extrabold mb-4">Welcome</h1>
      <p class="text-gray-500 mb-8">Edit <code class="px-2 py-1 bg-gray-100 rounded text-sm">app/page.jsx</code> to get started.</p>
      {message && (
        <div class="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
