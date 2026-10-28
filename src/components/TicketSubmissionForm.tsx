import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Building2, 
  Tag, 
  AlertTriangle, 
  User, 
  Phone, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PriorityLevel, RepairTicket } from '../types';

interface TicketSubmissionFormProps {
  onSubmitTicket: (ticketData: Omit<RepairTicket, 'id' | 'ticketNumber' | 'queueNumber' | 'createdAt' | 'status'>) => void;
  onNavigateToTrack: (ticketId: string) => void;
}

const CATEGORIES = [
  'เครื่องจักรฝ่ายผลิต (Production Machines)',
  'ระบบปรับอากาศ & Chiller (HVAC)',
  'ระบบไฟฟ้า & ตู้ควบคุม (Electrical & MDB)',
  'ระบบประปา & สุขภัณฑ์ (Plumbing)',
  'ลิฟต์โดยสาร & ขนส่ง (Elevators & Escalators)',
  'ระบบไอที เครือข่าย & กล้อง CCTV (IT & CCTV)',
  'โครงสร้างอาคาร ประตู & หน้าต่าง (Civil & Architectural)',
  'อื่นๆ (Other Equipment)',
];

const BUILDINGS = [
  'อาคารโรงงาน 1 (Plant 1)',
  'อาคารโรงงาน 2 (Plant 2)',
  'อาคารสำนักงานใหญ่ A (HQ Tower A)',
  'อาคารสำนักงาน B (Office Annex B)',
  'อาคารคลังสินค้าและโลจิสติกส์ (Warehouse)',
  'อาคารศูนย์อาหารและสวัสดิการ (Canteen)',
  'ลานจอดรถและพื้นที่ภายนอก (Exterior)',
];

const FLOORS = ['ชั้นใต้ดิน (B1)', 'ชั้น 1', 'ชั้น 2', 'ชั้น 3', 'ชั้น 4', 'ชั้น 5', 'ดาดฟ้า (Rooftop)'];

const DEPARTMENTS = [
  'ฝ่ายผลิต (Production)',
  'ฝ่ายวิศวกรรมและการซ่อมบำรุง (Engineering & Maintenance)',
  'ฝ่ายควบคุมคุณภาพ (QC/QA)',
  'ฝ่ายคลังสินค้าและโลจิสติกส์ (Warehouse & Logistics)',
  'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
  'ฝ่ายทรัพยากรบุคคล (HR)',
  'ฝ่ายบัญชีและการเงิน (Accounting & Finance)',
  'ฝ่ายขายและการตลาด (Sales & Marketing)',
  'ฝ่ายบริหารอาคารและแม่บ้าน (Facility & Maid)',
  'ฝ่ายจัดซื้อ (Procurement)',
];

