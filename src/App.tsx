import React, { useState, useEffect } from 'react';
import './App.css';
import LCATManagement from './components/LCAT/LCATManagement';
import ResourceManagement from './components/Resource/ResourceManagement';
import ContractManagement from './components/Contract/ContractManagement';
import DebugFooter from './components/Debug/DebugFooter';
import { setupApiInterceptors } from './services/apiInterceptor';
import FinancialDashboard from './components/Dashboard/FinancialDashboard';

interface ApiLog {
  timestamp: Date;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
  type: 'request' | 'response' | 'error';
}

function App() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'resources' | 'lcats' | 'dashboard' | 'financial-dashboard'>('contracts');
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  useEffect(() => {
    // Set up API interceptors for logging
    const cleanup = setupApiInterceptors({
      onRequest: (config) => {
        const log: ApiLog = {
          timestamp: new Date(),
          method: config.method?.toUpperCase() || 'GET',
          url: config.url || '',
          type: 'request'
        };
        setApiLogs(prev => [...prev, log]);
        // Store request start time
        (config as any).metadata = { startTime: Date.now() };
      },
      onResponse: (response) => {
        const config = response.config as any;
        const duration = config.metadata?.startTime 
          ? Date.now() - config.metadata.startTime 
          : undefined;
        
        const log: ApiLog = {
          timestamp: new Date(),
          method: config.method?.toUpperCase() || 'GET',
          url: config.url || '',
          status: response.status,
          duration,
          type: 'response'
        };
        setApiLogs(prev => [...prev, log]);
      },
      onError: (error) => {
        const config = error.config as any;
        const duration = config?.metadata?.startTime 
          ? Date.now() - config.metadata.startTime 
          : undefined;
        
        const log: ApiLog = {
          timestamp: new Date(),
          method: config?.method?.toUpperCase() || 'GET',
          url: config?.url || '',
          status: error.response?.status,
          duration,
          error: error.message,
          type: 'error'
        };
        setApiLogs(prev => [...prev, log]);
      }
    });

    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Contract Tracker
              </h1>
              <p className="text-xs text-gray-500">Federal Contract Resource Management System</p>
            </div>
            <div className="text-sm text-gray-500">
              Session 3 - Contract Management Ready
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'contracts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contracts
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-600">
                NEW
              </span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'resources'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('lcats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'lcats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              LCATs
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                Coming Soon
              </span>
            </button>
            <button
              onClick={() => setActiveTab('financial-dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'financial-dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Financial Analytics
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-600">
                NEW
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content - Add padding bottom for footer */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {activeTab === 'contracts' && <ContractManagement />}
        {activeTab === 'resources' && <ResourceManagement />}
        {activeTab === 'lcats' && <LCATManagement />}
        {activeTab === 'financial-dashboard' && <FinancialDashboard />}
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Financial Dashboard</h2>
            <p className="text-gray-600 mb-4">
              The dashboard will provide comprehensive financial analytics including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📊 Burn Rate Analysis</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Monthly, Quarterly, Annual burn rates</li>
                  <li>• Funding depletion projections</li>
                  <li>• Contract health indicators</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">💰 Profitability Metrics</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Resource margin analysis</li>
                  <li>• Contract profitability</li>
                  <li>• Underwater resource alerts</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📈 Resource Utilization</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full-time vs Part-time distribution</li>
                  <li>• Contract allocation percentages</li>
                  <li>• Bench resource tracking</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">⚠️ Risk Management</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Funding shortage warnings</li>
                  <li>• Contract expiration alerts</li>
                  <li>• Rate change impact analysis</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              This feature will be implemented in the next phase of development.
            </p>
          </div>
        )}
      </main>

      {/* Debug Footer - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <DebugFooter apiLogs={apiLogs} />
      )}
    </div>
  );
}

export default App;