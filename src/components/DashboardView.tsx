import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Users, 
  Radio
} from 'lucide-react';
import { RepairTicket, Technician } from '../types';
import { STATUS_LABELS_TH, PRIORITY_LABELS_TH } from '../services/lineService';

interface DashboardViewProps {
  tickets: RepairTicket[];
  technicians: Technician[];
  onSelectTicket: (ticketId: string) => void;
  onNavigateToSubmit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  technicians,
  onSelectTicket,
  onNavigateToSubmit,
}) => {
  const [filterDept, setFilterDept] = useState<string>('ALL');

  // Stats calculation
  const totalTickets = tickets.length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');
  const nextQueueTickets = tickets.filter((t) => t.status === 'NEXT_QUEUE');
  const waitingPartsTickets = tickets.filter((t) => t.status === 'WAITING_PARTS');
  const techBusyTickets = tickets.filter((t) => t.status === 'TECH_BUSY');
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING');
  const completedTickets = tickets.filter((t) => t.status === 'COMPLETED');

  const completionRate = totalTickets > 0 ? Math.round((completedTickets.length / totalTickets) * 100) : 0;

  const departments = Array.from(new Set(tickets.map((t) => t.department)));

  const displayTickets = filterDept === 'ALL' 
    ? tickets 
    : tickets.filter((t) => t.department === filterDept);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Monitor Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                LIVE MONITOR BOARD • อัปเดตสถานะแบบเรียลไทม์
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              จอแสดงคิวงานซ่อมและสถานะเครื่องจักรอาคาร
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              แสดงสถานะคิวซ่อมปัจจุบัน ช่างผู้รับผิดชอบ และเวลารอโดยประมาณสำหรับทุกแผนก
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToSubmit}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>+ แจ้งซ่อมรายการใหม่</span>
            </button>
          </div>
        </div>

        {/* Real-time Status KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase">1. รอดำเนินการ</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{pendingTickets.length}</div>
            <div className="text-[10px] text-slate-500">รอช่างรับเรื่อง</div>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase">2. คิวถัดไป</div>
            <div className="text-2xl font-black text-blue-400 mt-0.5">{nextQueueTickets.length}</div>
            <div className="text-[10px] text-slate-500">เตรียมเข้าพื้นที่</div>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase">3. กำลังซ่อม</div>
            <div className="text-2xl font-black text-indigo-400 mt-0.5">{inProgressTickets.length}</div>
            <div className="text-[10px] text-slate-500">ช่างหน้างาน</div>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase">4. รออะไหล่</div>
            <div className="text-2xl font-black text-orange-400 mt-0.5">{waitingPartsTickets.length}</div>
            <div className="text-[10px] text-slate-500">รอของส่งมอบ</div>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase">5. ช่างไม่ว่าง</div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{techBusyTickets.length}</div>
            <div className="text-[10px] text-slate-500">ติดเคสฉุกเฉิน</div>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase">6. ซ่อมเสร็จสิ้น</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{completedTickets.length}</div>
            <div className="text-[10px] text-emerald-400/80">สำเร็จ {completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Live Split: Queue Board on Left / On-Duty Technicians on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Queue Display Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <h2 className="font-bold text-slate-900 text-sm">
                  สถานะคิวงานเรียลไทม์ (Active Queue Board)
                </h2>
              </div>

              {/* Department filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
              >
                <option value="ALL">ทุกแผนก ({tickets.length})</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Queue Board Table / Cards */}
            <div className="space-y-2.5">
              {displayTickets.slice(0, 7).map((t) => {
                const statusConfig = STATUS_LABELS_TH[t.status];
                const isUnderRepair = t.status === 'IN_PROGRESS';

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isUnderRepair
                        ? 'bg-indigo-50/60 border-indigo-200 hover:border-indigo-400 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 hover:border-blue-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shrink-0 shadow-xs ${
                          isUnderRepair
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider opacity-75">คิว</span>
                        <span className="text-sm leading-none">{t.queueNumber}</span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate max-w-[220px]">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              PRIORITY_LABELS_TH[t.urgency].color
                            }`}
                          >
                            {PRIORITY_LABELS_TH[t.urgency].label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{t.roomOrSpot}</span>
                        </div>
                        {t.statusReason && (
                          <div className="text-[10px] text-slate-600 line-clamp-1 italic">
                            💬 {t.statusReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${statusConfig.color}`}
                      >
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {t.assignedTechnician ? t.assignedTechnician.nickname : 'รอจัดสรร'} • {t.estimatedCompletionTime || 'ตามคิว'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Technicians On-Duty & Department breakdown */}
        <div className="space-y-4">
          {/* Technicians On Duty */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs">
                  ทีมช่างประจำการวันนี้ (On-Duty)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                พร้อม {technicians.length} นาย
              </span>
            </div>

            <div className="space-y-2.5">
              {technicians.map((tech) => {
                const assignedTicket = tickets.find((t) => t.id === tech.currentTicketId);

                return (
                  <div
                    key={tech.id}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-200/80 flex items-center gap-3.5"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-xs shrink-0 bg-slate-200">
                      <img
                        src={tech.avatar}
                        alt={tech.name}
                        className="w-full h-full object-cover object-[center_20%]"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate text-sm">
                          {tech.nickname} <span className="text-xs font-normal text-slate-600">({tech.name})</span>
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            tech.isAvailable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                          }`}
                          title={tech.isAvailable ? 'พร้อมรับงาน' : 'กำลังปฏิบัติงาน'}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{tech.specialty}</div>
                      <div className="text-[11px] font-medium text-blue-600 truncate mt-0.5">
                        {assignedTicket
                          ? `กำลังซ่อม: ${assignedTicket.queueNumber} - ${assignedTicket.title}`
                          : 'สแตนด์บายพร้อมรับงานใหม่'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats / Info Widget */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100 space-y-2 text-xs">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              ประสิทธิภาพระบบแจ้งซ่อม
            </div>
            <div className="space-y-1.5 text-slate-600 text-[11px]">
              <div className="flex justify-between">
                <span>เวลาตอบสนองเฉลี่ย:</span>
                <span className="font-bold text-slate-800">12 นาที</span>
              </div>
              <div className="flex justify-between">
                <span>ความพึงพอใจเฉลี่ย:</span>
                <span className="font-bold text-amber-600">★ 4.9 / 5.0</span>
              </div>
              <div className="flex justify-between">
                <span>การเชื่อมต่อ LINE Notify:</span>
                <span className="font-bold text-[#06C755]">ออนไลน์ 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
