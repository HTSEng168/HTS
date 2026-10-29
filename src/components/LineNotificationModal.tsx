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
                  {config.botName || 'HTS-BOT'} ({config.botBasicId || '@985anugd'})
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
            วิธีเปิดใช้งาน ({config.botBasicId || '@985anugd'})
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
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{config.botName || 'HTS-BOT'}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                        {config.botBasicId || '@985anugd'}
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
                    href={`https://line.me/R/ti/p/${config.botBasicId || '@985anugd'}`}
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

              {/* System Locked Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 shadow-xs space-y-1.5 text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#06C755] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span>ระบบฝังค่าถาวรในตัวแอปแล้ว (Locked in Application)</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                        🔒 ล็อคพร้อมใช้งาน
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Channel Access Token และ Group ID ถูกเขียนฝังลงในโค้ดตัวแอปถาวรแล้ว ทุกคนที่เปิดแอปนี้จากเครื่องใดก็ตาม สามารถรับส่งข้อมูลแจ้งซ่อมเข้ากลุ่มไลน์ได้ทันที 100% โดยไม่ต้องตั้งค่าใดๆ อีก
                    </p>
                  </div>
                </div>
              </div>

              {/* Channel Access Token Card (Locked) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Channel Access Token (Long-lived)
                    </label>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      🔒 ฝังถาวรในแอป
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium text-slate-700 outline-none pr-10 cursor-not-allowed select-all"
                  />
                  <Key className="w-4 h-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#06C755]" />
                    <span>เชื่อมต่อกับบอท <strong>{config.botName || 'HTS-BOT'}</strong> ({config.botBasicId || '@985anugd'}) สำเร็จ</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleVerifyBot}
                    disabled={isVerifying}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isVerifying ? 'กำลังตรวจ...' : 'ตรวจเช็ค Token'}</span>
                  </button>
                </div>

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

              {/* Group ID Configuration Section (Locked) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      LINE Group ID เป้าหมายสำหรับรับแจ้งเตือน
                    </label>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      🔒 กลุ่มหลักฝังในแอป
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    ✓ ค่าเริ่มต้นถาวร
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={config.groupId || DEFAULT_LINE_GROUP_ID}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 outline-none pr-10 cursor-not-allowed select-all"
                  />
                  <Users className="w-4 h-4 text-blue-600 absolute right-3 top-3 pointer-events-none" />
                </div>

                <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-base leading-none">💡</span>
                  <div>
                    <span>ข้อมูลงานซ่อมทั้งหมดจะถูกยิงเข้ากลุ่มไลน์ ID: </span>
                    <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-300">{config.groupId || DEFAULT_LINE_GROUP_ID}</strong>
                    <span> โดยอัตโนมัติ (อย่าลืมเชิญบอท <strong>{config.botBasicId || '@985anugd'}</strong> เข้ากลุ่ม)</span>
                  </div>
                </div>
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
                <span className="text-xs font-bold text-slate-800">ส่งแจ้งเตือนเข้ากลุ่มอัตโนมัติในกรณีใดบ้าง:</span>
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
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  className="flex-1 py-3 bg-[#06C755] hover:bg-[#05b34c] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <Send className={`w-4 h-4 ${isSendingTest ? 'animate-pulse' : ''}`} />
                  <span>
                    {isSendingTest 
                      ? 'กำลังส่งการ์ดทดสอบเข้ากลุ่ม LINE...' 
                      : '🚀 ทดสอบส่งการ์ดแจ้งเตือนเข้ากลุ่ม LINE'}
                  </span>
                </button>
                <div className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs flex items-center justify-center gap-1.5 font-medium border border-slate-200 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🔒 ฝังค่าล็อคในระบบแล้ว</span>
                </div>
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
                  <span>คำแนะนำวิธีเปิดใช้งาน ({config.botName || 'HTS-BOT'} {config.botBasicId || '@985anugd'})</span>
                </div>
                <p className="leading-relaxed">
                  เชื่อมต่อกับบอท <span className="font-bold">{config.botName || 'HTS-BOT'}</span> ({config.botBasicId || '@985anugd'}) และส่ง Data แจ้งซ่อมเข้ากลุ่ม ID: <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono font-bold">{config.groupId || DEFAULT_LINE_GROUP_ID}</code> อัตโนมัติ:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      บันทึก Channel Access Token (Long-lived) ในระบบเรียบร้อย
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      ระบบได้บันทึก Access Token ระยะยาวของคุณลงระบบเซิร์ฟเวอร์แบบถาวรแล้ว ไม่ต้องกังวลเรื่องโทเคนหายเมื่อรีเฟรชหน้าเว็บ
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      เชิญบอท {config.botBasicId || '@985anugd'} ({config.botName || 'HTS-BOT'}) เข้ากลุ่ม LINE
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      เข้าไปในกลุ่ม LINE ที่มีช่างทูและช่างต๊ะอยู่ (Group ID: <code className="font-mono bg-slate-100 px-1 rounded font-bold">{config.groupId || DEFAULT_LINE_GROUP_ID}</code>) กด <b>เชิญเพื่อน (Invite)</b> แล้วค้นหาบอท <b>{config.botBasicId || '@985anugd'}</b> เข้ากลุ่ม เพื่อให้บอทส่งข้อความแจ้งเตือนเข้ากลุ่มได้
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs">
                      ส่งข้อมูลงานซ่อมและรูปภาพแบบอัตโนมัติ
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      เมื่อมีการเปิดใบแจ้งซ่อมใหม่, การเปลี่ยนสถานะงานของช่าง, หรือการปิดงานซ่อม ระบบจะส่ง Flex Message การ์ดสีสวยงามเข้ากลุ่มโดยตรง
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code add bot friend */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-2">
                <div className="font-bold text-xs text-slate-800">
                  📱 ให้ช่างทู, ช่างต๊ะ และผู้เกี่ยวข้องเพิ่มเพื่อนบอท {config.botName || 'HTS-BOT'} ไว้:
                </div>
                <div className="inline-block p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://line.me/R/ti/p/${config.botBasicId || '@985anugd'}`)}`}
                    alt={`LINE QR Code ${config.botBasicId || '@985anugd'}`}
                    className="w-32 h-32 mx-auto"
                  />
                  <div className="text-[11px] font-mono font-bold text-slate-700 mt-1">{config.botBasicId || '@985anugd'}</div>
                </div>
                <div>
                  <a
                    href={`https://line.me/R/ti/p/${config.botBasicId || '@985anugd'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    <span>คลิกเพื่อเพิ่มเพื่อน {config.botBasicId || '@985anugd'} ใน LINE</span>
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
