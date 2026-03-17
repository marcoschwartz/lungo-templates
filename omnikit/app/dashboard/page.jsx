const { h, useState, useEffect } = window.Lungo;

export const metadata = {
  title: "Dashboard — MyApp",
};

export const loader = { url: "/api/loader/dashboard" };

function StatCard({ label, value, icon }) {
  return (
    <div class="rounded-xl border border-stone-800 bg-stone-900/50 p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-stone-500 text-sm">{label}</span>
        <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
          {icon}
        </div>
      </div>
      <div class="text-2xl font-bold text-stone-100">{value}</div>
    </div>
  );
}

export default function DashboardPage({ data }) {
  const user = data ? data.user : null;
  const rawTables = data ? data.tables : [];
  const tables = Array.isArray(rawTables) ? rawTables : (rawTables && rawTables.data ? rawTables.data : []);
  const tableCount = tables.length;
  const projects = data && data.projects ? data.projects : [];
  const currentPid = data ? data.project_id : "";

  return (
    <div>
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-stone-100">Dashboard</h1>
        {user ? <p class="text-stone-500 text-sm mt-1">Welcome back, {user.display_name || user.email}</p> : null}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Project ID"
          value={data ? data.project_id : "—"}
          icon={<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75"/></svg>}
        />
        <StatCard
          label="Tables"
          value={tableCount}
          icon={<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375"/></svg>}
        />
        <StatCard
          label="API Status"
          value="Online"
          icon={<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <StatCard
          label="Framework"
          value="Lungo"
          icon={<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>}
        />
      </div>

      {tableCount > 0 ? (
        <div>
          <h2 class="text-lg font-semibold text-stone-200 mb-4">Tables</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tables.map(t => (
              <a href={"/data?table=" + (t.name || t.table_name)} class="block rounded-xl border border-stone-800 bg-stone-900/50 p-4 hover:border-amber-800/40 transition-colors no-underline">
                <div class="font-medium text-stone-200 text-sm">{t.name || t.table_name}</div>
                {t.description ? <div class="text-stone-500 text-xs mt-1">{t.description}</div> : null}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
