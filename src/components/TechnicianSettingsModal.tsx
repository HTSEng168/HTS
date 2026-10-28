import React, { useState, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  Trash2, 
  KeyRound, 
  Phone, 
  Camera, 
  Check, 
  AlertCircle,
  Wrench,
  Users
} from 'lucide-react';
import { Technician } from '../types';
import { storageService, DEFAULT_CLOSURE_PASSWORD } from '../services/storageService';

interface TechnicianSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  onTechniciansChange: (updatedTechs: Technician[]) => void;
}

export const TechnicianSettingsModal: React.FC<TechnicianSettingsModalProps> = ({
  isOpen,
  onClose,
  technicians,
  onTechniciansChange,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'security'>('members');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingTechId, setEditingTechId] = useState<string | null>(null);

  // New technician form
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newPersonalPassword, setNewPersonalPassword] = useState('');
  const [newAvatar, setNewAvatar] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Security master password state
  const [customMasterPassword, setCustomMasterPassword] = useState(storageService.getClosurePassword());
  const [newMasterPassInput, setNewMasterPassInput] = useState('');
  const [masterPassSuccess, setMasterPassSuccess] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNickname.trim() || !newPhone.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุล, ชื่อเล่น และเบอร์โทรศัพท์ให้ครบถ้วน');
      return;
    }

    const defaultAvatar = newAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

    const created = storageService.addTechnician({
      name: newName.trim(),
      nickname: newNickname.trim(),
      phone: newPhone.trim(),
      specialty: newSpecialty.trim() || 'ช่างเทคนิคซ่อมบำรุงทั่วไป',
      avatar: defaultAvatar,
      personalPassword: newPersonalPassword.trim() || undefined,
    });

    onTechniciansChange(storageService.getTechnicians());
    showToast(`เพิ่ม ${created.nickname} (${created.name}) เข้าสู่ทีมช่างเรียบร้อยแล้ว`);

    // Reset
    setIsAddingNew(false);
    setNewName('');
    setNewNickname('');
    setNewPhone('');
    setNewSpecialty('');
    setNewPersonalPassword('');
    setNewAvatar('');
    setFormError(null);
  };

  const handleUpdateTechPassword = (techId: string, customPassword: string) => {
    const tech = technicians.find((t) => t.id === techId);
    if (!tech) return;

    const updated = {
      ...tech,
      personalPassword: customPassword.trim() || undefined,
    };
    storageService.updateTechnician(updated);
    onTechniciansChange(storageService.getTechnicians());
    setEditingTechId(null);
    showToast(`อัปเดตรหัสผ่านของ ${tech.nickname} เรียบร้อยแล้ว`);
  };

  const handleDeleteTech = (techId: string, name: string) => {
    if (technicians.length <= 1) {
      alert('ระบบต้องมีช่างประจำการอย่างน้อย 1 นาย ไม่สามารถลบได้');
      return;
    }
    if (confirm(`คุณต้องการลบข้อมูลช่าง "${name}" ออกจากระบบใช่หรือไม่?`)) {
      storageService.deleteTechnician(techId);
      onTechniciansChange(storageService.getTechnicians());
      showToast(`ลบข้อมูลช่าง ${name} เรียบร้อยแล้ว`);
    }
  };

  const handleUpdateMasterPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPassInput.trim() || newMasterPassInput.trim().length < 4) {
      alert('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    storageService.setClosurePassword(newMasterPassInput.trim());
    setCustomMasterPassword(newMasterPassInput.trim());
    setNewMasterPassInput('');
    setMasterPassSuccess(true);
    setTimeout(() => setMasterPassSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base leading-tight">
                การตั้งค่าทีมช่าง & ระบบความปลอดภัย
              </h2>
              <p className="text-xs text-slate-500">
                เพิ่มสมาชิกช่างใหม่ และตั้งรหัสผ่านปิดงานเฉพาะบุคคล
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
          <button
            onClick={() => {
              setActiveTab('members');
              setIsAddingNew(false);
            }}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>สมาชิกทีมช่าง ({technicians.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>รหัสผ่านปิดงาน & ความปลอดภัย</span>
          </button>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tab 1: Member Management */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {!isAddingNew ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    รายชื่อช่างปัจจุบัน ({technicians.length} นาย)
                  </span>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>เพิ่มช่างมาใหม่</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {technicians.map((tech) => (
                    <div
                      key={tech.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white shadow-xs bg-slate-200 shrink-0">
                          <img
                            src={tech.avatar}
                            alt={tech.name}
                            className="w-full h-full object-cover object-[center_20%]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 text-sm">
                            {tech.nickname} <span className="text-xs font-normal text-slate-600">({tech.name})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{tech.specialty}</div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {tech.phone}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-indigo-600 font-medium">
                              <KeyRound className="w-3 h-3" />
                              {tech.personalPassword ? 'มีรหัสผ่านเฉพาะตัว' : 'ใช้รหัส Default'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => setEditingTechId(editingTechId === tech.id ? null : tech.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                        >
                          {editingTechId === tech.id ? 'ปิด' : 'ตั้งรหัสผ่าน'}
                        </button>
                        {technicians.length > 1 && (
                          <button
                            onClick={() => handleDeleteTech(tech.id, tech.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="ลบข้อมูลช่าง"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Inline password editor for this tech */}
                      {editingTechId === tech.id && (
                        <div className="w-full pt-3 mt-1 border-t border-slate-200 flex items-center gap-2">
                          <input
                            type="password"
                            placeholder="ตั้งรหัสผ่านส่วนตัวใหม่ (เว้นว่างเพื่อใช้ Default)"
                            defaultValue={tech.personalPassword || ''}
                            id={`pass-input-${tech.id}`}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono outline-none"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(`pass-input-${tech.id}`) as HTMLInputElement;
                              if (input) {
                                handleUpdateTechPassword(tech.id, input.value);
                              }
                            }}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                          >
                            บันทึก
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Add New Technician Form */
              <form onSubmit={handleSaveNewTechnician} className="space-y-3.5 text-xs">
                <div className="font-bold text-slate-800 text-sm pb-1 border-b border-slate-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  เพิ่มสมาชิกช่างคนใหม่
                </div>

                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="เช่น นายกิตติพงษ์ ใจเย็น"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ชื่อเรียก / ชื่อเล่น <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      placeholder="เช่น ช่างกิต"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="เช่น 089-123-4567"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ตำแหน่ง / ความเชี่ยวชาญ
                    </label>
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="เช่น ช่างไฟฟ้า & ระบบปรับอากาศ"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    รหัสผ่านปิดงานเฉพาะตัว (Personal Password)
                  </label>
                  <input
                    type="password"
                    value={newPersonalPassword}
                    onChange={(e) => setNewPersonalPassword(e.target.value)}
                    placeholder="เว้นว่างไว้เพื่อใช้รหัส Default กลาง (HTS168eng)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 ช่างคนนี้สามารถใช้รหัสเฉพาะตัวของตนเอง หรือใช้รหัส Default กลาง ({DEFAULT_CLOSURE_PASSWORD}) ปิดงานได้เช่นกัน
                  </p>
                </div>

                {/* Avatar upload */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    รูปโปรไฟล์ช่าง (ถ่ายรูปหรือเลือกไฟล์)
                  </label>
                  <div className="flex items-center gap-3">
                    {newAvatar ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                        <img src={newAvatar} alt="New Tech" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewAvatar('')}
                          className="absolute inset-0 bg-black/40 text-white text-[10px] font-bold flex items-center justify-center opacity-0 hover:opacity-100 transition"
                        >
                          ลบรูป
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-4 py-2.5 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl bg-slate-50 text-slate-600 flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <span>เลือกรูปถ่ายช่าง</span>
                      </button>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setFormError(null);
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    บันทึกสมาชิกช่าง
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Security & Password Fallback */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            {/* Master Fallback Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                <KeyRound className="w-4 h-4 text-amber-600" />
                รหัสผ่านฉุกเฉินกลาง (Master Default Fallback):
              </div>
              <div className="font-mono text-base font-bold text-amber-900 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300 inline-block tracking-wider">
                {DEFAULT_CLOSURE_PASSWORD}
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                🛡️ <strong>ระบบกันลืม:</strong> รหัสเริ่มต้นนี้จะทำงานได้ตลอดเวลา หากช่างคนใดลืมรหัสผ่านส่วนตัวของตนเอง สามารถนำรหัสนี้มาปลดล็อกเพื่อปิดงานได้เสมอ
              </p>
            </div>

            {/* Custom Global Password Setting */}
            <form onSubmit={handleUpdateMasterPassword} className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-800 text-sm">
                ตั้งรหัสผ่านกลางเพิ่มเติมของทีมช่าง
              </div>
              <p className="text-slate-500 text-[11px]">
                ช่างทุกคนสามารถใช้รหัสผ่านนี้ หรือรหัสประจำตัว หรือรหัส Default ({DEFAULT_CLOSURE_PASSWORD}) ปิดงานได้
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  รหัสผ่านกลางใหม่ที่ต้องการ
                </label>
                <input
                  type="password"
                  required
                  value={newMasterPassInput}
                  onChange={(e) => setNewMasterPassInput(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 4 ตัวอักษร"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono outline-none text-xs bg-white"
                />
              </div>

              {masterPassSuccess && (
                <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                บันทึกรหัสผ่านกลาง
              </button>
            </form>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
