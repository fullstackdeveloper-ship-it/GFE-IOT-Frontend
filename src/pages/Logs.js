import React from 'react';
import { useAppSelector } from '../hooks/redux';
import {
  FileText,
  Info,
} from 'lucide-react';

const Logs = () => {
  const { logs } = useAppSelector((state) => state.logs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Logs</h2>
            <p className="text-sm text-gray-500">
              Real-time system events and connection logs
            </p>
          </div>
        </div>
      </div>

      {/* Logs Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Log Entries ({logs.length})
          </h3>
        </div>
        
        {logs.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="mx-auto text-gray-400" size={48} />
            <p className="mt-2 text-sm text-gray-500">No logs available</p>
            <p className="text-xs text-gray-400 mt-1">
              Logs will appear here when socket events occur
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-96">
            <div className="divide-y divide-gray-200">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-4 border-l-4 ${
                    log.level === 'error' ? 'border-l-red-500 bg-red-50' :
                    log.level === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        <Info className="text-blue-500" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            log.level === 'error' ? 'bg-red-100 text-red-800' :
                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Info className="text-blue-400" size={24} />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Log Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page displays real-time logs from socket connection events. 
                Logs are automatically generated when connecting, disconnecting, 
                or receiving data from the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs; 