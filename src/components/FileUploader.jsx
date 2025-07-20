import React from 'react';

const FileUploader = ({ files, setFiles }) => {
const handleFileChange = (e) => {
  const newFiles = Array.from(e.target.files);
  setFiles(prev => [...prev, ...newFiles.filter(f => !prev.some(p => p.name === f.name))]);
};

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">
        Upload Precheck Files <span className="text-gray-500 text-sm">(EML, JPG, PNG)</span>
      </h2>
      <input
        type="file"
        accept=".eml,.jpg,.jpeg,.png"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />
      {files.length > 0 && (
        <div className="bg-white shadow rounded p-4 text-sm text-gray-700">
          {files.map(f => <div key={f.name}>{f.name}</div>)}
          <button onClick={clearFiles} className="text-red-500 hover:text-red-700 text-xs mt-2">
            Remove All
          </button>
        </div>
      )}
    </section>
  );
};

export default FileUploader;
