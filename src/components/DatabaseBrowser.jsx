import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

const fields = [
  "description","pr_id","title","softwareRelease","softwareBuild",
  "attachmentIds","groupIncharge","identification","resolution",
  "subSystem","root_cause","explanation","category"
];

const DatabaseManager = ({ refreshSignal }) => {
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const [edited, setEdited] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [prontoLoading, setProntoLoading] = useState(false);

  const fetchRecords = async () => {
    try {
      const query = new URLSearchParams({ search, page }).toString();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/records?${query}`);
      const data = await res.json();
      setRecords(data.records || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("❌ Failed to fetch records", err);
      setRecords([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [refreshSignal, search, page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEdited(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/records/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edited)
      });
      const updated = await res.json();
      setRecords(updated.records || []);
      setEditId(null);
    } catch (err) {
      console.error("❌ Failed to update record", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      const updated = await res.json();
      setRecords(updated.records || []);
    } catch (err) {
      console.error("❌ Failed to delete record", err);
    }
  };

  // ✅ call /pronto/sync，sync latest 100 records
  const handleProntoUpdate = async () => {
    try {
      setProntoLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pronto/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100, autoCategorizeNonCNN: false })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "PRONTO sync failed");
      }
      await fetchRecords();
    } catch (e) {
      console.error("PRONTO update failed:", e);
      alert(`PRONTO sync failed：${e.message}`);
    } finally {
      setProntoLoading(false);
    }
  };

  return (
    <section className="p-4 max-w-full overflow-x-auto">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-blue-800">📘 Database Records</h2>
          <button
            onClick={handleProntoUpdate}
            disabled={prontoLoading}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow transition
              ${prontoLoading
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            title="Pull latest items from PRONTO and update the database"
          >
            {prontoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Update data from PRONTO
          </button>
        </div>

        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 Search description/title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <table className="table-auto w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            {fields.map(f => (
              <th key={f} className="border p-2 capitalize">{f}</th>
            ))}
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(records || []).map(record => (
            <tr key={record.id} className="border-t">
              {fields.map(f => (
                <td key={f} className="border p-1 align-top">
                  {editId === record.id ? (
                    f === "category" ? (
                      <select
                        name={f}
                        value={edited[f] || ''}
                        onChange={handleChange}
                        className="text-xs p-1 w-full border rounded"
                      >
                        <option value="">Select</option>
                        <option value="Precheck without PR">Precheck without PR</option>
                        <option value="Precheck with valid PR">Precheck with valid PR</option>
                        <option value="Precheck with CNN PR">Precheck with CNN PR</option>
                      </select>
                    ) : (
                      <textarea
                        name={f}
                        value={edited[f] || ''}
                        onChange={handleChange}
                        rows={["description","resolution"].includes(f) ? 6 : 2}
                        className="w-full border p-1 text-xs rounded"
                      />
                    )
                  ) : (
                    <pre className="whitespace-pre-wrap text-xs">{record[f]}</pre>
                  )}
                </td>
              ))}
              <td className="border p-1 space-x-1">
                {editId === record.id ? (
                  <>
                    <button onClick={handleSave} className="text-green-600 hover:underline">💾 Save</button>
                    <button onClick={() => setEditId(null)} className="text-gray-500 hover:underline">✖ Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditId(record.id); setEdited({ ...record }); }} className="text-blue-600 hover:underline">✏️ Edit</button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:underline">🗑️ Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          ◀ Prev
        </button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          className="text-sm px-3 py-1 border rounded disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>
    </section>
  );
};

export default DatabaseManager;
