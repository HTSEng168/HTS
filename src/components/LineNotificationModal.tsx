import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  History, 
  MessageCircle, 
  Radio, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  QrCode, 
  Users, 
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Save,
  Database,
  ClipboardCheck
} from 'lucide-react';
import { storageService, DEFAULT_LINE_GROUP_ID } from '../services/storageService';
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
  const [activeTab, setActiveTab] = useState<'messaging_api' | 'guide' | 'logs'>('messaging_api');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [hasServerToken, setHasServerToken] = useState(false);
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [serverSaveMessage, setServerSaveMessage] = useState<string | null>(null);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string; botInfo?: any } | null>(null);

  // Test send state
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(storageService.getLineConfig());
      setLogs(storageService.getLineLogs());
      setVerifyResult(null);
      setTestResult(null);
      setServerSaveMessage(null);

      // Fetch persistent config from server
      storageService.syncLineConfigWithServer().then(({ config: syncedConfig, hasServerToken: serverHasIt }) => {
        setConfig(syncedConfig);
        setHasServerToken(serverHasIt);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingServer(true);
    storageService.saveLineConfig(config);
    
    // Save to persistent server storage
    const sResult = await storageService.saveTokenToServer(config.channelAccessToken, config.groupId);
    setIsSavingServer(false);

    if (sResult.success) {
      setHasServerToken(!!config.channelAccessToken);
      setSaveSuccess(true);
      setServerSaveMessage(sResult.message || 'บันทึกถาวรลงระบบเซิร์ฟเวอร์สำเร็จ');
      if (sResult.bot) {
        setVerifyResult({
          success: true,
          message: `เชื่อมต่อสำเร็จ! บอท ${sResult.bot.displayName || config.botName} (${sResult.bot.basicId || config.botBasicId}) พร้อมทำงาน`,
          botInfo: sResult.bot,
        });
      }
    } else {
      setSaveSuccess(true);
    }

    setTimeout(() => {
      setSaveSuccess(false);
      setServerSaveMessage(null);
    }, 4000);
  };

  const handleVerifyBot = async () => {
    if (!config.channelAccessToken.trim()) {
      setVerifyResult({
        success: false,
        message: 'กรุณากรอก Channel Access Token ก่อนทดสอบการเชื่อมต่อ',
      });
      return;
    }
    setIsVerifying(true);
    setVerifyResult(null);

    const result = await lineService.verifyBotConnection(config.channelAccessToken);
    setIsVerifying(false);

    if (result.success) {
      setVerifyResult({
        success: true,
        message: `เชื่อมต่อสำเร็จ! บอท ${result.bot?.displayName || config.botName} (${result.bot?.basicId || config.botBasicId}) พร้อมทำงาน`,
        botInfo: result.bot,
      });
    } else {
      setVerifyResult({
        success: false,
        message: result.error || 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบ Token อีกครั้ง',
      });
    }
  };

  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    // Auto save current config first
    storageService.saveLineConfig(config);

    const res = await lineService.sendTestNotification(config);
    setIsSendingTest(false);
    setTestResult(res);
    setLogs(storageService.getLineLogs());

    setTimeout(() => {
      setTestResult(null);
    }, 6000);
  };

  const copyBotId = () => {
    navigator.clipboard.writeText(config.botBasicId || '@073vezfu');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const cleaned = text.trim();
        setConfig(prev => ({ ...prev, channelAccessToken: cleaned }));
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#06C755] to-[#05A346] text-white p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-xs shrink-0 shadow-inner">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg leading-tight">LINE Messaging API</h2>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bot @073vezfu
                </span>
              </div>
              <p className="text-xs text-white/90">ส่งแจ้งเตือน Data งานซ่อม คิวงาน และรูปภาพแบบเรียลไทม์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('messaging_api')}
            className={`px-3 sm:px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'messaging_api'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            ตั้งค่า Messaging API
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 sm:px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            วิธีเปิดใช้งาน (@073vezfu)
          </button>
          <button
            onClick={() => {
              setLogs(storageService.getLineLogs());
              setActiveTab('logs');
            }}
            className={`px-3 sm:px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-sm bg-slate-50/50">
          {activeTab === 'messaging_api' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Bot Info Summary Card */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#06C755] font-bold">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">HTSengineering-BOT</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                        {config.botBasicId || '@073vezfu'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">บัญชีทางการ LINE Official Account สำหรับแจ้งเตือนช่าง</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={copyBotId}
                    className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition"
                    title="คัดลอก LINE ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'คัดลอกแล้ว' : 'คัดลอก ID'}</span>
                  </button>
                  <a
                    href="https://line.me/R/ti/p/@073vezfu"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 text-xs bg-[#06C755]/10 hover:bg-[#06C755]/20 text-[#06C755] font-medium rounded-lg flex items-center gap-1 transition"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>เพิ่มเพื่อน</span>
                  </a>
                </div>
              </div>

              {/* Master Enable Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">เปิดระบบแจ้งเตือน LINE Messaging API</div>
                  <div className="text-[11px] text-slate-500">
                    ส่งข้อมูลแจ้งซ่อมใหม่, การรับงานของช่างทูและช่างต๊ะ, และการปิดงานแบบเรียลไทม์
                  </div>
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

              {/* Channel Access Token Input & Server Persistence */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                {/* Server persistence status banner */}
                {hasServerToken || config.channelAccessToken ? (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#06C755] text-white flex items-center justify-center font-bold shrink-0">
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>บันทึกโทเคนถาวรลงระบบแล้ว (Server-Stored)</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            ✓ ไม่ต้องกรอกซ้ำ
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700">
                          ส่งข้อความเข้ากลุ่ม LINE ({config.groupId || DEFAULT_LINE_GROUP_ID}) ได้ตลอดเวลา ทุกเครื่องใช้งานได้ทันที
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">ยังไม่ได้บันทึก Channel Access Token ลงเซิร์ฟเวอร์</span>
                      <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                        วาง Long-lived Token จาก LINE Developers ด้านล่างนี้ แล้วกดปุ่ม <strong>"💾 บันทึกถาวรลงระบบ"</strong> เพื่อให้ระบบจำไว้ตลอดไป
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Channel Access Token (Long-lived) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={pasteFromClipboard}
                      className="text-[11px] text-[#06C755] hover:text-[#05A346] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-emerald-50 transition cursor-pointer"
                      title="วางจากคลิปบอร์ด"
                    >
                      <ClipboardCheck className="w-3 h-3" />
                      <span>วางจากคลิปบอร์ด</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showToken ? 'ซ่อน' : 'แสดง'}</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.channelAccessToken}
                    onChange={(e) => setConfig({ ...config, channelAccessToken: e.target.value })}
                    placeholder="วาง Channel Access Token จาก LINE Developers Console ที่นี่..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#06C755] focus:border-transparent outline-none pr-10"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-slate-500">
                    💡 โทเคนระยะยาวจาก LINE Developers Console (แท็บ Messaging API ด้านล่างสุด)
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleVerifyBot}
                      disabled={isVerifying || !config.channelAccessToken}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                      <span>{isVerifying ? 'กำลังตรวจ...' : 'ตรวจการเชื่อมต่อ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave()}
                      disabled={isSavingServer || !config.channelAccessToken}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
                    >
                      <Save className={`w-3 h-3 ${isSavingServer ? 'animate-spin' : ''}`} />
                      <span>{isSavingServer ? 'กำลังบันทึก...' : '💾 บันทึกถาวรลงระบบ'}</span>
                    </button>
                  </div>
                </div>

                {serverSaveMessage && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#06C755] shrink-0" />
                    <span>{serverSaveMessage}</span>
                  </div>
                )}

                {verifyResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      verifyResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {verifyResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{verifyResult.message}</span>
                  </div>
                )}
              </div>

              {/* Delivery Mode Selection */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    รูปแบบการส่งแจ้งเตือน (Send Mode)
                  </label>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#06C755]" />
                    ค่าเริ่มต้น: กลุ่ม LINE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Option 1: LINE Group (Default) */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between sm:col-span-2 ${
                      config.sendMode === 'group'
                        ? 'border-[#06C755] bg-emerald-50/50 text-[#06C755] ring-2 ring-[#06C755]/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sendMode"
                          checked={config.sendMode === 'group'}
                          onChange={() => setConfig({ ...config, sendMode: 'group', groupId: config.groupId || DEFAULT_LINE_GROUP_ID })}
                          className="text-[#06C755] focus:ring-[#06C755]"
                        />
                        <span className="font-bold text-xs sm:text-sm">👥 ส่งเข้ากลุ่ม LINE (Group ID) [ค่าเริ่มต้น]</span>
                      </div>
                      <span className="text-[10px] bg-[#06C755] text-white px-2 py-0.5 rounded-full font-bold">
                        แนะนำสำหรับทีมช่าง
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 mt-1 pl-6">
                      ส่งข้อมูลงานซ่อม คิวงาน และสถานะเข้ากลุ่มช่างโดยตรงผ่าน Group ID: <span className="font-mono font-bold text-[#06C755]">{config.groupId || DEFAULT_LINE_GROUP_ID}</span>
                    </span>
                  </label>

                  {/* Option 2: Broadcast */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      config.sendMode === 'broadcast'
                        ? 'border-[#06C755] bg-emerald-50/50 text-[#06C755]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sendMode"
                        checked={config.sendMode === 'broadcast'}
                        onChange={() => setConfig({ ...config, sendMode: 'broadcast' })}
                        className="text-[#06C755] focus:ring-[#06C755]"
                      />
                      <span className="font-bold text-xs">Broadcast (ทุกคนที่แอดบอท)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 pl-6">
                      ส่งหาทุกคนที่เพิ่มเพื่อนบอท @073vezfu
                    </span>
                  </label>

                  {/* Option 3: Individual Push */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      config.sendMode === 'push'
                        ? 'border-[#06C755] bg-emerald-50/50 text-[#06C755]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sendMode"
                        checked={config.sendMode === 'push'}
                        onChange={() => setConfig({ ...config, sendMode: 'push' })}
                        className="text-[#06C755] focus:ring-[#06C755]"
                      />
                      <span className="font-bold text-xs">ระบุ Target ID อิสระ</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 pl-6">
                      ระบุ User ID (U...) หรือ Group ID อื่น
                    </span>
                  </label>
                </div>

                {/* Group ID Configuration Section */}
                {config.sendMode === 'group' && (
                  <div className="pt-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200 animate-in fade-in space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-800">
                        LINE Group ID สำหรับรับแจ้งเตือน
                      </label>
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, groupId: DEFAULT_LINE_GROUP_ID, defaultTargetId: DEFAULT_LINE_GROUP_ID })}
                        className="text-[10px] text-[#06C755] hover:underline font-semibold"
                      >
                        รีเซ็ตเป็นค่าเริ่มต้น ({DEFAULT_LINE_GROUP_ID})
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={config.groupId || DEFAULT_LINE_GROUP_ID}
                        onChange={(e) => setConfig({ ...config, groupId: e.target.value.trim(), defaultTargetId: e.target.value.trim() })}
                        placeholder={DEFAULT_LINE_GROUP_ID}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#06C755] outline-none"
                      />
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">สำคัญมาก:</span> ต้องเชิญบอท <span className="font-bold">@073vezfu (HTSengineering-BOT)</span> เข้ากลุ่มไลน์นี้ด้วย ระบบจึงจะสามารถยิงข้อความ Push เข้ากลุ่มได้
                      </div>
                    </div>
                  </div>
                )}

                {config.sendMode === 'push' && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target User ID หรือ Group ID (ขึ้นต้นด้วย U หรือ C)
                    </label>
                    <input
                      type="text"
                      value={config.defaultTargetId}
                      onChange={(e) => setConfig({ ...config, defaultTargetId: e.target.value })}
                      placeholder="เช่น U4af4980629... หรือ Ca6908..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#06C755] outline-none"
                    />
                  </div>
                )}

                {config.sendMode === 'technician_target' && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        LINE User ID ช่างทู (นายธวัช)
                      </label>
                      <input
                        type="text"
                        value={config.tech1LineId || ''}
                        onChange={(e) => setConfig({ ...config, tech1LineId: e.target.value })}
                        placeholder="U..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#06C755] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        LINE User ID ช่างต๊ะ (นายธนพนธ์)
                      </label>
                      <input
                        type="text"
                        value={config.tech2LineId || ''}
                        onChange={(e) => setConfig({ ...config, tech2LineId: e.target.value })}
                        placeholder="U..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#06C755] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Flex Message Format Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">ส่งการ์ด Flex Message แบบสวยงาม</div>
                    <div className="text-[11px] text-slate-500">แสดงการ์ดสีพร้อมตราสัญลักษณ์ Siri Maintenance, โลเคชั่น, ป้ายเร่งด่วน และเบอร์โทรช่าง</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useFlexMessage}
                    onChange={(e) => setConfig({ ...config, useFlexMessage: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#06C755]"></div>
                </label>
              </div>

              {/* Event Triggers */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-800">ส่งแจ้งเตือนในกรณีใดบ้าง:</span>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoNotifyOnCreate}
                      onChange={(e) => setConfig({ ...config, autoNotifyOnCreate: e.target.checked })}
                      className="rounded text-[#06C755] focus:ring-[#06C755]"
                    />
                    <span>เมื่อมีใบแจ้งซ่อมใหม่ (New Ticket / คิวงาน Q-XX)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoNotifyOnStatusChange}
                      onChange={(e) => setConfig({ ...config, autoNotifyOnStatusChange: e.target.checked })}
                      className="rounded text-[#06C755] focus:ring-[#06C755]"
                    />
                    <span>เมื่อมีการเปลี่ยนสถานะงาน (กำลังซ่อม, รออะไหล่, คิวถัดไป, ช่างไม่ว่าง)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoNotifyOnClose}
                      onChange={(e) => setConfig({ ...config, autoNotifyOnClose: e.target.checked })}
                      className="rounded text-[#06C755] focus:ring-[#06C755]"
                    />
                    <span>เมื่อช่างสรุปงานและปิดใบแจ้งซ่อมสำเร็จ พร้อมบันทึกค่าใช้จ่าย</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={isSavingServer}
                  className="flex-1 py-2.5 bg-[#06C755] hover:bg-[#05b34c] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSavingServer 
                      ? 'กำลังบันทึกลงเซิร์ฟเวอร์...' 
                      : saveSuccess 
                      ? '✓ บันทึกถาวรลงระบบสำเร็จแล้ว' 
                      : '💾 บันทึกถาวรลงระบบ (จำค่าตลอดไป)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
                  <span>
                    {isSendingTest 
                      ? 'กำลังส่งทดสอบ...' 
                      : config.sendMode === 'group' 
                      ? 'ส่งการ์ดทดสอบเข้ากลุ่ม LINE' 
                      : 'ส่งการ์ดทดสอบเข้า LINE'}
                  </span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </form>
          )}

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-[#06C755]">
                  <span>📋</span>
                  <span>คำแนะนำวิธีเปิดใช้งานตามหน้าจอของคุณ (HTSengineering-BOT)</span>
                </div>
                <p className="leading-relaxed">
                  จากภาพหน้าจอที่คุณเปิดอยู่ใน <span className="font-bold">LINE Official Account Manager</span> (@073vezfu) ทำตาม 4 ขั้นตอนนี้เพื่อเริ่มรับส่ง Data แจ้งซ่อม:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      กดปุ่มสีเขียว "ใช้ Messaging API"
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      ในหน้าจอเบราว์เซอร์ของคุณที่เปิดค้างอยู่ ให้คลิกปุ่มสีเขียว <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">ใช้ Messaging API</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      ระบุชื่อผู้ให้บริการ (Provider Name)
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      ระบบจะให้ใส่ชื่อ Provider เช่น พิมพ์คำว่า <span className="font-mono bg-slate-100 px-1 rounded text-slate-900 font-semibold">Siri Maintenance</span> หรือ <span className="font-mono bg-slate-100 px-1 rounded text-slate-900 font-semibold">HTS Engineering</span> แล้วกดยืนยัน
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      ออก Channel Access Token (Long-lived)
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      กดลิงก์ไปยัง <a href="https://developers.line.biz/console/" target="_blank" rel="noreferrer" className="text-[#06C755] font-semibold underline inline-flex items-center gap-0.5">LINE Developers Console <ExternalLink className="w-2.5 h-2.5" /></a>
                      <br />• เลือก Channel: <b>HTSengineering-BOT</b>
                      <br />• ไปที่แท็บ <b>Messaging API</b>
                      <br />• เลื่อนลงไปล่างสุดที่หัวข้อ <b>Channel access token</b> กดปุ่ม <b>Issue</b> (ออกโทเคน)
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      คัดลอก Token มาใส่ในแอปนี้
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      นำ Token ยาวๆ ที่ได้ มาวางในช่อง Channel Access Token ในแท็บ "ตั้งค่า Messaging API" แล้วกดบันทึกและกดทดสอบส่งได้ทันที!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    5
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      เชิญบอท @073vezfu เข้ากลุ่ม LINE (Group ID: C2f466a90ac4f15b1f9231c889e23d3d7)
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      เข้าไปในกลุ่ม LINE ของช่าง กด <b>เชิญเพื่อน (Invite)</b> แล้วค้นหาหรือเลือกบอท <b>@073vezfu (HTSengineering-BOT)</b> เข้ากลุ่ม เมื่อมีใบแจ้งซ่อมใหม่ การรับงาน หรือการปิดงาน ระบบจะส่ง Flex Message เข้ากลุ่มนี้ทันที
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code add bot friend */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-2">
                <div className="font-bold text-xs text-slate-800">
                  📱 ให้ช่างทู, ช่างต๊ะ และผู้เกี่ยวข้องเพิ่มเพื่อนบอทไว้:
                </div>
                <div className="inline-block p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://line.me/R/ti/p/@073vezfu')}`}
                    alt="LINE QR Code @073vezfu"
                    className="w-32 h-32 mx-auto"
                  />
                  <div className="text-[11px] font-mono font-bold text-slate-700 mt-1">@073vezfu</div>
                </div>
                <div>
                  <a
                    href="https://line.me/R/ti/p/@073vezfu"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    <span>คลิกเพื่อเพิ่มเพื่อน @073vezfu ใน LINE</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>ประวัติข้อความและ Data ล่าสุด ({logs.length} รายการ)</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('siri_fix_line_logs_v1');
                    setLogs([]);
                  }}
                  className="text-rose-600 hover:text-rose-700 text-[11px] cursor-pointer"
                >
                  ล้างประวัติ
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
                  ยังไม่มีประวัติการส่งแจ้งเตือน
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.ticketNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.status === 'SENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.status === 'SENT' ? '✓ ส่งจริงสำเร็จ' : '⚡ โหมดจำลอง'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <b>ผู้รับ:</b> {log.recipient}
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed text-[11px]">
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
