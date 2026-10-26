export type TicketStatus = 
  | 'PENDING'       // รอดำเนินการ
  | 'NEXT_QUEUE'    // คิวถัดไป
  | 'IN_PROGRESS'   // กำลังซ่อม
  | 'WAITING_PARTS' // รออะไหล่
  | 'TECH_BUSY'     // ช่างไม่ว่าง
  | 'COMPLETED'     // ซ่อมเสร็จสิ้น
  | 'CANCELLED';    // ยกเลิก

export type PriorityLevel = 'NORMAL' | 'URGENT' | 'CRITICAL';

export interface SparePartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string; // e.g. "FIX-2026-001"
  queueNumber: string;  // e.g. "Q-01"
  title: string;
  category: string;     // e.g. "เครื่องจักรฝ่ายผลิต", "ระบบปรับอากาศ (HVAC)", "ระบบไฟฟ้า", "ระบบประปา", "ลิฟต์และทางลาด", "อุปกรณ์ไอที/เน็ตเวิร์ก", "โครงสร้างอาคาร"
  description: string;
  urgency: PriorityLevel;
  photoUrl?: string;    // Base64 or URL

  // Location details (ข้อ 2)
  building: string;
  floor: string;
  roomOrSpot: string;   // เลขห้อง หรือ จุดที่ตั้งอุปกรณ์ เช่น "ห้อง MDB ชั้นใต้ดิน", "ไลน์ผลิต #4"
  assetCode?: string;   // รหัสเครื่องจักร/ครุภัณฑ์ เช่น "MC-CNC-09"

  // Requester details (ข้อ 3)
  department: string;
  requesterName: string;
  contactNumber: string;
  createdAt: string;    // ISO timestamp

  // Status & Tracking (ข้อ 4)
  status: TicketStatus;
  statusReason?: string; // e.g. "รออะไหล่สายพานมอเตอร์ 3HP กำลังจัดส่งจากซัพพลายเออร์" or "ช่างติดเคสฉุกเฉินไฟดับอาคาร B"
  assignedTechnician?: {
    id: string;
    name: string;
    nickname: string;
    phone: string;
    avatar: string;
    specialty: string;
  };
  estimatedMinutes?: number;
  estimatedCompletionTime?: string;

  // History & Closure for Technician (หน้าที่ 2)
  repairNotes?: string;
  partsUsed?: SparePartItem[];
  totalCost?: number;
  completedAt?: string;
  afterPhotoUrl?: string;
  signatureUrl?: string; // Digital signature
  satisfactionRating?: number; // 1-5
  satisfactionComment?: string;
}

export interface Technician {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  avatar: string;
  specialty: string;
  isAvailable: boolean;
  currentTicketId?: string;
}

export interface LineNotificationConfig {
  enabled: boolean;
  notifyToken: string;
  channelWebhookUrl: string;
  autoNotifyOnCreate: boolean;
  autoNotifyOnStatusChange: boolean;
  autoNotifyOnClose: boolean;
}

export interface LineMessageLog {
  id: string;
  timestamp: string;
  recipient: string;
  ticketNumber: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'SIMULATED';
}
