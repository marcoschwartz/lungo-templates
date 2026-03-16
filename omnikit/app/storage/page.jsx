const { h, useState, useEffect } = window.Lungo;

export const metadata = {
  title: "Storage — MyApp",
};

function FileCard({ file }) {
  const ext = (file.name || "").split(".").pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].indexOf(ext) >= 0;

  return (
    <div class="rounded-xl border border-stone-800 bg-stone-900/50 p-4 hover:border-stone-700 transition-colors">
      <div class="w-full h-24 rounded-lg bg-stone-800 flex items-center justify-center mb-3 overflow-hidden">
        {isImage && file.url ? (
          <img src={file.url} alt={file.name} class="w-full h-full object-cover" />
        ) : (
          <svg class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
        )}
      </div>
      <div class="text-sm text-stone-200 truncate">{file.name}</div>
      <div class="text-xs text-stone-500 mt-1">{file.mime_type || ext}</div>
    </div>
  );
}

export default function StoragePage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/storage/files")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setFiles(data);
        else if (data && data.data) setFiles(data.data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-stone-100">Storage</h1>
          <p class="text-stone-500 text-sm mt-1">Manage files and uploads</p>
        </div>
      </div>

      {loading ? (
        <div class="text-center py-12 text-stone-500">Loading files...</div>
      ) : files.length > 0 ? (
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map(f => <FileCard file={f} />)}
        </div>
      ) : (
        <div class="text-center py-16 rounded-xl border border-stone-800 border-dashed">
          <svg class="w-12 h-12 text-stone-700 mx-auto mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z"/></svg>
          <p class="text-stone-500">No files yet</p>
          <p class="text-stone-600 text-sm mt-1">Upload files via the OmniKit API</p>
        </div>
      )}
    </div>
  );
}
