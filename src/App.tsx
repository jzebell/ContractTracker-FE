import React, { useState } from 'react';
import './App.css';
import LCATManagement from './components/LCAT/LCATManagement';
import ResourceManagement from './components/Resource/ResourceManagement';
import ApiDebug from './components/Debug/ApiDebug';

type TabType = 'resources' | 'lcats' | 'contracts' | 'dashboard' | 'debug';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('debug'); // Start with debug tab

  const renderContent = () => {
    switch (activeTab) {
      case 'debug':
        return <ApiDebug />;
      case 'resources':
        return <ResourceManagement />;
      case 'lcats':
        return <LCATManagement />;
      case 'contracts':
        return (
          <div className="p-8 text-center text-gray-500">
            <h2 className="text-2xl font-semibold mb-4">Contract Management</h2>
            <p>Coming Soon - Contract management with LCAT rate overrides</p>
          </div>
        );
      case 'dashboard':
        return (
          <div className="p-8 text-center text-gray-500">
            <h2 className="text-2xl font-semibold mb-4">Financial Dashboard</h2>
            <p>Coming Soon - Financial analysis and reporting</p>
          </div>
        );
      default:
        return <ResourceManagement />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <h1 className="text-2xl font-bold">Contract Financial Tracker</h1>
            <p className="text-blue-200 text-sm mt-1">Federal Contract Resource Management System</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('debug')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'debug'
                  ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              🔧 Debug
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'resources'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('lcats')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'lcats'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              LCATs
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'contracts'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Contracts
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto">
        <div className="bg-white rounded-lg shadow-sm mt-4">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-gray-500 text-sm">
        <p>Contract Tracker v0.1.0 - Built with React & .NET</p>
      </footer>
    </div>
  );
}

export default App;