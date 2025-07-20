import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import AISummaryPanel from './components/AISummaryPanel';
import NavigationMenu from './components/NavigationMenu';
import Footer from './components/Footer';
import DatabaseBrowser from './components/DatabaseBrowser';

const App = () => {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0); // Trigger for refreshing records

  // Function to trigger a refresh of DatabaseManager
  const handleConfirm = () => {
    setRefreshSignal(prev => prev + 1); // Increment to trigger useEffect in DatabaseManager
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavigationMenu />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-10">
        <FileUploader files={files} setFiles={setFiles} />
        <AISummaryPanel
          files={files}
          result={result}
          setResult={setResult}
          loading={loading}
          setLoading={setLoading}
          onConfirm={handleConfirm} // Pass onConfirm function
        />
        <DatabaseBrowser refreshSignal={refreshSignal} />
      </main>
      <Footer />
    </div>
  );
};

export default App;