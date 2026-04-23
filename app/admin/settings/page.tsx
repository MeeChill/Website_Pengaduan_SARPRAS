'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, AlertCircle, CheckCircle, Database, Shield, Bell, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Neo-Sarana',
    supportEmail: 'support@neo-sarana.com',
    maintenanceMode: false,
    emailNotifications: true,
    twoFactorAuth: false,
    dataBackup: 'auto'
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Simulate saving
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-indigo-400" />
            Pengaturan Sistem
          </h1>
          <p className="text-slate-400 mt-1">Konfigurasi dan manajemen sistem</p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/30"
          >
            <CheckCircle className="w-5 h-5" />
            Pengaturan tersimpan
          </motion.div>
        )}
      </motion.div>

      {/* Settings Sections */}
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* General Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            Pengaturan Umum
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Nama Sistem</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Dukungan</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Keamanan
          </h2>

          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between p-4 bg-slate-900/30 border border-white/5 rounded-lg"
              whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
            >
              <div>
                <p className="text-white font-medium">Autentikasi Dua Faktor</p>
                <p className="text-slate-400 text-sm">Tingkatkan keamanan akun admin</p>
              </div>
              <motion.button
                onClick={() => handleChange('twoFactorAuth', !settings.twoFactorAuth)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.twoFactorAuth ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="inline-block h-6 w-6 transform rounded-full bg-white"
                  animate={{ x: settings.twoFactorAuth ? 28 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Notifikasi
          </h2>

          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between p-4 bg-slate-900/30 border border-white/5 rounded-lg"
              whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
            >
              <div>
                <p className="text-white font-medium">Notifikasi Email</p>
                <p className="text-slate-400 text-sm">Terima notifikasi melalui email</p>
              </div>
              <motion.button
                onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="inline-block h-6 w-6 transform rounded-full bg-white"
                  animate={{ x: settings.emailNotifications ? 28 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Database Settings */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Database
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Backup Otomatis</label>
              <select
                value={settings.dataBackup}
                onChange={(e) => handleChange('dataBackup', e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="hourly">Setiap Jam</option>
                <option value="daily">Setiap Hari</option>
                <option value="weekly">Setiap Minggu</option>
                <option value="auto">Otomatis</option>
              </select>
            </div>

            <motion.div
              className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-300 text-sm font-medium">Backup Terbaru</p>
                <p className="text-blue-400/70 text-xs mt-1">22 April 2026, 14:30 WIB</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6">Status Sistem</h2>

          <div className="space-y-3">
            {[
              { label: 'Database', status: 'online', value: 'PostgreSQL' },
              { label: 'Email Service', status: 'online', value: 'Resend' },
              { label: 'File Storage', status: 'online', value: 'Local' },
              { label: 'API Response', status: 'online', value: '125ms' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-900/30 border border-white/5 rounded-lg"
              >
                <div>
                  <p className="text-slate-300 font-medium text-sm">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.value}</p>
                </div>
                <motion.div
                  className="w-3 h-3 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-end gap-3"
      >
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/30"
        >
          <Save className="w-5 h-5" />
          Simpan Pengaturan
        </motion.button>
      </motion.div>
    </div>
  );
}
