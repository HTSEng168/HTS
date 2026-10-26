import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Tag, 
  Share2, 
  Copy, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { RepairTicket, TicketStatus } from '../types';
import { STATUS_LABELS_TH, PRIORITY_LABELS_TH } from '../services/lineService';

interface TicketTrackerViewProps {
  tickets: RepairTicket[];
  selectedTicketId?: string;
  onSelectTicket: (ticketId: string) => void;
  onNavigateToHistory: () => void;
}

const STEP_STATUSES: { key: TicketStatus; label: string; desc: string }[] = [
  { key: 'PENDING', label: '1. รอดำเนินการ', desc: 'รับเรื่องเข้าคิวระบบ' },
  { key: 'NEXT_QUEUE', label: '2. คิวถัดไป', desc: 'เตรียมช่าง & เครื่องมือ' },
  { key: 'IN_PROGRESS', label: '3. กำลังซ่อม', desc: 'ช่างกำลังเข้าพื้นที่' },
  { key: 'COMPLETED', label: '4. ซ่อมเสร็จสิ้น', desc: 'ตรวจรับ & ปิดงาน' },
];

export const TicketTrackerView: React.FC<TicketTrackerViewProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onNavigateToHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Find currently selected ticket or default to the most active/latest
  const activeTicket = 
    tickets.find((t) => t.id === selectedTicketId) ||
    tickets.find((t) => t.status !== 'COMPLETED') ||
    tickets[0];

  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.ticketNumber.toLowerCase().includes(q) ||
      t.queueNumber.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.roomOrSpot.toLowerCase().includes(q) ||
      t.contactNumber.includes(q) ||
      t.requesterName.toLowerCase().includes(q)
    );
  });

  const handleCopyLink = () => {
    if (activeTicket) {
      const text = `ติดตามงานซ่อม [${activeTicket.queueNumber}] ${activeTicket.ticketNumber}: ${activeTicket.title} - สถานะ: ${STATUS_LABELS_TH[activeTicket.status].label}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getStatusStepIndex = (status: TicketStatus) => {
    if (status === 'PENDING') return 0;
    if (status === 'NEXT_QUEUE') return 1;
    if (status === 'IN_PROGRESS' || status === 'WAITING_PARTS' || status === 'TECH_BUSY') return 2;
    if (status === 'COMPLETED') return 3;
    return 0;
  };

  const currentStepIdx = activeTicket ? getStatusStepIndex(activeTicket.status) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search & Selector Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h2 className="font-bold text-slate-900 text-base">
                ช่องสถานะติดตามงานผ่านแอปพลิเคชัน
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ค้นหาด้วยหมายเลขแจ้งซ่อม, คิวงาน (Q-01), เบอร์โทรศัพท์ หรือเลขห้อง
            </p>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            ดูประวัติทั้งหมด &rarr;
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="พิมพ์ค้นหา เช่น Q-02, FIX-2026-002, แอร์ห้องเซิร์ฟเวอร์, 081-xxx..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Horizontal quick pill selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          {filteredTickets.slice(0, 8).map((ticket) => {
            const isSelected = activeTicket?.id === ticket.id;
            const statusConfig = STATUS_LABELS_TH[ticket.status];
            return (
              <button
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{ticket.queueNumber}</span>
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : statusConfig.badge}`} />
                <span className="truncate max-w-[120px]">{ticket.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Ticket Card */}
      {activeTicket ? (
        <div className="space-y-5">
          {/* Main Status & Queue Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-xs">
                    คิวงาน: {activeTicket.queueNumber}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    #{activeTicket.ticketNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      PRIORITY_LABELS_TH[activeTicket.urgency].color
                    }`}
                  >
                    ความเร่งด่วน: {PRIORITY_LABELS_TH[activeTicket.urgency].label}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {activeTicket.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {activeTicket.building} {activeTicket.floor} ({activeTicket.roomOrSpot})
                  </span>
                  {activeTicket.assetCode && (
                    <span className="flex items-center gap-1 font-mono text-blue-600 font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      {activeTicket.assetCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border font-bold text-xs ${
                    STATUS_LABELS_TH[activeTicket.status].color
                  }`}
                >
                  <span className="text-base">{STATUS_LABELS_TH[activeTicket.status].icon}</span>
                  <span>{STATUS_LABELS_TH[activeTicket.status].label}</span>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกข้อมูล</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Special Notice for Specific Statuses: WAITING_PARTS / TECH_BUSY */}
            {activeTicket.status === 'WAITING_PARTS' && (
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start gap-3">
                <span className="text-xl">📦</span>
                <div>
                  <div className="font-bold text-sm">สถานะ: รออะไหล่ซ่อมบำรุง</div>
                  <p className="mt-0.5 leading-relaxed text-orange-800">
                    {activeTicket.statusReason || 'กำลังรออะไหล่จากฝ่ายจัดซื้อและซัพพลายเออร์ เมื่อของถึงช่างจะเข้าดำเนินการทันที'}
                  </p>
                </div>
              </div>
            )}

            {activeTicket.status === 'TECH_BUSY' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">สถานะ: ช่างติดภารกิจด่วนอื่น (ช่างไม่ว่างชั่วคราว)</div>
                  <p className="mt-0.5 leading-relaxed text-rose-800">
                    {activeTicket.statusReason || 'ช่างกำลังปฏิบัติงานเคสวิกฤต/ฉุกเฉินในอาคารอื่น คาดว่าจะเข้าตรวจเช็คในลำดับถัดไป'}
                  </p>
                </div>
              </div>
            )}

            {/* Visual Timeline Steps */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-3">ลำดับสถานะการดำเนินงาน (Live Tracking Timeline)</div>
              <div className="relative">
                {/* Horizontal progress bar */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {STEP_STATUSES.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step.key} className="space-y-2 relative">
                        {/* Circle */}
                        <div
                          className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isPassed && !isCurrent ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-blue-700'
                                : isPassed
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </div>
                          <div className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Technician in charge & ETA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {/* Technician Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  ช่างผู้รับผิดชอบงานนี้
                </span>
                {activeTicket.assignedTechnician ? (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200">
                      <img
                        src={activeTicket.assignedTechnician.avatar}
                        alt="Tech"
                        className="w-full h-full object-cover object-[center_20%]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {activeTicket.assignedTechnician.name} ({activeTicket.assignedTechnician.nickname})
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {activeTicket.assignedTechnician.specialty}
                      </div>
                      <a
                        href={`tel:${activeTicket.assignedTechnician.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                      >
                        <Phone className="w-3 h-3" />
                        {activeTicket.assignedTechnician.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-2">
                    กำลังจัดสรรช่างซ่อมบำรุงที่เชี่ยวชาญ...
                  </div>
                )}
              </div>

              {/* ETA & Time info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  การประเมินเวลาเข้าซ่อม / เสร็จสิ้น
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">เวลาที่แจ้งเรื่อง:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(activeTicket.createdAt).toLocaleTimeString('th-TH')} น.
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ประมาณเวลาแล้วเสร็จ:</span>
                    <span className="font-bold text-blue-700">
                      {activeTicket.estimatedCompletionTime || 'ภายใน 1-2 ชั่วโมง'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">แผนกผู้แจ้ง:</span>
                    <span className="text-slate-700">{activeTicket.department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Photos */}
            {activeTicket.photoUrl && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  รูปถ่ายจุดชำรุด / เครื่องจักรที่แนบมา
                </span>
                <div className="max-w-xs rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={activeTicket.photoUrl}
                    alt="Damaged Asset"
                    className="w-full h-44 object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
          ไม่พบข้อมูลใบแจ้งซ่อมที่ระบุ
        </div>
      )}
    </div>
  );
};
