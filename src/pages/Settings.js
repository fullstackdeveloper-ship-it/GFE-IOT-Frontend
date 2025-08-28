import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Clock,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Globe,
  Building
} from 'lucide-react';
import Toast from '../components/Toast';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { appConfig, updateConfig, updateDeviceTime, isLoading } = useAppContext();
  const { changePassword } = useAuth();
  
  const [config, setConfig] = useState({
    siteName: '',
    deviceTime: '',
    timezone: 'UTC'
  });
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Timezone options
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
  ];

  // Sync local config with app context
  useEffect(() => {
    setConfig({
      siteName: appConfig.siteName || '',
      deviceTime: appConfig.deviceTime || '',
      timezone: appConfig.timezone || 'UTC'
    });
  }, [appConfig]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      
      // Save site configuration
      await updateConfig(config);
      
      // If device time is set, also update device time and timezone
      if (config.deviceTime) {
        try {
          const response = await updateDeviceTime(config.deviceTime, config.timezone);
          if (response.warning) {
            showToast('✨ Settings saved! Note: ' + response.warning, 'warning');
          } else {
            showToast('✨ All settings saved successfully!', 'success');
          }
        } catch (timeError) {
          console.error('Error setting device time:', timeError);
          showToast('Site settings saved, but device time update failed', 'warning');
        }
      } else {
        showToast('✨ Site settings saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDeviceTime = async () => {
    if (!config.deviceTime) {
      showToast('Please select a device time', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await updateDeviceTime(config.deviceTime, config.timezone);
      
      if (response.warning) {
        showToast(response.message + ' - ' + response.warning, 'warning');
      } else {
        showToast('✨ Device time and timezone saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error setting device time:', error);
      showToast('Failed to update device time', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setSaving(true);
      const result = await changePassword(passwords.newPassword);
      
      if (result.success) {
        showToast('Password changed successfully!', 'success');
        setPasswords({ newPassword: '', confirmPassword: '' });
      } else {
        showToast(result.message || 'Password change failed', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast('Password change failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0097b2] mx-auto mb-4" />
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/3 via-[#198c1a]/5 to-[#0097b2]/3"></div>
          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-3 bg-gradient-to-br from-[#0097b2] to-[#198c1a] rounded-xl shadow-lg">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">Settings</h1>
              <p className="text-gray-600">Configure your application preferences</p>
            </div>
          </div>
        </div>

        {/* Site Configuration */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/2 via-[#198c1a]/3 to-[#0097b2]/2"></div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className="p-2 bg-gradient-to-br from-[#198c1a] to-[#0097b2] rounded-lg shadow-lg">
              <Building className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">Site Configuration</h2>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Site Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => handleConfigChange('siteName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter your site name"
              />
            </div>

            {/* Device Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Time
              </label>
              <input
                type="datetime-local"
                value={config.deviceTime}
                onChange={(e) => handleConfigChange('deviceTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-all duration-200 text-gray-900"
              />
              <p className="text-sm text-gray-500 mt-2">
                Set the current device time for accurate timestamping
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={config.timezone}
                onChange={(e) => handleConfigChange('timezone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-all duration-200 text-gray-900 bg-white"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end relative z-10">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-lg hover:from-[#0097b2]/90 hover:to-[#198c1a]/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 font-medium"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>
        </div>



        {/* Password Settings */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-[#198c1a]/5 border border-[#198c1a]/15 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/2 via-[#198c1a]/3 to-[#0097b2]/2"></div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">Password Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Minimum 6 characters required
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end relative z-10">
            <button
              onClick={handleChangePassword}
              disabled={!passwords.newPassword || !passwords.confirmPassword || saving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 font-medium"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{saving ? 'Changing Password...' : 'Change Password'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
};

export default Settings; 