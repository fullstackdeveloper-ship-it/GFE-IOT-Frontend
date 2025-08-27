import React from 'react';
import { X } from 'lucide-react';

const EditPortModal = ({ isOpen, portName, values, options, onClose, onSave, onChange }) => {
  if (!isOpen) return null;
  
  const { baud = '', dataBits = '', stopBits = '', parity = '', mode = '' } = values || {};
  const dd = options || { baud: [], dataBits: [], stopBits: [], parity: [], mode: [] };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-200/40 p-6 w-full max-w-md relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/5 via-[#198c1a]/8 to-[#0097b2]/5"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                Edit {portName} Settings
              </h3>
              <div className="h-1 w-24 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-full mt-2"></div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Baud Rate</label>
              <select
                value={baud}
                onChange={(e) => onChange('baud', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              >
                <option value="">Select baud rate</option>
                {dd.baud.map(rate => (
                  <option key={rate} value={rate}>{rate}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Bits</label>
              <select
                value={dataBits}
                onChange={(e) => onChange('dataBits', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              >
                <option value="">Select data bits</option>
                {dd.dataBits.map(bits => (
                  <option key={bits} value={bits}>{bits}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stop Bits</label>
              <select
                value={stopBits}
                onChange={(e) => onChange('stopBits', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              >
                <option value="">Select stop bits</option>
                {dd.stopBits.map(bits => (
                  <option key={bits} value={bits}>{bits}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parity</label>
              <select
                value={parity}
                onChange={(e) => onChange('parity', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              >
                <option value="">Select parity</option>
                {dd.parity.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                value={mode}
                onChange={(e) => onChange('mode', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              >
                <option value="">Select mode</option>
                {dd.mode.map(m => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-[#0097b2] to-[#198c1a] hover:from-[#0088a3] hover:to-[#167d19] rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPortModal;
