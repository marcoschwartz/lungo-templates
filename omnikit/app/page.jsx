const { h, useEffect } = window.Lungo;

export const metadata = {
  title: "MyApp",
};

export default function Page() {
  useEffect(() => {
    window.location.href = "/dashboard";
  }, []);

  return (
    <div class="min-h-screen flex items-center justify-center">
      <p class="text-stone-500">Redirecting...</p>
    </div>
  );
}
