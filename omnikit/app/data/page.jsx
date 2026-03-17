const { h, useState } = window.Lungo;

export const metadata = {
  title: "Data — MyApp",
};

export const loader = {
  tables: "/api/tables"
};

function RecordRow({ record, table }) {
  const [confirming, setConfirming] = useState(false);
  const keys = Object.keys(record).filter(k => k !== "project_id");
  const displayKeys = keys.slice(0, 5);

  return (
    <tr class="border-b border-stone-800 hover:bg-stone-800/30">
      {displayKeys.map(k => (
        <td class="px-4 py-3 text-sm text-stone-300 max-w-[200px] truncate">
          {typeof record[k] === "object" ? JSON.stringify(record[k]) : String(record[k] || "—")}
        </td>
      ))}
      <td class="px-4 py-3 text-right">
        {confirming ? (
          <form method="POST" action="/action/delete-record" class="inline-flex gap-2">
            <input type="hidden" name="table" value={table} />
            <input type="hidden" name="id" value={record.id} />
            <button type="submit" class="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
              Confirm
            </button>
            <button type="button" onclick={() => setConfirming(false)} class="text-xs px-2 py-1 rounded bg-stone-700 text-stone-400">
              Cancel
            </button>
          </form>
        ) : (
          <button onclick={() => setConfirming(true)} class="text-xs px-2 py-1 rounded text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

function DataTable({ records, table }) {
  const columns = records.length > 0 ? Object.keys(records[0]).filter(k => k !== "project_id").slice(0, 5) : [];

  if (records.length === 0) {
    return (
      <div class="text-center py-12 text-stone-500 rounded-xl border border-stone-800">
        No records in this table
      </div>
    );
  }

  return (
    <div class="rounded-xl border border-stone-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-stone-700 bg-stone-900/50">
              {columns.map(c => (
                <th class="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{c}</th>
              ))}
              <th class="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => <RecordRow record={r} table={table} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DataPage({ data }) {
  const tables = data && data.tables ? (Array.isArray(data.tables) ? data.tables : (data.tables.data || [])) : [];
  const [selectedTable, setSelectedTable] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  function selectTable(t) {
    setSelectedTable(t);
    setLoading(true);
    fetch("/api/data?table=" + t + "&limit=50")
      .then(r => r.json())
      .then(result => {
        if (Array.isArray(result)) setRecords(result);
        else if (result && result.data) setRecords(result.data);
        else setRecords([]);
        setLoading(false);
      });
    history.pushState(null, "", "/data?table=" + t);
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-stone-100">Data</h1>
          <p class="text-stone-500 text-sm mt-1">Browse and manage your database tables</p>
        </div>
      </div>

      <div class="flex gap-2 mb-6 flex-wrap">
        {tables.map(t => {
          const name = t.name || t.table_name;
          return (
            <button
              onclick={() => selectTable(name)}
              class={selectedTable === name
                ? "px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "px-3 py-1.5 rounded-lg text-sm text-stone-400 border border-stone-700 hover:border-stone-600 transition-colors"}
            >
              {name}
            </button>
          );
        })}
      </div>

      {selectedTable ? (
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-stone-200">{selectedTable}</h2>
            <span class="text-stone-500 text-sm">{records.length} records</span>
          </div>
          {loading ? (
            <div class="text-center py-12 text-stone-500">Loading...</div>
          ) : (
            <DataTable records={records} table={selectedTable} />
          )}
        </div>
      ) : (
        <div class="text-center py-16 text-stone-500 rounded-xl border border-stone-800 border-dashed">
          Select a table to browse its data
        </div>
      )}
    </div>
  );
}
