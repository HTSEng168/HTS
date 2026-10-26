import React, { useState, useRef } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Camera, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  User, 
  Sparkles,
  Phone,
  Tag,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RepairTicket, Technician, TicketStatus, SparePartItem } from '../types';
import { STATUS_LABELS_TH, PRIORITY_LABELS_TH } from '../services/lineService';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface TechnicianPortalProps {
  tickets: RepairTicket[];
  technicians: Technician[];
  onUpdateStatus: (ticketId: string, status: TicketStatus, reason?: string) => void;
  onCloseTicket: (
    ticketId: string, 
    closureData: {
      repairNotes: string;
      partsUsed: SparePartItem[];
      totalCost: number;
      afterPhotoUrl?: string;
      signatureUrl?: string;
    }
  ) => void;
  onSelectTicket: (ticketId: string) => void;
}

export const TechnicianPortal: React.FC<TechnicianPortalProps> = ({
  tickets,
  technicians,
  onUpdateStatus,
  onCloseTicket,
  onSelectTicket,
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(technicians[0]?.id || 'TECH-01');
  const [closingTicket, setClosingTicket] = useState<RepairTicket | null>(null);

  // Status reason modal
  const [promptingStatus, setPromptingStatus] = useState<{
    ticket: RepairTicket;
    status: TicketStatus;
  } | null>(null);
  const [statusReasonInput, setStatusReasonInput] = useState('');

  // Closure Form state
  const [repairNotes, setRepairNotes] = useState('');
  const [parts, setParts] = useState<SparePartItem[]>([]);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | undefined>();
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>();
  const afterPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const currentTech = technicians.find((t) => t.id === selectedTechId) || technicians[0];

  // Active tickets needing technician attention (not yet closed)
  const activeTickets = tickets.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const closedTickets = tickets.filter((t) => t.status === 'COMPLETED');

  // Trigger quick status change
  const handleTriggerStatus = (ticket: RepairTicket, targetStatus: TicketStatus) => {
    if (targetStatus === 'WAITING_PARTS' || targetStatus === 'TECH_BUSY') {
      setPromptingStatus({ ticket, status: targetStatus });
      setStatusReasonInput(
        targetStatus === 'WAITING_PARTS'
          ? 'รออะไหล่สายพานและตลับลูกปืน รอส่งมอบบ่ายนี้'
          : 'ช่างติดเคสฉุกเฉินไฟดับอาคารโรงงาน 1'
      );
      return;
    }

    if (targetStatus === 'COMPLETED') {
      // Open full closure modal
      setClosingTicket(ticket);
      setRepairNotes('ตรวจสอบและซ่อมแซมชิ้นส่วนที่ชำรุด ทดสอบระบบทำงานได้ตามมาตรฐานปกติ');
      setParts([
        { id: 'p-' + Date.now(), name: 'ชุดอุปกรณ์ซ่อมบำรุง / น็อตข้อต่อ', quantity: 1, unitPrice: 350 },
      ]);
      setAfterPhotoUrl(undefined);
      setSignatureUrl(undefined);
      return;
    }

    // Direct status change
    onUpdateStatus(ticket.id, targetStatus);
  };

  const handleConfirmStatusWithReason = () => {
    if (promptingStatus) {
      onUpdateStatus(promptingStatus.ticket.id, promptingStatus.status, statusReasonInput);
      setPromptingStatus(null);
      setStatusReasonInput('');
    }
  };

  const handleAddPartRow = () => {
    setParts([
      ...parts,
      { id: 'part-' + Date.now(), name: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemovePartRow = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handlePartChange = (index: number, field: keyof SparePartItem, value: unknown) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  const totalPartsCost = parts.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleAfterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteClosure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingTicket) return;

    if (!repairNotes.trim()) {
      alert('กรุณากรอกบันทึกสรุปการซ่อม');
      return;
    }

    onCloseTicket(closingTicket.id, {
      repairNotes,
      partsUsed: parts.filter((p) => p.name.trim() !== ''),
      totalCost: totalPartsCost,
      afterPhotoUrl,
      signatureUrl,
    });

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setClosingTicket(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Wrench className="w-3.5 h-3.5" />
            หน้าที่ 2: พอร์ทัลเจ้าหน้าที่ & ช่างซ่อมบำรุง
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            จัดการคิวงาน สรุปงาน และปิดใบแจ้งซ่อม
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            เปลี่ยนสถานะงานตามสถานการณ์จริง (กำลังซ่อม, รออะไหล่, ช่างไม่ว่าง) พร้อมระบบบันทึกอะไหล่ ลายเซ็นดิจิทัล และแจ้งเตือน LINE อัตโนมัติ
          </p>
        </div>

        {/* Technician Profile Card Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center gap-3 shrink-0 self-stretch sm:self-auto">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md shrink-0 bg-slate-800">
            <img
              src={currentTech?.avatar}
              alt="Current Tech"
              className="w-full h-full object-cover object-[center_20%]"
            />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-blue-200 block font-medium">ช่างที่เข้าสู่ระบบปฏิบัติงาน:</span>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="bg-transparent text-white font-bold text-xs sm:text-sm outline-none cursor-pointer border-b border-white/20 pb-0.5"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id} className="text-slate-900">
                  {t.name} ({t.nickname}) - {t.specialty}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-slate-300 flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              {currentTech?.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Queue Overview Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">คิวงานรอซ่อม</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{activeTickets.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">ต้องการการดำเนินการ</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">กำลังซ่อมอยู่</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {activeTickets.filter((t) => t.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">ช่างเข้าพื้นที่แล้ว</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">รออะไหล่ / ติดงาน</div>
          <div className="text-2xl font-black text-orange-600 mt-1">
            {activeTickets.filter((t) => t.status === 'WAITING_PARTS' || t.status === 'TECH_BUSY').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">รอดำเนินการต่อ</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">ปิดงานแล้ว</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{closedTickets.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">เรียบร้อย 100%</div>
        </div>
      </div>

      {/* Main Task Queue List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-base flex items-center gap-2">
            <span>รายการคิวงานที่ต้องเข้าซ่อม</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {activeTickets.length} คิว
            </span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            💡 กดเปลี่ยนสถานะเพื่อแจ้งเตือนผู้แจ้งและกลุ่ม LINE ทันที
          </span>
        </div>

        {activeTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">ไม่มีคิวงานค้างในระบบ</h3>
            <p className="text-xs text-slate-500">ยอดเยี่ยมมาก! ทีมช่างเคลียร์งานทั้งหมดเรียบร้อยแล้ว</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTickets.map((ticket) => {
              const statusConfig = STATUS_LABELS_TH[ticket.status];

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-300 transition space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-sm">
                        {ticket.queueNumber}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        #{ticket.ticketNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          PRIORITY_LABELS_TH[ticket.urgency].color
                        }`}
                      >
                        {PRIORITY_LABELS_TH[ticket.urgency].label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${statusConfig.color}`}
                      >
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {ticket.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-2">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{ticket.roomOrSpot} ({ticket.building} {ticket.floor})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>ผู้แจ้ง: {ticket.requesterName} ({ticket.department})</span>
                        </div>
                        {ticket.assetCode && (
                          <div className="flex items-center gap-1.5 font-mono text-blue-600 font-semibold">
                            <Tag className="w-3.5 h-3.5 shrink-0" />
                            <span>รหัสเครื่องจักร: {ticket.assetCode}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>แจ้งเมื่อ: {new Date(ticket.createdAt).toLocaleTimeString('th-TH')} น.</span>
                        </div>
                      </div>

                      {/* Status note if exists */}
                      {ticket.statusReason && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          <span className="font-bold">หมายเหตุสถานะ:</span> {ticket.statusReason}
                        </div>
                      )}
                    </div>

                    {/* Photo preview thumbnail */}
                    {ticket.photoUrl && (
                      <div className="shrink-0 flex flex-col justify-center">
                        <span className="text-[11px] font-semibold text-slate-500 mb-1">
                          รูปถ่ายจุดชำรุด:
                        </span>
                        <img
                          src={ticket.photoUrl}
                          alt="Broken asset"
                          className="w-full h-32 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition"
                          onClick={() => onSelectTicket(ticket.id)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Technician Status Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      ⚡ ดำเนินการเปลี่ยนสถานะ & จัดคิวงาน:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleTriggerStatus(ticket, 'NEXT_QUEUE')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                          ticket.status === 'NEXT_QUEUE'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        📋 คิวถัดไป
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerStatus(ticket, 'IN_PROGRESS')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                          ticket.status === 'IN_PROGRESS'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        🔧 กำลังซ่อม
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerStatus(ticket, 'WAITING_PARTS')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                          ticket.status === 'WAITING_PARTS'
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                        }`}
                      >
                        📦 รออะไหล่
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerStatus(ticket, 'TECH_BUSY')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                          ticket.status === 'TECH_BUSY'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        ⚠️ ช่างไม่ว่าง
                      </button>

                      {/* Main Close Job Button */}
                      <button
                        type="button"
                        onClick={() => handleTriggerStatus(ticket, 'COMPLETED')}
                        className="ml-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>สรุปงาน & ปิดใบแจ้งซ่อม</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prompt Reason Modal for WAITING_PARTS / TECH_BUSY */}
      {promptingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                ระบุเหตุผลสถานะ &ldquo;{STATUS_LABELS_TH[promptingStatus.status].label}&rdquo;
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              ข้อความนี้จะถูกส่งแจ้งเตือนผ่าน LINE ถึงผู้แจ้งและกลุ่มช่างทันที
            </p>
            <textarea
              rows={3}
              value={statusReasonInput}
              onChange={(e) => setStatusReasonInput(e.target.value)}
              placeholder="เช่น รออะไหล่บอร์ดคอนโทรลเลอร์จัดส่งพรุ่งนี้ หรือ ติดงานฉุกเฉิน..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPromptingStatus(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusWithReason}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                ยืนยันและส่งแจ้งเตือน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Ticket Closure Modal (สรุปงาน & ปิดใบแจ้งซ่อม) */}
      {closingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ปิดใบแจ้งซ่อม (Job Completion)
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  สรุปงาน: [{closingTicket.queueNumber}] {closingTicket.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  สถานที่: {closingTicket.roomOrSpot} ({closingTicket.building})
                </p>
              </div>
            </div>

            <form onSubmit={handleCompleteClosure} className="space-y-4 text-xs">
              {/* Repair Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  สรุปสาเหตุและวิธีการแก้ไขซ่อมแซม <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="ระบุสิ่งที่ซ่อมไป เช่น เปลี่ยนสายพานมอเตอร์, ล้างแอร์และเป่าท่อน้ำทิ้ง, ปรับตั้งระบบความดัน..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Spare Parts Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    รายการอะไหล่และอุปกรณ์ที่ใช้ (ถ้ามี)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPartRow}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มรายการอะไหล่
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {parts.length === 0 ? (
                    <div className="text-center py-2 text-slate-400 text-[11px]">
                      ไม่มีการใช้อะไหล่เพิ่มเติม (เฉพาะค่าแรงช่างประจำ)
                    </div>
                  ) : (
                    parts.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="ชื่ออะไหล่ เช่น ฟิวส์ 10A, ลูกปืน 6204"
                          value={item.name}
                          onChange={(e) => handlePartChange(idx, 'name', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs outline-none"
                        />
                        <input
                          type="number"
                          placeholder="จำนวน"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handlePartChange(idx, 'quantity', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-center outline-none"
                        />
                        <input
                          type="number"
                          placeholder="ราคา/หน่วย"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handlePartChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-right outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePartRow(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}

                  {parts.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-xs text-slate-800">
                      <span>รวมค่าอะไหล่ทั้งสิ้น:</span>
                      <span className="text-emerald-700">{totalPartsCost.toLocaleString()} บาท</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo after repair */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รูปถ่ายหลังซ่อมเสร็จ (After Repair Photo)
                </label>
                {afterPhotoUrl ? (
                  <div className="relative max-w-xs rounded-xl overflow-hidden border border-emerald-300">
                    <img src={afterPhotoUrl} alt="After" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl(undefined)}
                      className="absolute top-2 right-2 px-2 py-1 bg-rose-600 text-white rounded text-[10px]"
                    >
                      ลบรูป
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => afterPhotoInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-slate-50 hover:bg-emerald-50/50 text-slate-600 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>ถ่ายรูปหรือแนบรูปถ่ายอุปกรณ์ที่ซ่อมเสร็จแล้ว</span>
                    <input
                      ref={afterPhotoInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleAfterPhotoChange}
                      className="hidden"
                    />
                  </button>
                )}
              </div>

              {/* Digital Signature */}
              <div className="pt-1">
                <DigitalSignaturePad
                  onSave={(dataUrl) => setSignatureUrl(dataUrl)}
                  onClear={() => setSignatureUrl(undefined)}
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setClosingTicket(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ยืนยันปิดใบแจ้งซ่อม & ส่ง LINE ทันที</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
