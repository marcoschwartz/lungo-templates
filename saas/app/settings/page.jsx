const { h, useState, useEffect, useRouter } = window.Lungo;

export const metadata = { title: "Settings", description: "Account settings." };
export const loader = { url: "/api/me" };

export default function Settings({ data }) {
  const router = useRouter();
  const saved = new URLSearchParams(router.query).get("saved");
  const user = data && !data.error ? data : { name: "", email: "", plan: "" };

  return (
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold mb-6">Settings</h1>

      {saved && (
        <div class="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-6">
          Settings saved successfully.
        </div>
      )}

      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Profile</h2>
        <form method="POST" action="/action/settings" class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={user.name}
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled={true}
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">{user.plan || "—"}</span>
              <a href="/pricing" class="text-sm text-blue-600 hover:underline">Change plan</a>
            </div>
          </div>
          <button type="submit" class="self-start px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Save Changes
          </button>
        </form>
      </div>

      <div class="bg-white rounded-xl border border-red-200 p-6">
        <h2 class="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p class="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
        <button class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
          Delete Account
        </button>
      </div>
    </div>
  );
}
