import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const AISummaryPanel = ({ files, result, setResult, loading, setLoading, onConfirm }) => {
  const [error, setError] = useState("");

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
      setResult({ ...data, pr_id: "", title: "", softwareRelease: "", softwareBuild: "", attachmentIds: "", groupIncharge: "", identification: "", explanation: "", category: "" });
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
    onConfirm();  // Refresh DB
  } catch (err) {
    setError(err.message);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setResult(prev => ({ ...prev, [name]: value }));
  };

  const fields = [
    { key: "description", label: "Description" }, { key: "pr_id", label: "PR ID" },
    { key: "title", label: "Title" }, { key: "softwareRelease", label: "Software Release" },
    { key: "softwareBuild", label: "Software Build" }, { key: "attachmentIds", label: "Attachment IDs" },
    { key: "groupIncharge", label: "Group In Charge" }, { key: "identification", label: "Identification" },
    { key: "resolution", label: "Resolution" }, { key: "subSystem", label: "Sub System" },
    { key: "rootCause", label: "Root Cause" }, { key: "explanation", label: "Explanation" }
  ];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">AI Analysis Results</h2>
        <button onClick={handleRegenerate} disabled={loading || !files} className={`text-sm border px-3 py-1 rounded ${loading ? "bg-blue-300 cursor-wait" : "bg-white hover:bg-blue-50"}`}>
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : null} Regenerate with AI
        </button>
      </div>

      <div className="grid gap-4">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className="font-medium">{label}</label>
            <textarea name={key} value={result[key] || ""} onChange={handleChange} className="w-full border rounded p-2 mt-1 text-sm" rows={key === "description" || key === "resolution" ? 6 : 2} />
          </div>
        ))}

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
