import React from 'react';
import { 
  PlusCircle, 
  Search, 
  History, 
  LayoutDashboard, 
  Wrench 
} from 'lucide-react';

export type ActiveTab = 'SUBMIT' | 'TRACK' | 'HISTORY' | 'DASHBOARD' | 'TECH_PORTAL';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
}) => {
  const tabs = [
    {
      id: 'SUBMIT' as ActiveTab,
      label: '1. แจ้งซ่อม',
      icon: PlusCircle,
      badge: null,
    },
    {
      id: 'TRACK' as ActiveTab,
      label: '4. ติดตามงาน',
      icon: Search,
      badge: null,
    },
    {
      id: 'HISTORY' as ActiveTab,
      label: '5. ประวัติซ่อม',
      icon: History,
      badge: null,
    },
    {
      id: 'DASHBOARD' as ActiveTab,
      label: 'แดชบอร์ด/คิว',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'TECH_PORTAL' as ActiveTab,
      label: '2. ช่างปิดงาน',
      icon: Wrench,
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 pb-safe md:hidden shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center relative cursor-pointer transition ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full px-0.5">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