export const TicketSubmissionForm: React.FC<TicketSubmissionFormProps> = ({
  onSubmitTicket,
  onNavigateToTrack,
}) => {
  // 1. Issue & Photo
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<PriorityLevel>('NORMAL');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [assetCode, setAssetCode] = useState('');

  // 2. Location
  const [building, setBuilding] = useState(BUILDINGS[0]);
  const [floor, setFloor] = useState(FLOORS[1]);
  const [roomOrSpot, setRoomOrSpot] = useState('');

  // 3. Department & Requester
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [requesterName, setRequesterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Camera / Upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Success Modal
  const [submittedTicket, setSubmittedTicket] = useState<RepairTicket | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !roomOrSpot.trim() || !requesterName.trim() || !contactNumber.trim()) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    const newTicketData = {
      title,
      category,
      description,
      urgency,
      photoUrl,
      building,
      floor,
      roomOrSpot,
      assetCode: assetCode.trim() || undefined,
      department,
      requesterName,
      contactNumber,
      estimatedMinutes: urgency === 'CRITICAL' ? 30 : urgency === 'URGENT' ? 45 : 60,
    };

    // Callback creates the ticket and returns it
    const created = onSubmitTicket(newTicketData) as unknown as RepairTicket;
    if (created) {
      setSubmittedTicket(created);
    }

    // Reset fields for next submission
    setTitle('');
    setDescription('');
    setPhotoUrl(undefined);
    setRoomOrSpot('');
    setAssetCode('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Siri Maintenance & Engineering
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              แจ้งซ่อมเครื่องจักรและอุปกรณ์ภายในอาคาร
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              กรอกข้อมูลตาม 3 ขั้นตอนด้านล่าง ระบบจะจัดคิวงานอัตโนมัติและส่งการแจ้งเตือนตรงถึง LINE ช่างทู และ ช่างต๊ะ ทันที
            </p>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl shrink-0 bg-white hidden sm:block p-1">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_8e0ctt8e0ctt8e0c_f0f9bdaa.jpg"
              alt="Siri Laboratories Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==========================================
            หัวข้อที่ 1: แจ้งปัญหาและแนบรูปภาพ
            ========================================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              1
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                แจ้งปัญหาและถ่ายรูปภาพแนบ
              </h2>
              <p className="text-xs text-slate-500">ระบุรายละเอียดอาการผิดปกติ และแนบรูปถ่ายอุปกรณ์</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ประเภทอุปกรณ์ / เครื่องจักร <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Title / Problem */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หัวข้อปัญหา / อาการที่พบ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น สายพานมอเตอร์ลำเลียงเสียงดัง, แอร์ไม่เย็นน้ำหยด, ปั๊มน้ำไม่ทำงาน"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Asset Code (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสเครื่องจักร / รหัสครุภัณฑ์ (Asset Tag - ถ้ามี)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  placeholder="เช่น MC-CNC-04, AC-3F-01, PUMP-B1"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ระดับความเร่งด่วน <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'NORMAL' as PriorityLevel, label: 'ปกติ (ทั่วไป)', desc: 'เข้าซ่อมตามคิวปกติ' },
                  { id: 'URGENT' as PriorityLevel, label: 'ด่วน (เร่งด่วน)', desc: 'กระทบการทำงาน' },
                  { id: 'CRITICAL' as PriorityLevel, label: 'ด่วนที่สุด (วิกฤต)', desc: 'เครื่องจักรหยุด / อันตราย' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUrgency(item.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      urgency === item.id
                        ? item.id === 'CRITICAL'
                          ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/40'
                          : item.id === 'URGENT'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/40'
                          : 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/40'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุอาการผิดปกติเพิ่มเติม เช่น มีกลิ่นไหม้, แรงดันตก, ไฟกระพริบ, อาการเกิดขึ้นช่วงกี่โมง..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Photo Attachment (กล้องถ่ายรูป หรือ อัปโหลด) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ถ่ายรูปภาพหรือแนบไฟล์รูปภาพอุปกรณ์
              </label>

              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 group max-w-sm">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(undefined)}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> ลบรูปภาพ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera button with native camera capture */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition cursor-pointer text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition shadow-sm">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-blue-900">ถ่ายรูปด้วยกล้อง</span>
                    <span className="text-[10px] text-blue-600 mt-0.5">เปิดกล้องมือถือ/แท็บเล็ต</span>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </button>

                  {/* Upload photo from gallery/file */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition cursor-pointer text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition shadow-sm">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">เลือกรูปจากคลัง</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==========================================
            หัวข้อที่ 2: โลเคชั่นที่ต้องการให้เข้าซ่อม
            ========================================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              2
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                โลเคชั่นที่ต้องการให้เข้าซ่อม
              </h2>
              <p className="text-xs text-slate-500">
                ระบุเลขห้องหรือจุดที่ตั้งของอุปกรณ์ เพื่อให้ช่างเข้าถึงได้รวดเร็ว
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อาคาร / สถานที่ <span className="text-rose-500">*</span>
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชั้น <span className="text-rose-500">*</span>
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {FLOORS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลขห้อง หรือ จุดที่ตั้งของอุปกรณ์ (ละเอียด) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-rose-500" />
              <input
                type="text"
                required
                value={roomOrSpot}
                onChange={(e) => setRoomOrSpot(e.target.value)}
                placeholder="เช่น ห้องเซิร์ฟเวอร์ 402, ไลน์ผลิต 3 ข้างประตูทิศเหนือ, หน้าห้องน้ำหญิง"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              💡 ตัวอย่าง: &ldquo;ห้อง MDB 02 ข้างบันไดหนีไฟ&rdquo; หรือ &ldquo;โต๊ะทำงานแผนกบัญชี แถวที่ 3&rdquo;
            </p>
          </div>
        </div>

        {/* ==========================================
            หัวข้อที่ 3: แผนกที่แจ้งซ่อมเข้ามา
            ========================================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              3
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                แผนกที่แจ้งซ่อมเข้ามา
              </h2>
              <p className="text-xs text-slate-500">ข้อมูลผู้แจ้งสำหรับการติดต่อกลับและรายงานผล</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เลือกแผนกผู้แจ้งซ่อม <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อ-นามสกุล ผู้แจ้ง <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี (หัวหน้ากะ)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เบอร์โทรศัพท์ติดต่อกลับ / เบอร์ภายใน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="เช่น 081-234-5678 หรือ ต่อ 104"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ส่งใบแจ้งซ่อม & รับหมายเลขคิวทันที</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-2 text-center">
            <span>⚡ ระบบจะส่งการแจ้งเตือนไปยังกลุ่ม LINE ช่างซ่อมบำรุงอัตโนมัติ</span>
          </div>
        </div>
      </form>

      {/* Submission Success Dialog */}
      {submittedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mb-2">
                คิวงานของคุณ: {submittedTicket.queueNumber}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                แจ้งซ่อมสำเร็จเรียบร้อย!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                หมายเลขใบแจ้งซ่อม:{' '}
                <span className="font-mono font-bold text-slate-800">
                  {submittedTicket.ticketNumber}
                </span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">ปัญหา:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">
                  {submittedTicket.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สถานที่:</span>
                <span className="font-medium text-slate-800 text-right">
                  {submittedTicket.roomOrSpot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">แจ้งเตือน LINE:</span>
                <span className="font-semibold text-[#06C755]">ส่งเข้ากลุ่มช่างแล้ว ✓</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  const id = submittedTicket.id;
                  setSubmittedTicket(null);
                  onNavigateToTrack(id);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>ไปยังข้อ 4. ช่องสถานะติดตามงาน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ปิดหน้านี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
