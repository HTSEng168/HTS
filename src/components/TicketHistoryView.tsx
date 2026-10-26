import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Printer, 
  X, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { RepairTicket, TicketStatus } from '../types';
import { STATUS_LABELS_TH, PRIORITY_LABELS_TH } from '../services/lineService';

interface TicketHistoryViewProps {
  tickets: RepairTicket[];
  onSelectTicket: (ticketId: string) => void;
  onUpdateRating: (ticketId: string, rating: number, comment: string) => void;
}

export const TicketHistoryView: React.FC<TicketHistoryViewProps> = ({
  tickets,
  onSelectTicket,
  onUpdateRating,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectTicket, setInspectTicket] = useState<RepairTicket | null>(null);

  // Rating modal state
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const categories = Array.from(new Set(tickets.map((t) => t.category)));

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.queueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.roomOrSpot.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || t.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenInspect = (ticket: RepairTicket) => {
    setInspectTicket(ticket);
    setRatingVal(ticket.satisfactionRating || 5);
    setRatingComment(ticket.satisfactionComment || '');
    setRatingSubmitted(false);
  };

  const handleSaveRating = (ticketId: string) => {
    onUpdateRating(ticketId, ratingVal, ratingComment);
    setRatingSubmitted(true);
    if (inspectTicket) {
      setInspectTicket({
        ...inspectTicket,
        satisfactionRating: ratingVal,
        satisfactionComment: ratingComment,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                5
              </span>
              <h2 className="font-bold text-slate-900 text-base">
                ประวัติการแจ้งซ่อมย้อนหลัง
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ตรวจสอบประวัติการแจ้งซ่อมทั้งหมด รายการอะไหล่ ค่าใช้จ่าย และให้คะแนนช่าง
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 self-start sm:self-auto">
            รวม {filteredTickets.length} รายการ
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่, หัวข้อ, หรือห้อง..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="NEXT_QUEUE">คิวถัดไป</option>
              <option value="IN_PROGRESS">กำลังซ่อม</option>
              <option value="WAITING_PARTS">รออะไหล่</option>
              <option value="TECH_BUSY">ช่างไม่ว่าง</option>
              <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">ประเภทอุปกรณ์ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/90 text-xs">
            ไม่พบประวัติการแจ้งซ่อมตามเงื่อนไขที่เลือก
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const statusConfig = STATUS_LABELS_TH[ticket.status];
            const isCompleted = ticket.status === 'COMPLETED';

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-xs">
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

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${statusConfig.color}`}
                    >
                      <span>{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {ticket.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {ticket.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {ticket.roomOrSpot} ({ticket.building})
                      </span>
                      <span>แผนก: {ticket.department}</span>
                      {ticket.assetCode && (
                        <span className="font-mono text-blue-600 font-medium flex items-center gap-0.5">
                          <Tag className="w-3 h-3" />
                          {ticket.assetCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Summary */}
                  <div className="flex md:flex-col justify-between md:justify-center items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
                    <div className="text-right text-[11px] text-slate-500">
                      <div>แจ้งเมื่อ: {new Date(ticket.createdAt).toLocaleDateString('th-TH')}</div>
                      {ticket.totalCost !== undefined && ticket.totalCost > 0 && (
                        <div className="font-bold text-slate-900 mt-0.5">
                          ค่าซ่อม: {ticket.totalCost.toLocaleString()} บ.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenInspect(ticket)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <span>ดูใบสรุป</span>
                      </button>
                      <button
                        onClick={() => onSelectTicket(ticket.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                        title="ดูในไทม์ไลน์ติดตามงาน"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rating summary if completed */}
                {isCompleted && ticket.satisfactionRating && (
                  <div className="bg-amber-50/60 rounded-xl p-2.5 text-xs text-amber-900 flex items-center justify-between border border-amber-200/60">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < ticket.satisfactionRating!
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-[11px]">
                        ความพึงพอใจ: {ticket.satisfactionRating}/5
                      </span>
                    </div>
                    {ticket.satisfactionComment && (
                      <span className="text-[11px] italic text-slate-600 truncate max-w-[250px]">
                        &ldquo;{ticket.satisfactionComment}&rdquo;
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Inspect Ticket & Print Modal */}
      {inspectTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
                    คิว: {inspectTicket.queueNumber}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    #{inspectTicket.ticketNumber}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {inspectTicket.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  title="พิมพ์ใบรับรองการซ่อม (Print / PDF)"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setInspectTicket(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-500">สถานที่:</span>{' '}
                <span className="font-medium text-slate-800">
                  {inspectTicket.roomOrSpot} ({inspectTicket.building} {inspectTicket.floor})
                </span>
              </div>
              <div>
                <span className="text-slate-500">แผนกที่แจ้ง:</span>{' '}
                <span className="font-medium text-slate-800">{inspectTicket.department}</span>
              </div>
              <div>
                <span className="text-slate-500">ผู้แจ้ง:</span>{' '}
                <span className="font-medium text-slate-800">
                  {inspectTicket.requesterName} ({inspectTicket.contactNumber})
                </span>
              </div>
              <div>
                <span className="text-slate-500">สถานะ:</span>{' '}
                <span className="font-bold text-blue-600">
                  {STATUS_LABELS_TH[inspectTicket.status].label}
                </span>
              </div>
            </div>

            {/* Photos (Before & After) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inspectTicket.photoUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    📸 รูปภาพก่อนซ่อม (Before):
                  </span>
                  <img
                    src={inspectTicket.photoUrl}
                    alt="Before Repair"
                    className="w-full h-36 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}
              {inspectTicket.afterPhotoUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5 text-emerald-700">
                    ✨ รูปภาพหลังซ่อมเสร็จ (After):
                  </span>
                  <img
                    src={inspectTicket.afterPhotoUrl}
                    alt="After Repair"
                    className="w-full h-36 object-cover rounded-xl border border-emerald-300"
                  />
                </div>
              )}
            </div>

            {/* Technician Notes & Parts */}
            {inspectTicket.repairNotes && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
                <div className="font-bold text-slate-900">
                  📝 รายละเอียดการซ่อมแซมและวิธีแก้ไข:
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {inspectTicket.repairNotes}
                </p>
                {inspectTicket.assignedTechnician && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    ช่างผู้ปิดงาน: {inspectTicket.assignedTechnician.name}
                  </div>
                )}
              </div>
            )}

            {/* Spare Parts list */}
            {inspectTicket.partsUsed && inspectTicket.partsUsed.length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">รายการอะไหล่และอุปกรณ์ที่ใช้:</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-2.5">รายการ</th>
                        <th className="p-2.5 text-center">จำนวน</th>
                        <th className="p-2.5 text-right">ราคา/หน่วย</th>
                        <th className="p-2.5 text-right">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectTicket.partsUsed.map((part) => (
                        <tr key={part.id}>
                          <td className="p-2.5">{part.name}</td>
                          <td className="p-2.5 text-center">{part.quantity}</td>
                          <td className="p-2.5 text-right">{part.unitPrice.toLocaleString()} บ.</td>
                          <td className="p-2.5 text-right font-medium">
                            {(part.quantity * part.unitPrice).toLocaleString()} บ.
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="p-2.5 text-right">
                          รวมค่าอะไหล่ทั้งสิ้น:
                        </td>
                        <td className="p-2.5 text-right text-blue-700">
                          {inspectTicket.totalCost?.toLocaleString()} บ.
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Signature preview if exists */}
            {inspectTicket.signatureUrl && (
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">ลายมือชื่อช่าง/ผู้ตรวจรับ:</span>
                  <span className="text-[10px] text-slate-500">ยืนยันการปิดใบงานดิจิทัล</span>
                </div>
                <img
                  src={inspectTicket.signatureUrl}
                  alt="Signature"
                  className="h-12 bg-white rounded-lg border border-slate-200 p-1"
                />
              </div>
            )}

            {/* Satisfaction Rating Form */}
            {inspectTicket.status === 'COMPLETED' && (
              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 space-y-3">
                <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ประเมินความพึงพอใจการให้บริการของช่าง
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-700">ให้คะแนน:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        className="p-1 cursor-pointer transition hover:scale-125"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= ratingVal
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-800 ml-2">
                    ({ratingVal} ดาว)
                  </span>
                </div>

                <input
                  type="text"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="ข้อคิดเห็นหรือคำชมเชยช่าง (เช่น ช่างมาตรงเวลา สุภาพมาก)..."
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSaveRating(inspectTicket.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    {ratingSubmitted ? '✓ บันทึกคะแนนแล้ว' : 'ส่งคะแนนประเมิน'}
                  </button>
                  {ratingSubmitted && (
                    <span className="text-xs text-emerald-700 font-semibold">
                      ขอบคุณสำหรับการประเมิน!
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setInspectTicket(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-xl transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
