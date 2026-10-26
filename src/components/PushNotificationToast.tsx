import React, { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { PushNotificationPayload } from '../hooks/usePushNotifications';

interface LineAlertEventDetail {
  ticket: {
    id: string;
    ticketNumber: string;
    queueNumber: string;
    title: string;
    status: string;
    roomOrSpot: string;
  };
  log: {
    message: string;
    timestamp: string;
  };
  text: string;
}

interface PushNotificationToastProps {
  nativeNotification: PushNotificationPayload | null;
  onClearNative: () => void;
  onSelectTicket?: (ticketId: string) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  nativeNotification,
  onClearNative,
  onSelectTicket,
}) => {
  const [lineAlert, setLineAlert] = useState<LineAlertEventDetail | null>(null);

  useEffect(() => {
    const handleLineAlert = (e: Event) => {
      const customEvent = e as CustomEvent<LineAlertEventDetail>;
      if (customEvent.detail) {
        setLineAlert(customEvent.detail);
        // Auto dismiss after 7 seconds
        setTimeout(() => {
          setLineAlert(null);
        }, 7000);
      }
    };

    window.addEventListener('facilifix-line-alert', handleLineAlert);
    return () => {
      window.removeEventListener('facilifix-line-alert', handleLineAlert);
    };
  }, []);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 pointer-events-none space-y-2">
      {/* LINE Notification Banner */}
      {lineAlert && (
        <div className="pointer-events-auto bg-[#06C755] text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-400/40 animate-in slide-in-from-top-4 duration-300 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[#06C755] font-black text-xs">LINE</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                  LINE แจ้งเตือนช่าง • เดี๋ยวนี้
                </span>
                <button
                  onClick={() => setLineAlert(null)}
                  className="text-white/80 hover:text-white p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="font-bold text-xs truncate mt-0.5">
                {lineAlert.ticket.queueNumber} ({lineAlert.ticket.ticketNumber}): {lineAlert.ticket.title}
              </div>
              <p className="text-[11px] text-white/90 line-clamp-2 mt-0.5">
                📍 {lineAlert.ticket.roomOrSpot}
              </p>
              {onSelectTicket && (
                <button
                  onClick={() => {
                    onSelectTicket(lineAlert.ticket.id);
                    setLineAlert(null);
                  }}
                  className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#06C755] font-bold text-[10px] rounded-lg shadow-xs hover:bg-emerald-50 transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  เปิดดูสถานะงาน
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Push Notification Banner */}
      {nativeNotification && (
        <div className="pointer-events-auto bg-slate-900/95 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-sm">
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-400">
                  การแจ้งเตือนแบบพุช (Push Alert)
                </span>
                <button
                  onClick={onClearNative}
                  className="text-slate-400 hover:text-white p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="font-bold text-xs mt-0.5">{nativeNotification.title}</div>
              <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                {nativeNotification.body}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
