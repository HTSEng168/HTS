import React, { useState } from 'react';
import { Download, Share2, PlusSquare, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallModal: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
        title="ติดตั้งแอพลงเครื่อง (รองรับ iOS & Android)"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">ติดตั้งลงเครื่อง</span>
        <span className="sm:hidden">ติดตั้งแอป</span>
      </button>

      {/* iOS & General Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md shrink-0">
                  <img
                    src="/assets/aistudio/Image_October_26__2026_-_9_27PM_a487d852"
                    alt="Siri Maintenance"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">ติดตั้ง Siri Maintenance</h3>
                  <p className="text-xs text-slate-500">Siri Maintenance & Engineering (iOS & Android)</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs text-slate-700">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-600" />
                วิธีติดตั้งสำหรับ iPhone / iPad (iOS):
              </div>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1">
                <li>เปิดหน้านี้ด้วยเบราว์เซอร์ <strong>Safari</strong></li>
                <li>
                  แตะที่ปุ่ม <strong>แชร์ (Share)</strong>{' '}
                  <span className="inline-block p-1 bg-slate-200 rounded">
                    <Share2 className="w-3 h-3 inline text-slate-700" />
                  </span>{' '}
                  ที่แถบล่างสุด
                </li>
                <li>
                  เลื่อนหาแล้วแตะ <strong>&ldquo;เพิ่มไปยังหน้าจอโฮม&rdquo;</strong> (Add to Home Screen)
                  <span className="inline-block p-1 bg-slate-200 rounded ml-1">
                    <PlusSquare className="w-3 h-3 inline text-slate-700" />
                  </span>
                </li>
                <li>กด <strong>เพิ่ม (Add)</strong> เพื่อเริ่มใช้งาน</li>
              </ol>

              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                🤖 สำหรับ Android หรือคอมพิวเตอร์: ให้กดปุ่ม &ldquo;ติดตั้ง&rdquo; ที่แถบ URL ด้านบน หรือกดเมนู 3 จุด &gt; เพิ่มลงในหน้าจอหลัก
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* Success banner if chromium auto installed */}
      {installSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>ติดตั้งแอปพลิเคชันเรียบร้อยแล้ว!</span>
        </div>
      )}
    </>
  );
};
