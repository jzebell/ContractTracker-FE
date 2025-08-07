import React, { useState } from 'react';
import api from '../../services/api';
import { lcatService } from '../../services/lcatService';
import { resourceService } from '../../services/resourceService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5154';

interface DebugResults {
  directApi?: string;
  lcatService?: string;
  resourceService?: string;
  backend?: string;
  [key: string]: string | undefined;
}

const ApiDebug: React.FC = () => {
  const [results, setResults] = useState<DebugResults>({});
  const [loading, setLoading] = useState(false);

  const testDirectApi = async () => {
    setLoading(true);
    try {
      // Test direct API call to check connectivity - using correct path
      const response = await api.get('/api/LCAT');
      setResults((prev: DebugResults) => ({ ...prev, directApi: 'Success! Data received: ' + JSON.stringify(response.data) }));
    } catch (error: any) {
      setResults((prev: DebugResults) => ({ ...prev, directApi: 'Error: ' + error.message }));
    }
    setLoading(false);
  };

  const testLCATService = async () => {
    setLoading(true);
    try {
      const data = await lcatService.getAll();
      setResults((prev: DebugResults) => ({ ...prev, lcatService: `Success! Found ${data.length} LCATs` }));
    } catch (error: any) {
      setResults((prev: DebugResults) => ({ ...prev, lcatService: 'Error: ' + error.message }));
    }
    setLoading(false);
  };

  const testResourceService = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getAll();
      setResults((prev: DebugResults) => ({ ...prev, resourceService: `Success! Found ${data.length} resources` }));
    } catch (error: any) {
      setResults((prev: DebugResults) => ({ ...prev, resourceService: 'Error: ' + error.message }));
    }
    setLoading(false);
  };

  const testSwagger = () => {
    window.open('http://localhost:5154/swagger', '_blank');
  };

  const checkBackendHealth = async () => {
    setLoading(true);
    try {
      // Instead of trying to fetch swagger.json, just test a known endpoint
      await api.get('/api/LCAT'); // We don't need the response, just checking if it works
      setResults((prev: DebugResults) => ({ 
        ...prev, 
        backend: `Backend is running! Connected to API at ${API_BASE_URL}` 
      }));
    } catch (error: any) {
      setResults((prev: DebugResults) => ({ ...prev, backend: 'Cannot reach backend. Is it running on port 5154?' }));
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-yellow-800">🔧 API Debug Panel</h2>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm"><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5154'}</p>
        <p className="text-sm"><strong>Expected endpoints:</strong> /lcat, /resource</p>
      </div>

      <div className="space-x-2 mb-4">
        <button 
          onClick={checkBackendHealth}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Check Backend
        </button>
        <button 
          onClick={testDirectApi}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Direct API
        </button>
        <button 
          onClick={testLCATService}
          disabled={loading}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test LCAT Service
        </button>
        <button 
          onClick={testResourceService}
          disabled={loading}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Resource Service
        </button>
        <button 
          onClick={testSwagger}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Open Swagger
        </button>
      </div>

      {loading && <p className="text-blue-600">Testing...</p>}

      <div className="mt-4 space-y-2">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="p-2 bg-white rounded border">
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">📝 Troubleshooting Steps:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Ensure backend is running: <code>dotnet run --project ContractTracker.Api</code></li>
          <li>Check if PostgreSQL is running: <code>docker ps</code></li>
          <li>Verify the backend is on port 5154 (check console output when starting)</li>
          <li>Check browser console (F12) for CORS errors</li>
          <li>Ensure .env file exists in frontend root with: <code>REACT_APP_API_URL=http://localhost:5154</code></li>
          <li>After creating/updating .env, restart the React app</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiDebug;