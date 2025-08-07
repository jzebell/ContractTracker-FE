import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Bug, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApiLog {
  timestamp: Date;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
  type: 'request' | 'response' | 'error';
}

interface DebugFooterProps {
  apiLogs?: ApiLog[];
  maxLogs?: number;
}

const DebugFooter: React.FC<DebugFooterProps> = ({ 
  apiLogs = [], 
  maxLogs = 20 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'info'>('logs');

  // Get recent logs
  const recentLogs = apiLogs.slice(-maxLogs).reverse();
  
  // Calculate stats
  const stats = {
    total: apiLogs.length,
    errors: apiLogs.filter(log => log.type === 'error').length,
    avgDuration: apiLogs
      .filter(log => log.duration)
      .reduce((acc, log) => acc + (log.duration || 0), 0) / 
      apiLogs.filter(log => log.duration).length || 0
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* Collapsed Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bug className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-mono text-gray-600">Debug Console</span>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-gray-600">{stats.total - stats.errors}</span>
            </div>
            {stats.errors > 0 && (
              <div className="flex items-center space-x-1">
                <XCircle className="w-3 h-3 text-red-500" />
                <span className="text-red-600">{stats.errors}</span>
              </div>
            )}
            <div className="text-gray-500">
              Avg: {stats.avgDuration.toFixed(0)}ms
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Show DEV MODE badge */}
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
            DEV MODE
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('logs')}
            >
              API Logs ({recentLogs.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('info')}
            >
              System Info
            </button>
          </div>

          {/* Content */}
          <div className="h-64 overflow-auto bg-gray-50">
            {activeTab === 'logs' ? (
              <div className="p-2">
                {recentLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No API calls yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 p-2 rounded text-xs font-mono hover:bg-white transition-colors ${
                          log.type === 'error' ? 'bg-red-50' : 'bg-gray-50'
                        }`}
                      >
                        <span className="text-gray-400 w-20">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getMethodColor(log.method)}`}>
                          {log.method}
                        </span>
                        <span className="flex-1 text-gray-700 truncate">
                          {log.url}
                        </span>
                        {log.status && (
                          <span className={`font-semibold ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        )}
                        {log.duration && (
                          <span className="text-gray-500">
                            {log.duration}ms
                          </span>
                        )}
                        {log.error && (
                          <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Environment</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">API URL:</span>
                        <span className="font-mono">{window.location.hostname === 'localhost' ? 'http://localhost:5154' : 'Not configured'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Environment:</span>
                        <span className="font-mono">Development</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">React Version:</span>
                        <span className="font-mono">{React.version}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Session Stats</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Requests:</span>
                        <span className="font-mono">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Failed Requests:</span>
                        <span className="font-mono text-red-600">{stats.errors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Avg Response:</span>
                        <span className="font-mono">{stats.avgDuration.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm">Quick Actions</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        console.clear();
                        window.location.reload();
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Clear & Reload
                    </button>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    >
                      Clear Storage
                    </button>
                    <button
                      onClick={() => {
                        console.log('API Logs:', apiLogs);
                      }}
                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Export Logs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugFooter;