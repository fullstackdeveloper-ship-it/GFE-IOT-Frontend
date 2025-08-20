import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { Wifi, WifiOff, X, Edit, Plus, Trash2, Network as NetworkIcon, Router, Server, Cable, Globe, Globe2, Search, Filter, RefreshCw } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import ApiService from '../services/apiService';
import 'react-toastify/dist/ReactToastify.css';

// Simple helper components for the Serial Ports table and modal
const PortsTable = ({ ports, onEdit, isLoading }) => {
  const portNames = ['COM1', 'COM2'];
  const rows = portNames.filter((name) => ports && ports[name]).map((name) => ({ name, ...ports[name] }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {isLoading ? (
        <div className="p-6 text-center text-gray-500">Loading serial ports…</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No serial ports found.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baud Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Bits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Bits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{row.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{typeof row.baud === 'number' ? row.baud : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{typeof row.dataBits === 'number' ? row.dataBits : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{typeof row.stopBits === 'number' ? row.stopBits : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{row.parity ? row.parity.charAt(0).toUpperCase() + row.parity.slice(1) : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{row.mode ? row.mode.charAt(0).toUpperCase() + row.mode.slice(1) : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => onEdit(row.name)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
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

const EditPortModal = ({ isOpen, portName, values, options, onClose, onSave, onChange }) => {
  if (!isOpen) return null;
  const { baud = '', dataBits = '', stopBits = '', parity = '', mode = '' } = values || {};
  const dd = options || { baud: [], dataBits: [], stopBits: [], parity: [], mode: [] };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit {portName} Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Baud Rate</label>
            <select value={baud} onChange={(e) => onChange({ ...values, baud: Number(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              {dd.baud.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Bits</label>
            <select value={dataBits} onChange={(e) => onChange({ ...values, dataBits: Number(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              {dd.dataBits.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stop Bits</label>
            <select value={stopBits} onChange={(e) => onChange({ ...values, stopBits: Number(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              {dd.stopBits.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parity</label>
            <select value={parity} onChange={(e) => onChange({ ...values, parity: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              {dd.parity.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mode</label>
            <select value={mode} onChange={(e) => onChange({ ...values, mode: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              {dd.mode.map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-3 pt-6">
          <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
          <button onClick={onSave} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
};

const Network = () => {
  const { isConnected } = useAppSelector((state) => state.sensor);
  const [networkInterfaces, setNetworkInterfaces] = useState([]);
  const [ports, setPorts] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({ baud: [], dataBits: [], stopBits: [], parity: [], mode: [] });
  const [isLoadingPorts, setIsLoadingPorts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [modalValues, setModalValues] = useState({ baud: '', dataBits: '', stopBits: '', parity: '', mode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // react-toastify handles notifications
  const [devicesByInterface, setDevicesByInterface] = useState({ eth1: [], wlan0: [], serial_1: [], serial_2: [] });
  const [references, setReferences] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [deviceModals, setDeviceModals] = useState({
    eth1: { open: false, mode: 'add', data: null, originalName: null },
    wlan0: { open: false, mode: 'add', data: null, originalName: null },
    serial_1: { open: false, mode: 'add', data: null, originalName: null },
    serial_2: { open: false, mode: 'add', data: null, originalName: null },
  });
  
  // Modal states
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [editingInterface, setEditingInterface] = useState(null);
  const [editingSerialPort, setEditingSerialPort] = useState(null);
  
  // Form states
  const [networkForm, setNetworkForm] = useState({
    apply_mode: 'both',
    admin_state: 'up',
    method: 'dhcp',
    ipv4: { address: '', prefix: 24, gateway: '' },
    dns: ['8.8.8.8', '1.1.1.1'],
    mtu: 1500
  });
  
  const [serialForm, setSerialForm] = useState({
    apply_mode: 'both',
    baud: 115200,
    data_bits: 8,
    parity: 'none',
    stop_bits: 1,
    flow_control: 'none'
  });

  // Connectivity state
  const [connectivityStatus, setConnectivityStatus] = useState({});
  const [isLoadingConnectivity, setIsLoadingConnectivity] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDevices, setFilteredDevices] = useState({ eth1: [], wlan0: [], serial_1: [], serial_2: [] });

  useEffect(() => {
    fetchNetworkInterfaces();
    fetchSerialConfigs();
    fetchDevices();
    fetchConnectivityStatus();
  }, []);

  // Filter devices based on search query
  useEffect(() => {
    const filterDevices = () => {
      const filtered = {};
      Object.keys(devicesByInterface).forEach(ifaceKey => {
        if (searchQuery.trim() === '') {
          filtered[ifaceKey] = devicesByInterface[ifaceKey];
        } else {
          filtered[ifaceKey] = devicesByInterface[ifaceKey].filter(device =>
            device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.reference?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
      setFilteredDevices(filtered);
    };
    filterDevices();
  }, [devicesByInterface, searchQuery]);

  const notifySuccess = (message) => toast.success(message, { position: 'top-right' });
  const notifyError = (message) => toast.error(message, { position: 'top-right' });

  const isValidIPv4 = (ip) => {
    if (typeof ip !== 'string') return false;
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return false;
    for (const part of parts) {
      if (!/^\d{1,3}$/.test(part)) return false;
      const n = Number(part);
      if (n < 0 || n > 255) return false;
    }
    return true;
  };

  const fetchNetworkInterfaces = async () => {
    try {
      setLoading(true);
      // Use API route and request eth1,wlan0 in this order so we can label them consistently
      const requestedIfaces = ['eth1', 'wlan0'];
      const data = await ApiService.getNetworkInterfaces(requestedIfaces);
      const list = Array.isArray(data.interfaces) ? data.interfaces : [];
      // Attach a name inferred from the requested order since backend returns only ip/subnet/gateway/dns
      const normalized = list.map((item, idx) => ({
        name: requestedIfaces[idx] || `iface${idx + 1}`,
        ip: item.ip || '',
        subnet: item.subnet,
        gateway: item.gateway || '',
        dns: Array.isArray(item.dns) ? item.dns : []
      }));
      setNetworkInterfaces(normalized);
    } catch (err) {
      setError('Error fetching network interfaces: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSerialConfigs = async () => {
    try {
      setIsLoadingPorts(true);
      const data = await ApiService.getSerialPorts();
      const { dropdownOptions: dd, ...portsObj } = data || {};
      setPorts(portsObj || {});
      setDropdownOptions(
        dd || {
          baud: [110, 300, 600, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
          dataBits: [5, 6, 7, 8],
          stopBits: [1, 2],
          parity: ['none', 'even', 'odd', 'mark', 'space'],
          mode: ['raw', 'canonical']
        }
      );
    } catch (err) {
      notifyError('Error fetching serial ports: ' + err.message);
      setError('Error fetching serial ports: ' + err.message);
    } finally {
      setIsLoadingPorts(false);
    }
  };

  // Devices APIs
  const fetchDevices = async () => {
    try {
      setIsLoadingDevices(true);
      const data = await ApiService.getDevices();
      const byIface = data.devices || {};
      setDevicesByInterface({
        eth1: Array.isArray(byIface.eth1) ? byIface.eth1 : [],
        wlan0: Array.isArray(byIface.wlan0) ? byIface.wlan0 : [],
        serial_1: Array.isArray(byIface.serial_1) ? byIface.serial_1 : [],
        serial_2: Array.isArray(byIface.serial_2) ? byIface.serial_2 : [],
      });
      setReferences(Array.isArray(data.references) ? data.references : []);
    } catch (e) {
      notifyError('Error fetching devices: ' + e.message);
      setError('Error fetching devices: ' + e.message);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const fetchConnectivityStatus = async () => {
    try {
      setIsLoadingConnectivity(true);
      const data = await ApiService.getConnectivityStatus(['eth1', 'wlan0']);
      setConnectivityStatus(data.connectivity || {});
    } catch (e) {
      console.error('Error fetching connectivity status:', e.message);
      // Don't show error toast for connectivity as it's not critical
    } finally {
      setIsLoadingConnectivity(false);
    }
  };

  const refreshConnectivity = async () => {
    await fetchConnectivityStatus();
    notifySuccess('Connectivity status refreshed');
  };

  const fetchDevicesForInterface = async (iface) => {
    try {
      const data = await ApiService.getDevicesForInterface(iface);
      setDevicesByInterface((prev) => ({ ...prev, [iface]: Array.isArray(data.devices) ? data.devices : [] }));
    } catch (e) {
      notifyError('Error fetching interface devices: ' + e.message);
      setError('Error fetching interface devices: ' + e.message);
    }
  };

  // Device modal helpers
  const openAddDeviceModal = (iface) => {
    // Set default protocol based on interface
    const defaultProtocol = (iface === 'eth1' || iface === 'wlan0') ? 'modbus_tcp' : 'modbus_rtu';
    
    const defaults = {
      device_name: '',
      reference: '',
      protocol: defaultProtocol,
      interface: iface,
      device_id: '',
      response_timeout: 0.5,
      device_ip: '',
      tcp_port: 502,
      keep_tcp_seasion_open: false,
      cocurrent_access: false,
      byte_timeout: 0.5
    };
    setDeviceModals((prev) => ({ ...prev, [iface]: { open: true, mode: 'add', data: defaults, originalName: null } }));
  };

  const openEditDeviceModal = (iface, device) => {
    setDeviceModals((prev) => ({ ...prev, [iface]: { open: true, mode: 'edit', data: { ...device }, originalName: device.device_name } }));
  };

  const closeDeviceModal = (iface) => {
    setDeviceModals((prev) => ({ ...prev, [iface]: { open: false, mode: 'add', data: null, originalName: null } }));
  };

  const submitDeviceModal = async (iface) => {
    const modal = deviceModals[iface];
    if (!modal || !modal.data) return;
    try {
      const payload = { ...modal.data, interface: iface };

      // Validation with empty defaults
      if (!payload.device_name || !payload.device_name.trim()) {
        notifyError('Device name is required');
        return;
      }
      if (!payload.protocol) {
        notifyError('Protocol is required');
        return;
      }
      if (!payload.reference) {
        notifyError('Reference is required');
        return;
      }
      const toNum = (v) => (v === '' || v === null ? NaN : Number(v));
      const deviceIdNum = toNum(payload.device_id);
      const respTimeoutNum = toNum(payload.response_timeout);
      if (Number.isNaN(deviceIdNum) || deviceIdNum < 0 || deviceIdNum > 255) {
        notifyError('Device ID must be between 0-255');
        return;
      }
      if (Number.isNaN(respTimeoutNum) || respTimeoutNum <= 0) {
        notifyError('Response timeout must be greater than 0');
        return;
      }
      if (payload.protocol === 'modbus_tcp') {
        if (!payload.device_ip || !isValidIPv4(payload.device_ip)) {
          notifyError('Valid IPv4 address is required for Modbus TCP');
          return;
        }
        const tcpPortNum = toNum(payload.tcp_port);
        if (Number.isNaN(tcpPortNum) || tcpPortNum <= 0 || tcpPortNum > 65535) {
          notifyError('TCP port must be 1-65535');
          return;
        }
        payload.tcp_port = tcpPortNum;
      }
      if (payload.protocol === 'modbus_rtu') {
        const byteTimeoutNum = toNum(payload.byte_timeout);
        if (Number.isNaN(byteTimeoutNum) || byteTimeoutNum <= 0) {
          notifyError('Byte timeout must be greater than 0 for Modbus RTU');
          return;
        }
        payload.byte_timeout = byteTimeoutNum;
      }
      payload.device_id = deviceIdNum;
      payload.response_timeout = respTimeoutNum;

      // Build clean payload without protocol-specific leftovers
      const base = {
        device_name: payload.device_name.trim(),
        reference: payload.reference,
        protocol: payload.protocol,
        interface: iface,
        device_id: payload.device_id,
        response_timeout: payload.response_timeout,
      };
      const finalPayload =
        payload.protocol === 'modbus_tcp'
          ? {
              ...base,
              device_ip: payload.device_ip,
              tcp_port: payload.tcp_port,
              keep_tcp_seasion_open: !!payload.keep_tcp_seasion_open,
              cocurrent_access: !!payload.cocurrent_access,
            }
          : {
              ...base,
              byte_timeout: payload.byte_timeout,
            };
      let data;
      if (modal.mode === 'add') {
        data = await ApiService.createDevice(finalPayload);
      } else {
        const originalName = modal.originalName || payload.device_name;
        data = await ApiService.updateDevice(originalName, finalPayload);
      }
      if (data.error || data.success === false) {
        throw new Error(data.error || 'Request failed');
      }
      notifySuccess(modal.mode === 'add' ? 'Device added' : 'Device updated');
      closeDeviceModal(iface);
      await fetchDevicesForInterface(iface);
    } catch (e) {
      notifyError(e.message || 'Operation failed');
    }
  };

  const deleteDevice = async (iface, device) => {
    try {
      const ok = window.confirm(`Delete device "${device.device_name}"?`);
      if (!ok) return;
      const data = await ApiService.deleteDevice(device.device_name);
      if (data.error || data.success === false) {
        throw new Error(data.error || 'Failed to delete');
      }
      notifySuccess('Device deleted');
      await fetchDevicesForInterface(iface);
    } catch (e) {
      notifyError(e.message || 'Delete failed');
    }
  };

  const openNetworkModal = (iface) => {
    setEditingInterface(iface);
    setNetworkForm({
      apply_mode: 'both',
      admin_state: iface.admin_state || 'up',
      method: iface.persist?.method || 'dhcp',
      ipv4: {
        address: iface.persist?.address || '',
        prefix: iface.persist?.prefix || 24,
        gateway: iface.persist?.gateway || ''
      },
      dns: iface.persist?.dns || ['8.8.8.8', '1.1.1.1'],
      mtu: iface.persist?.mtu || iface.mtu || 1500
    });
    setShowNetworkModal(true);
  };

  // Serial modal handlers
  const openSerialEdit = (name) => {
    const vals = ports[name] || {};
    const dd = {
      baud: dropdownOptions?.baud?.length ? dropdownOptions.baud : [110, 300, 600, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
      dataBits: dropdownOptions?.dataBits?.length ? dropdownOptions.dataBits : [5, 6, 7, 8],
      stopBits: dropdownOptions?.stopBits?.length ? dropdownOptions.stopBits : [1, 2],
      parity: dropdownOptions?.parity?.length ? dropdownOptions.parity : ['none', 'even', 'odd', 'mark', 'space'],
      mode: dropdownOptions?.mode?.length ? dropdownOptions.mode : ['raw', 'canonical']
    };
    const safeBaud = typeof vals.baud === 'number' && dd.baud.includes(vals.baud) ? vals.baud : (dd.baud[0] || 115200);
    const safeDataBits = typeof vals.dataBits === 'number' && dd.dataBits.includes(vals.dataBits) ? vals.dataBits : (dd.dataBits.includes(8) ? 8 : (dd.dataBits[0] || 8));
    const safeStopBits = typeof vals.stopBits === 'number' && dd.stopBits.includes(vals.stopBits) ? vals.stopBits : (dd.stopBits.includes(1) ? 1 : (dd.stopBits[0] || 1));
    const safeParity = typeof vals.parity === 'string' && dd.parity.includes(vals.parity) ? vals.parity : 'none';
    const safeMode = typeof vals.mode === 'string' && dd.mode.includes(vals.mode) ? vals.mode : (dd.mode[0] || 'raw');
    setEditingPort(name);
    setModalValues({
      baud: safeBaud,
      dataBits: safeDataBits,
      stopBits: safeStopBits,
      parity: safeParity,
      mode: safeMode,
    });
    setIsModalOpen(true);
  };
  const closeSerialEdit = () => { setIsModalOpen(false); setEditingPort(null); };
  const saveSerialEdit = async () => {
    try {
      const dd = {
        baud: dropdownOptions?.baud?.length ? dropdownOptions.baud : [110, 300, 600, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
        dataBits: dropdownOptions?.dataBits?.length ? dropdownOptions.dataBits : [5, 6, 7, 8],
        stopBits: dropdownOptions?.stopBits?.length ? dropdownOptions.stopBits : [1, 2],
        parity: dropdownOptions?.parity?.length ? dropdownOptions.parity : ['none', 'even', 'odd', 'mark', 'space'],
        mode: dropdownOptions?.mode?.length ? dropdownOptions.mode : ['raw', 'canonical']
      };
      const payload = {
        baud: Number.isFinite(modalValues.baud) && dd.baud.includes(modalValues.baud) ? modalValues.baud : (dd.baud[0] || 115200),
        dataBits: Number.isFinite(modalValues.dataBits) && dd.dataBits.includes(modalValues.dataBits) ? modalValues.dataBits : (dd.dataBits.includes(8) ? 8 : (dd.dataBits[0] || 8)),
        stopBits: Number.isFinite(modalValues.stopBits) && dd.stopBits.includes(modalValues.stopBits) ? modalValues.stopBits : (dd.stopBits.includes(1) ? 1 : (dd.stopBits[0] || 1)),
        parity: typeof modalValues.parity === 'string' && dd.parity.includes(modalValues.parity) ? modalValues.parity : 'none',
        mode: typeof modalValues.mode === 'string' && dd.mode.includes(modalValues.mode) ? modalValues.mode : (dd.mode[0] || 'raw'),
      };
      console.log('🔧 Saving serial config', { port: editingPort, ...payload });
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const resp = await fetch(`${backendUrl}/serial-ports/${editingPort}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data.success === false) {
        notifyError(data.error || 'Failed to update serial config');
        console.error('❌ Failed to update serial config', data);
      } else {
        notifySuccess('Serial config updated');
        console.log('✅ Serial config updated', data);
        await fetchSerialConfigs();
      }
    } catch (e) {
      notifyError(e.message || 'Error saving serial config');
      console.error('❌ Error saving serial config', e);
    } finally {
      setIsModalOpen(false);
      setEditingPort(null);
    }
  };

  const openSerialModal = (port) => {
    setEditingSerialPort(port);
    setSerialForm({
      apply_mode: 'both',
      baud: port.runtime?.baud || 115200,
      data_bits: port.runtime?.data_bits || 8,
      parity: port.runtime?.parity || 'none',
      stop_bits: port.runtime?.stop_bits || 1,
      flow_control: port.runtime?.flow_control || 'none'
    });
    setShowSerialModal(true);
  };

  const handleNetworkSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${backendUrl}/net/ifaces/${editingInterface.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(networkForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setShowNetworkModal(false);
          fetchNetworkInterfaces();
          setError(null);
        } else {
          setError(result.error || 'Failed to update interface');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update interface');
      }
    } catch (err) {
      setError('Error updating interface: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSerialSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${backendUrl}/serial/ports/${editingSerialPort.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serialForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setShowSerialModal(false);
          fetchSerialConfigs();
          setError(null);
        } else {
          setError(result.error || 'Failed to update serial port');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update serial port');
      }
    } catch (err) {
      setError('Error updating serial port: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (state) => {
    if (state === 'up' || state === 'LOWER_UP') {
      return <Wifi className="text-green-500" size={20} />;
    }
    return <WifiOff className="text-red-500" size={20} />;
  };

  const getStatusColor = (state) => {
    if (state === 'up' || state === 'LOWER_UP') {
      return 'text-green-600 bg-green-100';
    }
    return 'text-red-600 bg-red-100';
  };

  // Helper function to highlight search terms
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  // Helper function to render connectivity indicators
  const renderConnectivityIndicators = (ifaceKey) => {
    if (!ifaceKey.startsWith('eth') && ifaceKey !== 'wlan0') {
      return null; // Only show for network interfaces
    }

    const status = connectivityStatus[ifaceKey];
    if (!status) {
  return (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Checking...</span>
      </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 mt-2">
        {/* Local/Link Connectivity Indicator */}
        <div className="flex items-center gap-1" title={status.local?.details || 'Local connectivity status'}>
          <div className={`w-2 h-2 rounded-full ${status.local?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-600">Local</span>
        </div>
        
        {/* Internet Reachability Indicator */}
        <div className="flex items-center gap-1" title={status.internet?.details || 'Internet reachability status'}>
          <Globe2 
            size={12} 
            className={status.internet?.reachable ? 'text-blue-500' : 'text-gray-400'} 
          />
          <span className="text-xs text-gray-600">Internet</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Perfect gradient background that merges beautifully in the middle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/8 via-[#198c1a]/12 to-[#0097b2]/8"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0097b2]/6 via-[#198c1a]/10 to-[#0097b2]/6"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#0097b2]/5 via-[#198c1a]/8 to-[#0097b2]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-tl from-[#198c1a]/6 via-[#0097b2]/4 to-[#198c1a]/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      {/* Enhanced Header with professional design */}
      <div className="p-6 mb-8 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-[#198c1a]/20 shadow-2xl shadow-[#198c1a]/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                  <NetworkIcon className="text-white drop-shadow-lg" size={32} />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-2">
                  <span>IoT Dashboard</span>
                  <span>/</span>
                  <span className="text-[#198c1a] font-medium">Network</span>
                </div>
                <h1 className="text-5xl font-black text-gray-800 mb-2 tracking-tight drop-shadow-lg">
                  Network Management
                </h1>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#198c1a] rounded-full animate-pulse shadow-lg"></div>
                  <p className="text-gray-700 text-lg font-medium drop-shadow-sm">Advanced network interface and device management</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#198c1a]/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm">Total Devices</div>
                  <div className="text-2xl font-bold text-[#198c1a]">
                    {Object.values(filteredDevices).reduce((total, devices) => total + devices.length, 0)}
                  </div>
                </div>
                <Server className="w-8 h-8 text-[#198c1a]/60" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#0097b2]/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm">Active Interfaces</div>
                  <div className="text-2xl font-bold text-[#0097b2]">4</div>
                </div>
                <Router className="w-8 h-8 text-[#0097b2]/60" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#198c1a]/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm">Connectivity</div>
                  <div className="text-2xl font-bold text-[#198c1a]">Healthy</div>
                </div>
                <Globe2 className="w-8 h-8 text-[#198c1a]/60" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        autoClose={3000} 
        newestOnTop 
        closeOnClick 
        pauseOnHover={false} 
        theme="colored"
        toastClassName="backdrop-blur-sm"
        position="top-right"
      />

            {/* Enhanced Search and Controls */}
      <div className="px-6 mb-8">
        <div className="bg-white/95 backdrop-blur-xl border border-[#198c1a]/15 rounded-2xl shadow-xl shadow-[#198c1a]/5 p-6 hover:shadow-2xl hover:shadow-[#198c1a]/10 transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Advanced Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-[#0097b2] group-hover:scale-110 transition-transform duration-200" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-[#198c1a]/20 rounded-xl text-sm placeholder-gray-500 focus:ring-4 focus:ring-[#198c1a]/20 focus:border-[#198c1a] bg-white/95 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-[#198c1a]/10"
                  placeholder="🔍 Search devices by name, protocol, reference, or interface..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0097b2] transition-all duration-200 hover:scale-110"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {/* Search suggestions indicator */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0097b2]/5 to-[#198c1a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>

            {/* Enhanced Controls */}
            <div className="flex items-center gap-4">
              {/* Live Device Counter with animation */}
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#0097b2]/15 to-[#198c1a]/15 rounded-xl border-2 border-[#0097b2]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <Server size={20} className="text-[#0097b2]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#0097b2]">
                    {Object.values(filteredDevices).reduce((total, devices) => total + devices.length, 0)}
                  </div>
                  <div className="text-xs text-[#0097b2]/70 font-medium">
                    {searchQuery ? 'Found' : 'Total'}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <button 
                  onClick={refreshConnectivity}
                  className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-[#0097b2]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#0097b2]/10 group"
                  title="Refresh Connectivity"
                >
                  <RefreshCw className="w-5 h-5 text-[#0097b2] group-hover:rotate-180 transition-transform duration-500" />
                </button>

                {/* Filter Status */}
                {searchQuery && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 rounded-xl border-2 border-orange-200 shadow-lg animate-bounce-gentle">
                    <Filter size={16} />
                    <span className="text-sm font-semibold">Active Filter</span>
        </div>
      )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Device Management */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[75vh]">
          {['eth1','wlan0','serial_1','serial_2'].map((ifaceKey) => (
            <div key={ifaceKey} className="bg-white/95 backdrop-blur-md border border-[#198c1a]/15 rounded-xl shadow-xl shadow-[#198c1a]/5 hover:shadow-2xl hover:shadow-[#198c1a]/10 transition-all duration-300 flex flex-col h-full">
              {/* Header with interface icon and name */}
              <div className="px-6 py-4 border-b border-white/30 bg-gradient-to-r from-[#0097b2]/5 to-[#198c1a]/5 rounded-t-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {ifaceKey.startsWith('eth') ? (
                      <Router className="text-[#0097b2]" size={20} />
                    ) : ifaceKey === 'wlan0' ? (
                      <Wifi className="text-[#198c1a]" size={20} />
                    ) : (
                      <Cable className="text-[#0097b2]" size={20} />
                    )}
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">{ifaceKey}</div>
                      <div className="text-xs text-gray-500">
                        {ifaceKey.startsWith('eth') ? 'Ethernet Interface' : ifaceKey === 'wlan0' ? 'WiFi Interface' : 'Serial Port'}
                      </div>
                    </div>
                  </div>
          <button
                    onClick={() => {
                      if (ifaceKey === 'eth1' || ifaceKey === 'wlan0') {
                        const found = networkInterfaces.find((i) => i.name === ifaceKey) || { name: ifaceKey };
                        openNetworkModal(found);
                      } else {
                        const map = { serial_1: 'COM1', serial_2: 'COM2' };
                        openSerialEdit(map[ifaceKey]);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-lg hover:from-[#007a93] hover:to-[#147015] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Edit size={14} /> Edit
          </button>
        </div>

                {/* Connectivity Indicators */}
                {renderConnectivityIndicators(ifaceKey)}
          </div>
              
          
              
              {/* Device Count */}
              <div className="px-6 py-3 text-sm text-gray-600 border-b border-white/20 bg-gradient-to-r from-[#0097b2]/5 to-[#198c1a]/5">
                <div className="flex items-center gap-2">
                  <Server size={14} className="text-gray-500" />
                  {isLoadingDevices ? (
                    <span className="animate-pulse">Loading devices…</span>
                  ) : (
                    <span className="font-medium">
                      {filteredDevices[ifaceKey]?.length || 0} device(s)
                      {searchQuery && devicesByInterface[ifaceKey]?.length !== filteredDevices[ifaceKey]?.length && (
                        <span className="text-gray-500"> of {devicesByInterface[ifaceKey]?.length || 0}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Devices List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {(filteredDevices[ifaceKey] || []).map((dev) => (
                  <div key={dev.device_name} className="group border border-white/40 rounded-lg p-4 hover:shadow-xl hover:border-[#0097b2]/50 hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/95 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {highlightSearchTerm(dev.device_name, searchQuery)}
                        </div>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#0097b2]/20 to-[#198c1a]/20 text-[#0097b2] mb-2">
                          {highlightSearchTerm(dev.protocol, searchQuery)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => openEditDeviceModal(ifaceKey, dev)} 
                          className="p-2 rounded-lg bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white hover:from-[#007a93] hover:to-[#147015] transition-all duration-200 shadow-md hover:shadow-lg"
                          title="Edit Device"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteDevice(ifaceKey, dev)} 
                          className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          title="Delete Device"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600 space-y-1">
                      {dev.protocol === 'modbus_tcp' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">IP:</span>
                            <span className="font-medium">{dev.device_ip || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Port:</span>
                            <span className="font-medium">{dev.tcp_port || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Keep Session:</span>
                            <span className={`font-medium ${dev.keep_tcp_seasion_open ? 'text-green-600' : 'text-gray-600'}`}>
                              {dev.keep_tcp_seasion_open ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Device ID:</span>
                            <span className="font-medium">{dev.device_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Byte Timeout:</span>
                            <span className="font-medium">{dev.byte_timeout || '—'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {filteredDevices[ifaceKey]?.length === 0 && !isLoadingDevices && (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery && devicesByInterface[ifaceKey]?.length > 0 ? (
                      <>
                        <Search size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No devices match your search</p>
                        <p className="text-xs">Try adjusting your search terms</p>
                      </>
                    ) : (
                      <>
                        <Server size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No devices configured</p>
                        <p className="text-xs">Click "Add Device" to get started</p>
                      </>
                    )}
          </div>
        )}
         <div className="px-6 py-4 border-b border-white/20">
                <button 
                  onClick={() => openAddDeviceModal(ifaceKey)} 
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-gradient-to-r from-[#198c1a] to-[#0097b2] text-white rounded-lg hover:from-[#147015] hover:to-[#007a93] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Plus size={16} /> Add Device
                </button>
              </div>
              </div>
            </div>
          ))}
      </div>

        {/* Custom scrollbar and enhanced styles */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
            border-radius: 4px;
            margin: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #0097b2, #198c1a);
            border-radius: 4px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #007a93, #147015);
            transform: scale(1.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:active {
            background: linear-gradient(to bottom, #006580, #0f5a11);
          }
          
          @keyframes bounce-gentle {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-4px);
            }
            60% {
              transform: translateY(-2px);
            }
          }
          
          .animate-bounce-gentle {
            animation: bounce-gentle 2s infinite;
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes glow {
            0%, 100% {
              box-shadow: 0 0 5px rgba(0, 151, 178, 0.5);
            }
            50% {
              box-shadow: 0 0 20px rgba(0, 151, 178, 0.8), 0 0 30px rgba(25, 140, 26, 0.4);
            }
          }
          
          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }
        `}</style>
        </div>


      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
      </div>
      )}

      <EditPortModal
        isOpen={isModalOpen}
        portName={editingPort}
        values={modalValues}
        options={dropdownOptions}
        onClose={closeSerialEdit}
        onSave={saveSerialEdit}
        onChange={setModalValues}
      />

      {/* Add/Edit Device Modals per interface */}
      {(['eth1','wlan0','serial_1','serial_2']).map((ifaceKey) => {
        const modal = deviceModals[ifaceKey];
        if (!modal.open) return null;
        const d = modal.data || {};
        return (
          <div key={`modal-${ifaceKey}`} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
              <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-[#0097b2]/10 to-[#198c1a]/10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-lg">
                    <Plus className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {modal.mode === 'add' ? 'Add Device' : 'Edit Device'}
                    <div className="text-sm font-normal text-gray-600">{ifaceKey}</div>
              </h3>
                </div>
              <button
                  onClick={() => closeDeviceModal(ifaceKey)} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
              <div className="p-6 space-y-6">
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Device Name</label>
                  <input 
                    type="text" 
                    value={d.device_name || ''} 
                    onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, device_name: e.target.value } } }))} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                    placeholder="Enter device name"
                  />
              </div>
                <div className="grid grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reference</label>
                <select
                      value={d.reference || ''} 
                      onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, reference: e.target.value } } }))} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors duration-200"
                    >
                      <option value="" disabled>Select reference…</option>
                      {(references || []).map((r) => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Protocol</label>
                <select
                      value={d.protocol || ''} 
                      onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, protocol: e.target.value } } }))} 
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                    >
                      <option value="" disabled>Select protocol…</option>
                      <option value="modbus_tcp">modbus_tcp</option>
                      <option value="modbus_rtu">modbus_rtu</option>
                </select>
              </div>
                </div>
                  <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Interface</label>
                    <input
                      type="text"
                    value={ifaceKey} 
                    readOnly 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-600 cursor-not-allowed" 
                    />
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Device ID (0-255)</label>
                    <input
                      type="number"
                      min="0" 
                      max="255" 
                      value={d.device_id ?? ''} 
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(255, Number(e.target.value)));
                        setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, device_id: value } } }))
                      }} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors duration-200" 
                      placeholder="0-255"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Response Timeout (s)</label>
                    <input
                      type="number" 
                      step="0.1" 
                      min="0.1" 
                      value={d.response_timeout ?? ''} 
                      onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, response_timeout: Number(e.target.value) } } }))} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors duration-200" 
                      placeholder="0.5"
                    />
                  </div>
                </div>
                {d.protocol === 'modbus_tcp' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
              <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Device IP</label>
                <input
                  type="text"
                          value={d.device_ip || ''} 
                          onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, device_ip: e.target.value } } }))} 
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors duration-200" 
                          placeholder="192.168.1.100"
                />
              </div>
              <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">TCP Port</label>
                <input
                  type="number"
                          min="1" 
                          max="65535" 
                          value={d.tcp_port ?? ''} 
                          onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, tcp_port: Number(e.target.value) } } }))} 
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors duration-200" 
                          placeholder="502"
                />
              </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="inline-flex items-center gap-3 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!d.keep_tcp_seasion_open} 
                          onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, keep_tcp_seasion_open: e.target.checked } } }))} 
                          className="rounded border-gray-300 text-[#0097b2] focus:ring-[#0097b2]"
                        />
                        <span className="font-medium">Keep TCP Session Open</span>
                      </label>
                      <label className="inline-flex items-center gap-3 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!d.cocurrent_access} 
                          onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, cocurrent_access: e.target.checked } } }))} 
                          className="rounded border-gray-300 text-[#0097b2] focus:ring-[#0097b2]"
                        />
                        <span className="font-medium">Concurrent Access</span>
                      </label>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Byte Timeout (s)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.1" 
                      value={d.byte_timeout ?? ''} 
                      onChange={(e) => setDeviceModals((prev) => ({ ...prev, [ifaceKey]: { ...prev[ifaceKey], data: { ...d, byte_timeout: Number(e.target.value) } } }))} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-colors duration-200" 
                      placeholder="0.5"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-6 bg-gradient-to-r from-[#0097b2]/5 to-[#198c1a]/5 rounded-b-2xl border-t border-white/20">
                <button 
                  onClick={() => closeDeviceModal(ifaceKey)} 
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => submitDeviceModal(ifaceKey)} 
                  className="flex-1 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white px-6 py-3 rounded-lg hover:from-[#007a93] hover:to-[#147015] transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {modal.mode === 'add' ? 'Add Device' : 'Update Device'}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Network Interface Modal - read-only runtime info for eth1/eth2 */}
      {showNetworkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-[#0097b2]/10 to-[#198c1a]/10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] rounded-lg">
                  <Router className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingInterface?.name}
                  <div className="text-sm font-normal text-gray-600">Network Interface</div>
                </h3>
              </div>
                <button
                onClick={() => setShowNetworkModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                <X size={20} />
                </button>
            </div>

            {(() => {
              const runtime = networkInterfaces.find((i) => i.name === editingInterface?.name) || {};
              return (
                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">IP Address</div>
                    <div className="text-lg text-gray-900 font-semibold">{runtime.ip || 'Not assigned'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Subnet Mask</div>
                    <div className="text-lg text-gray-900 font-semibold">{typeof runtime.subnet === 'number' ? `/${runtime.subnet}` : (runtime.subnet || 'Not configured')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Gateway</div>
                    <div className="text-lg text-gray-900 font-semibold">{runtime.gateway || 'Not configured'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">DNS Servers</div>
                    <div className="text-lg text-gray-900 font-semibold">{Array.isArray(runtime.dns) && runtime.dns.length ? runtime.dns.join(', ') : 'Not configured'}</div>
                  </div>
                </div>
              );
            })()}

            <div className="p-6 bg-gradient-to-r from-[#0097b2]/5 to-[#198c1a]/5 rounded-b-2xl border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowNetworkModal(false)}
                className="w-full bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white px-6 py-3 rounded-lg hover:from-[#007a93] hover:to-[#147015] transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                Close
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Serial Port Edit Modal */}
      {showSerialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit {editingSerialPort?.id}
              </h3>
              <button
                onClick={() => setShowSerialModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSerialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Apply Mode</label>
                <select
                  value={serialForm.apply_mode}
                  onChange={(e) => setSerialForm({...serialForm, apply_mode: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="runtime">Runtime Only</option>
                  <option value="persist">Persist Only</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Baud Rate</label>
                <select
                  value={serialForm.baud}
                  onChange={(e) => setSerialForm({...serialForm, baud: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={9600}>9600</option>
                  <option value={19200}>19200</option>
                  <option value={38400}>38400</option>
                  <option value={57600}>57600</option>
                  <option value={115200}>115200</option>
                  <option value={230400}>230400</option>
                  <option value={460800}>460800</option>
                  <option value={921600}>921600</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data Bits</label>
                <select
                  value={serialForm.data_bits}
                  onChange={(e) => setSerialForm({...serialForm, data_bits: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                  <option value={8}>8</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Parity</label>
                <select
                  value={serialForm.parity}
                  onChange={(e) => setSerialForm({...serialForm, parity: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="none">None</option>
                  <option value="even">Even</option>
                  <option value="odd">Odd</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stop Bits</label>
                <select
                  value={serialForm.stop_bits}
                  onChange={(e) => setSerialForm({...serialForm, stop_bits: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Flow Control</label>
                <select
                  value={serialForm.flow_control}
                  onChange={(e) => setSerialForm({...serialForm, flow_control: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="none">None</option>
                  <option value="xonxoff">XON/XOFF</option>
                  <option value="rtscts">RTS/CTS</option>
                  <option value="dtrdsr">DTR/DSR</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSerialModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Network; 