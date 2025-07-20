import React, { useEffect, useState } from 'react';

const fields = [
  "description", "pr_id", "title", "softwareRelease", "softwareBuild",
  "attachmentIds", "groupIncharge", "identification", "resolution",
  "subSystem", "rootCause", "explanation", "category"
];

const DatabaseManager = ({ refreshSignal }) => {
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const [edited, setEdited] = useState({});

  const fetchRecords = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/records`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("❌ Failed to fetch records", err);
    }
  };

  useEffect(() => { fetchRecords(); }, [refreshSignal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEdited(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editId) {
      console.warn("❗ No record is selected for editing.");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/records/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edited)
      });
      const updated = await res.json();
      setRecords(updated);
      setEditId(null);
    } catch (err) {
      console.error("❌ Failed to update record", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/records/${id}`, { method: 'DELETE' });
      const updated = await res.json();
      setRecords(updated);
    } catch (err) {
      console.error("❌ Failed to delete record", err);
    }
  };

  return (
    <section className="p-4 max-w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">📘 Database Records</h2>

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
          {records.map(record => (
            <tr key={record.id} className="border-t">
              {fields.map(f => (
                <td key={f} className="border p-1">
                  {editId === record.id ? (
                    f === "category" ? (
                      <select
                        name={f}
                        value={edited[f] || ''}
                        onChange={handleChange}
                        className="text-xs p-1 w-full"
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
                        rows={["description", "resolution"].includes(f) ? "6" : "2"}
                        className="w-full border p-1 text-xs"
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
                    <button onClick={handleSave} className="text-green-600">💾</button>
                    <button onClick={() => setEditId(null)} className="text-gray-500">✖</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditId(record.id); setEdited({ ...record }); }} className="text-blue-600">✏️</button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-600">🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default DatabaseManager;
