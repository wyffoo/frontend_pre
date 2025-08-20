import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const AISummaryPanel = ({ files, result, setResult, loading, setLoading, onConfirm }) => {
  const [error, setError] = useState("");
  const [expandedFields, setExpandedFields] = useState({});

  const handleRegenerate = async () => {
    if (!files || files.length === 0) {
      setError("⚠️ No files selected.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/extract`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setResult({ ...data, pr_id: "", title: "", softwareRelease: "", softwareBuild: "", attachmentIds: "", groupIncharge: "", identification: "", explanation: "", root_cause: "", category: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result, filename: files[0]?.name || "manual_entry.eml" })
      });
      if (!res.ok) throw new Error("❌ Failed to save");
      setResult({});
      onConfirm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResult(prev => ({ ...prev, [name]: value }));
  };

  const toggleExpand = (key) => {
    setExpandedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fields = [
    { key: "description", label: "Description" }, { key: "pr_id", label: "PR ID" },
    { key: "title", label: "Title" }, { key: "softwareRelease", label: "Software Release" },
    { key: "softwareBuild", label: "Software Build" }, { key: "attachmentIds", label: "Attachment IDs" },
    { key: "groupIncharge", label: "Group In Charge" }, { key: "identification", label: "Identification" },
    { key: "resolution", label: "Resolution" }, { key: "subSystem", label: "Sub System" },
    { key: "root_cause", label: "Root Cause" }, { key: "explanation", label: "Explanation" }
  ];

  return (
    <section>
<button
  onClick={handleRegenerate}
  disabled={loading || !files}
  className={`text-sm px-4 py-2 rounded shadow transition ${
    loading || !files
      ? "bg-blue-300 text-white cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  }`}
>
  {loading ? <Loader2 className="animate-spin w-4 h-4 inline mr-1" /> : "🤖"}
  Regenerate with AI
</button>


      <h2 className="text-lg font-semibold mb-4">AI Analysis Results</h2>

      <div className="grid gap-4">
        {fields.map(({ key, label }) => {
          const isLongField = key === "description" || key === "resolution";
          const expanded = expandedFields[key];
          return (
            <div key={key} className="relative">
              <label className="font-medium">{label}</label>
              <textarea
                name={key}
                value={result[key] || ""}
                onChange={handleChange}
                className="w-full border rounded p-2 mt-1 text-sm resize-y overflow-auto"
                rows={expanded ? 20 : isLongField ? 10 : 2}
                style={{ transition: "height 0.2s ease" }}
              />
              {isLongField && (
                <button
                  type="button"
                  className="absolute right-2 top-1 text-xs text-blue-600 hover:underline"
                  onClick={() => toggleExpand(key)}
                >
                  {expanded ? "Collapse ▲" : "Expand ▼"}
                </button>
              )}
            </div>
          );
        })}

        <div>
          <label className="font-medium">Category</label>
          <select name="category" value={result.category || ""} onChange={handleChange} className="w-full border rounded p-2 mt-1 text-sm">
            <option value="">Select Category</option>
            <option value="Precheck without PR">Precheck without PR</option>
            <option value="Precheck with valid PR">Precheck with valid PR</option>
            <option value="Precheck with CNN PR">Precheck with CNN PR</option>
          </select>
        </div>
      </div>

      <button onClick={handleConfirm} disabled={loading} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">✅ Confirm & Save to Database</button>

      {error && <div className="mt-4 text-sm text-red-700 bg-red-100 p-3 border">{error}</div>}
    </section>
  );
};

export default AISummaryPanel;