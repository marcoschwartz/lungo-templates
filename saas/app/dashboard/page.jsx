const { h, useEffect, useRef } = window.Lungo;

export const metadata = { title: "Dashboard", description: "Your dashboard." };

// Multi-source loader: fetches stats + user in parallel, caches stats for 30s
export const loader = {
  stats: { url: "/api/stats", revalidate: 30 },
  user: "/api/me",
};

function StatCard({ label, value, change, up }) {
  return (
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="text-sm text-gray-500 mb-1">{label}</div>
      <div class="text-2xl font-bold text-gray-900">{value}</div>
      <div class={"text-xs mt-1 " + (up ? "text-green-600" : "text-red-500")}>
        {up ? "↑" : "↓"} {change}
      </div>
    </div>
  );
}

function RevenueChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const loadChart = () => {
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new window.Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: data.map(d => d.month),
          datasets: [{
            label: "Revenue",
            data: data.map(d => d.value),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.08)",
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: "#3b82f6",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: { callback: function(v) { return "$" + v.toLocaleString(); }, font: { size: 11 }, color: "#9ca3af" },
            },
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9ca3af" } },
          },
        },
      });
    };

    if (window.Chart) {
      loadChart();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
      script.onload = loadChart;
      document.head.appendChild(script);
    }

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return (
    <div style={{ height: "280px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ActivityItem({ action, user, time }) {
  return (
    <div class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <div class="text-sm text-gray-900">{action}</div>
        <div class="text-xs text-gray-400">{user}</div>
      </div>
      <span class="text-xs text-gray-400 shrink-0 ml-4">{time}</span>
    </div>
  );
}

export default function Dashboard({ data }) {
  const stats = data.stats || data;
  const user = data.user;

  if (!stats || !stats.chart) {
    return (<div class="text-center py-20 text-gray-400">No data</div>);
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        {user && user.name && (
          <span class="text-sm text-gray-500">Welcome back, {user.name}</span>
        )}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue" value={"$" + stats.revenue.toLocaleString()} change="12% this month" up={true} />
        <StatCard label="Users" value={stats.users.toLocaleString()} change="8% this month" up={true} />
        <StatCard label="Orders" value={String(stats.orders)} change="3% this month" up={true} />
        <StatCard label="Conversion" value={stats.conversion + "%"} change="0.5% this month" up={false} />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-sm font-semibold text-gray-700 mb-4">Revenue Over Time</h2>
          <RevenueChart data={stats.chart} />
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <div class="flex flex-col">
            {stats.recentActivity.map(a => (
              <ActivityItem action={a.action} user={a.user} time={a.time} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
