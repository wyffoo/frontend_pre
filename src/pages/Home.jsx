
import React from 'react';
import NavigationMenu from '../components/NavigationMenu';
import FileUploader from '../components/FileUploader';
import AISummaryPanel from '../components/AISummaryPanel';
import DatabaseBrowser from '../components/DatabaseBrowser';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavigationMenu />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8">
        <FileUploader />
        <AISummaryPanel />
        <DatabaseBrowser />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
