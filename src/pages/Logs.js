import React from 'react';
import { useAppSelector } from '../hooks/redux';
import {
  FileText,
  Info,
} from 'lucide-react';

const Logs = () => {
  const { logs } = useAppSelector((state) => state.logs);

  return (
    <div className="min-h-screen bg-white p-6 space-y-6 relative overflow-hidden">
      {/* Perfect gradient background that merges beautifully in the middle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/8 via-[#198c1a]/12 to-[#0097b2]/8"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0097b2]/6 via-[#198c1a]/10 to-[#0097b2]/6"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-[#0097b2]/5 via-[#198c1a]/8 to-[#0097b2]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-tl from-[#198c1a]/6 via-[#0097b2]/4 to-[#198c1a]/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6">
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
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15">
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
    </div>
  );
};

export default Logs; 