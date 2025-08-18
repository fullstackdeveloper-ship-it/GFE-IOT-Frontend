import React from 'react';
import { useAppSelector } from '../hooks/redux';
import {
  Bell,
  Info,
} from 'lucide-react';

const Alerts = () => {
  const { alerts } = useAppSelector((state) => state.alerts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
            <p className="text-sm text-gray-500">
              Real-time alerts and notifications from socket events
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Alert Entries ({alerts.length})
          </h3>
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="mx-auto text-gray-400" size={48} />
            <p className="mt-2 text-sm text-gray-500">No alerts available</p>
            <p className="text-xs text-gray-400 mt-1">
              Alerts will appear here when socket events trigger notifications
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-96">
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 ${
                    alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                    alert.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        <Bell className="text-blue-500" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className={`text-sm font-medium ${
                            !alert.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {alert.title}
                          </p>
                          {!alert.read && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          !alert.read ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
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
              Alert Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page displays real-time alerts from socket connection events. 
                Alerts are automatically generated when important events occur 
                during data transmission or connection status changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts; 