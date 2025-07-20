
import React from 'react';

const NavigationMenu = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">PR Assistant</h1>
        <nav className="space-x-4">
          <button className="text-gray-600 hover:text-blue-600">Files</button>
          <button className="text-gray-600 hover:text-blue-600">Results</button>
          <button className="text-gray-600 hover:text-blue-600">Help</button>
        </nav>
      </div>
    </header>
  );
};

export default NavigationMenu;
