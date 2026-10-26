import React, { useState } from 'react';
import { X, Send, CheckCircle2, History, MessageCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { lineService } from '../services/lineService';
import { LineNotificationConfig, LineMessageLog } from '../types';

interface LineNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LineNotificationModal: React.FC<LineNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<LineNotificationConfig>(storageService.getLineConfig());
  const [logs, setLogs] = useState<LineMessageLog[]>(storageService.getLineLogs());
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveLineConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendTest = async () => {
    const dummyTicket = storageService.getTickets()[0];
    if (dummyTicket) {
      await lineService.sendNotification(dummyTicket, 'STATUS_CHANGE');
      setLogs(storageService.getLineLogs());
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#06C755] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl backdrop-blur-xs">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">ระบบแจ้งเตือนผ่าน LINE</h2>
              <p className="text-xs text-white/90">LINE Notify & Webhook ส่งตรงถึงทีมช่าง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ตั้งค่าการแจ้งเตือน
          </button>
          <button
            onClick={() => {
              setLogs(storageService.getLineLogs());
              setActiveTab('logs');
            }}
            className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            ประวัติการส่ง ({logs.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {activeTab === 'settings' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div>
                  <div className="font-semibold text-emerald-950 text-xs">เปิดใช้งานระบบแจ้งเตือน LINE</div>
                  <div className="text-[11px] text-emerald-700">ส่งข้อความหาช่างทันทีที่มีการแจ้งหรือเปลี่ยนสถานะ</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06C755]"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LINE Notify Access Token
                </label>
                <input
                  type="text"
                  value={config.notifyToken}
                  onChange={(e) => setConfig({ ...config, notifyToken: e.target.value })}
                  placeholder="เช่น e3hJ8..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#06C755] focus:border-transparent outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 ออก Token จาก <span className="font-medium text-slate-700">notify-bot.line.me</span> แล้วดึงบอทเข้ากลุ่มไลน์ช่าง (ระบบมีโหมดจำลองแจ้งเตือนพร้อมใช้งานทันที)
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">เหตุการณ์ที่ต้องการให้แจ้งเตือน:</span>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoNotifyOnCreate}
                    onChange={(e) => setConfig({ ...config, autoNotifyOnCreate: e.target.checked })}
                    className="rounded text-[#06C755] focus:ring-[#06C755]"
                  />
                  <span>เมื่อมีใบแจ้งซ่อมใหม่ (New Ticket / Q-Number)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoNotifyOnStatusChange}
                    onChange={(e) => setConfig({ ...config, autoNotifyOnStatusChange: e.target.checked })}
                    className="rounded text-[#06C755] focus:ring-[#06C755]"
                  />
                  <span>เมื่อมีการเปลี่ยนสถานะงาน (กำลังซ่อม, รออะไหล่, คิวถัดไป, ช่างไม่ว่าง)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoNotifyOnClose}
                    onChange={(e) => setConfig({ ...config, autoNotifyOnClose: e.target.checked })}
                    className="rounded text-[#06C755] focus:ring-[#06C755]"
                  />
                  <span>เมื่อช่างสรุปงานและปิดใบแจ้งซ่อมสำเร็จ (Closed Ticket)</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-xs rounded-xl shadow-sm transition active:scale-95"
                >
                  {saveSuccess ? '✓ บันทึกเรียบร้อย' : 'บันทึกการตั้งค่า'}
                </button>
                <button
                  type="button"
                  onClick={handleSendTest}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  ทดสอบส่ง
                </button>
              </div>

              {testSent && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ส่งข้อความตัวอย่างเข้ากลุ่ม LINE และจำลองการแจ้งเตือนสำเร็จ!</span>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  ยังไม่มีประวัติการส่งแจ้งเตือน
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{log.ticketNumber}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString('th-TH')}</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed text-[11px]">
                      {log.message}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
