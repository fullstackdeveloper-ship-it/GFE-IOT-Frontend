import React from 'react';
import { Edit } from 'lucide-react';

const PortsTable = ({ ports, onEdit, isLoading }) => {
  const portNames = ['Serial 1', 'Serial 2'];
  const rows = portNames.filter((name) => ports && ports[name]).map((name) => ({ name, ...ports[name] }));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/40 overflow-hidden shadow-lg">
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Loading serial ports...</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-500 font-medium">No serial ports found.</div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Port Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Baud Rate</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Data Bits</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stop Bits</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Parity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/60 divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.name} className="hover:bg-gray-50/80 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{row.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{typeof row.baud === 'number' ? row.baud : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{typeof row.dataBits === 'number' ? row.dataBits : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{typeof row.stopBits === 'number' ? row.stopBits : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{row.parity ? row.parity.charAt(0).toUpperCase() + row.parity.slice(1) : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{row.mode ? row.mode.charAt(0).toUpperCase() + row.mode.slice(1) : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onEdit(row.name)} 
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#0097b2] to-[#198c1a] hover:from-[#0088a3] hover:to-[#167d19] text-white rounded-xl hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    <Edit size={14} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortsTable;
