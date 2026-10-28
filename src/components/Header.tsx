import React from 'react';
import { 
  Wrench, 
  Bell, 
  MessageCircle, 
  UserCheck, 
  Layers,
  Sparkles,
  Settings
} from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';

interface HeaderProps {
  currentRole: 'USER' | 'TECH';
  onRoleChange: (role: 'USER' | 'TECH') => void;
  onOpenLineModal: () => void;
  pushPermission: NotificationPermission;
  onRequestPush: () => void;
  activeTicketCount: number;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenLineModal,
  pushPermission,
  onRequestPush,
  activeTicketCount,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-200/90 shadow-md shadow-slate-200/50 shrink-0">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_8e0ctt8e0ctt8e0c_f0f9bdaa.jpg"
              alt="Siri Laboratories Maintenance Engineering"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 font-['Prompt',sans-serif]">
                Siri Laboratories
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                PWA
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">
              Maintenance Engineering • จัดคิวงาน & แจ้งเตือน LINE
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Role Toggle Switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => onRoleChange('USER')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentRole === 'USER'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ผู้แจ้งซ่อม</span>
            </button>
            <button
              onClick={() => onRoleChange('TECH')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition relative cursor-pointer ${
                currentRole === 'TECH'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ช่างซ่อมบำรุง</span>
              {activeTicketCount > 0 && (
                <span className={`w-2 h-2 rounded-full ${currentRole === 'TECH' ? 'bg-amber-300' : 'bg-rose-500'} animate-ping`} />
              )}
            </button>
          </div>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition active:scale-95 cursor-pointer"
              title="ตั้งค่าทีมช่าง & รหัสผ่าน"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>
          )}

          {/* LINE Button */}
          <button
            onClick={onOpenLineModal}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#06C755] border border-emerald-200/80 transition active:scale-95 cursor-pointer relative"
            title="ตั้งค่าแจ้งเตือน LINE"
          >
            <MessageCircle className="w-4 h-4 fill-[#06C755]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </button>

          {/* Push Notifications Toggle */}
          {pushPermission !== 'granted' ? (
            <button
              onClick={onRequestPush}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition active:scale-95 cursor-pointer"
              title="เปิดแจ้งเตือนแบบพุช (Push Notifications)"
            >
              <Bell className="w-4 h-4" />
            </button>
          ) : (
            <div
              className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200"
              title="เปิดการแจ้งเตือนพุชแล้ว"
            >
              <Sparkles className="w-4 h-4" />
            </div>
          )}

          {/* PWA Install Button */}
          <PWAInstallModal />
        </div>
      </div>
    </header>
  );
};
