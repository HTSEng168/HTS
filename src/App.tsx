import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusCircle, 
  Search, 
  History, 
  LayoutDashboard, 
  Wrench,
  RotateCcw
} from 'lucide-react';

import { RepairTicket, Technician, TicketStatus, SparePartItem } from './types';
import { storageService } from './services/storageService';
import { lineService, STATUS_LABELS_TH } from './services/lineService';
import { usePushNotifications } from './hooks/usePushNotifications';

import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { PushNotificationToast } from './components/PushNotificationToast';
import { LineNotificationModal } from './components/LineNotificationModal';
import { TicketSubmissionForm } from './components/TicketSubmissionForm';
import { TicketTrackerView } from './components/TicketTrackerView';
import { TicketHistoryView } from './components/TicketHistoryView';
import { DashboardView } from './components/DashboardView';
import { TechnicianPortal } from './components/TechnicianPortal';
import { TechnicianSettingsModal } from './components/TechnicianSettingsModal';

export default function App() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('SUBMIT');
  const [currentRole, setCurrentRole] = useState<'USER' | 'TECH'>('USER');
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>();
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Push notifications hook
  const { 
    permission: pushPermission, 
    requestPermission: handleRequestPush, 
    triggerNotification, 
    lastNotification, 
    clearLastNotification 
  } = usePushNotifications();

  // Load initial data
  useEffect(() => {
    setTickets(storageService.getTickets());
    setTechnicians(storageService.getTechnicians());
  }, []);

  // Sync tickets changes to storage
  const updateTicketsState = useCallback((newTickets: RepairTicket[]) => {
    setTickets(newTickets);
    storageService.saveTickets(newTickets);
  }, []);

  // Handle switching role
  const handleRoleChange = (role: 'USER' | 'TECH') => {
    setCurrentRole(role);
    if (role === 'TECH') {
      setActiveTab('TECH_PORTAL');
    } else {
      if (activeTab === 'TECH_PORTAL') {
        setActiveTab('SUBMIT');
      }
    }
  };

  // 1. Submit Ticket (หน้าที่ 1 ข้อ 1, 2, 3)
  const handleCreateTicket = (
    data: Omit<RepairTicket, 'id' | 'ticketNumber' | 'queueNumber' | 'createdAt' | 'status'>
  ) => {
    const nextIndex = tickets.length + 1;
    const paddedNum = String(nextIndex).padStart(3, '0');
    const queueNum = `Q-${String(nextIndex).padStart(2, '0')}`;
    const ticketNum = `FIX-2026-${paddedNum}`;

    const newTicket: RepairTicket = {
      ...data,
      id: 'ticket-' + Date.now(),
      ticketNumber: ticketNum,
      queueNumber: queueNum,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      statusReason: 'บันทึกเข้าระบบแล้ว กำลังรอช่างรับงานตามลำดับคิว',
    };

    const updatedList = [newTicket, ...tickets];
    updateTicketsState(updatedList);
    setSelectedTicketId(newTicket.id);

    // Send LINE Notification
    lineService.sendNotification(newTicket, 'NEW');

    // Trigger In-App Push Notification & Sound
    triggerNotification({
      title: `🚨 รับแจ้งซ่อมใหม่: ${queueNum} (${newTicket.title})`,
      body: `สถานที่: ${newTicket.roomOrSpot} • ผู้แจ้ง: ${newTicket.requesterName} (${newTicket.department})`,
    });

    return newTicket;
  };

  // 2. Update Status (คิวถัดไป, กำลังซ่อม, รออะไหล่, ช่างไม่ว่าง)
  const handleUpdateStatus = (ticketId: string, status: TicketStatus, reason?: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          statusReason: reason || t.statusReason,
        };
      }
      return t;
    });

    updateTicketsState(updated);

    const changedTicket = updated.find((t) => t.id === ticketId);
    if (changedTicket) {
      // Send LINE notification
      lineService.sendNotification(changedTicket, 'STATUS_CHANGE');

      // Trigger Push notification
      triggerNotification({
        title: `📢 อัปเดตสถานะงาน: ${changedTicket.queueNumber}`,
        body: `สถานะใหม่: ${STATUS_LABELS_TH[status].label} (${changedTicket.title})`,
      });
    }
  };

  // 3. Close Ticket (หน้าที่ 2 สรุปงานและปิดใบแจ้งซ่อม)
  const handleCloseTicket = (
    ticketId: string,
    closureData: {
      repairNotes: string;
      partsUsed: SparePartItem[];
      totalCost: number;
      afterPhotoUrl?: string;
      signatureUrl?: string;
    }
  ) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'COMPLETED' as TicketStatus,
          statusReason: 'ซ่อมแซมและตรวจรับงานเรียบร้อยแล้ว',
          repairNotes: closureData.repairNotes,
          partsUsed: closureData.partsUsed,
          totalCost: closureData.totalCost,
          afterPhotoUrl: closureData.afterPhotoUrl,
          signatureUrl: closureData.signatureUrl,
          completedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    updateTicketsState(updated);

    const closedTicket = updated.find((t) => t.id === ticketId);
    if (closedTicket) {
      // Send LINE notification
      lineService.sendNotification(closedTicket, 'CLOSED');

      // Trigger Push notification
      triggerNotification({
        title: `✅ ปิดใบแจ้งซ่อมสำเร็จ: ${closedTicket.queueNumber}`,
        body: `ช่างซ่อมเสร็จสิ้น: ${closedTicket.title} • ค่าอะไหล่รวม ${closureData.totalCost.toLocaleString()} บาท`,
      });
    }
  };

  // 4. Update Satisfaction Rating
  const handleUpdateRating = (ticketId: string, rating: number, comment: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          satisfactionRating: rating,
          satisfactionComment: comment,
        };
      }
      return t;
    });
    updateTicketsState(updated);
  };

  // Quick navigation helpers
  const handleNavigateToTrack = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setActiveTab('TRACK');
  };

  const handleResetData = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      storageService.resetToDefault();
      setTickets(storageService.getTickets());
      setTechnicians(storageService.getTechnicians());
    }
  };

  const pendingCount = tickets.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Floating Push & LINE Toast Banners */}
      <PushNotificationToast
        nativeNotification={lastNotification}
        onClearNative={clearLastNotification}
        onSelectTicket={(ticketId) => {
          setSelectedTicketId(ticketId);
          setActiveTab('TRACK');
        }}
      />

      {/* App Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenLineModal={() => setIsLineModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        pushPermission={pushPermission}
        onRequestPush={handleRequestPush}
        activeTicketCount={pendingCount}
      />

      {/* Desktop Tab Bar Navigation */}
      <nav className="bg-white border-b border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('SUBMIT')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'SUBMIT'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>หน้าที่ 1: แบบฟอร์มแจ้งซ่อม</span>
            </button>

            <button
              onClick={() => setActiveTab('TRACK')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'TRACK'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>ข้อ 4: ช่องติดตามสถานะงาน</span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>ข้อ 5: ประวัติการแจ้งซ่อม</span>
            </button>

            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>แดชบอร์ดสรุป & จอคิวเรียลไทม์</span>
            </button>

            <button
              onClick={() => {
                setCurrentRole('TECH');
                setActiveTab('TECH_PORTAL');
              }}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer relative ${
                activeTab === 'TECH_PORTAL'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                  : 'border-transparent text-indigo-600 hover:text-indigo-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>หน้าที่ 2: ช่างสรุปงาน & ปิดใบแจ้งซ่อม</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleResetData}
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition cursor-pointer"
            title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ตข้อมูลตัวอย่าง</span>
          </button>
        </div>
      </nav>

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12">
        {activeTab === 'SUBMIT' && (
          <TicketSubmissionForm
            onSubmitTicket={handleCreateTicket}
            onNavigateToTrack={handleNavigateToTrack}
          />
        )}

        {activeTab === 'TRACK' && (
          <TicketTrackerView
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onNavigateToHistory={() => setActiveTab('HISTORY')}
          />
        )}

        {activeTab === 'HISTORY' && (
          <TicketHistoryView
            tickets={tickets}
            onSelectTicket={handleNavigateToTrack}
            onUpdateRating={handleUpdateRating}
          />
        )}

        {activeTab === 'DASHBOARD' && (
          <DashboardView
            tickets={tickets}
            technicians={technicians}
            onSelectTicket={handleNavigateToTrack}
            onNavigateToSubmit={() => setActiveTab('SUBMIT')}
          />
        )}

        {activeTab === 'TECH_PORTAL' && (
          <TechnicianPortal
            tickets={tickets}
            technicians={technicians}
            onUpdateStatus={handleUpdateStatus}
            onCloseTicket={handleCloseTicket}
            onSelectTicket={handleNavigateToTrack}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'TECH_PORTAL') {
            setCurrentRole('TECH');
          }
        }}
        pendingCount={pendingCount}
      />

      {/* LINE Notification Settings & Log Modal */}
      <LineNotificationModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
      />

      {/* Technician Team & Security Settings Modal */}
      <TechnicianSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        technicians={technicians}
        onTechniciansChange={(updated) => setTechnicians(updated)}
      />
    </div>
  );
}
