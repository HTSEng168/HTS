import { RepairTicket, Technician, LineNotificationConfig, LineMessageLog } from '../types';

export const APP_LOGO = '/assets/aistudio/Gemini_Generated_Image_8e0ctt8e0ctt8e0c_f0f9bdaa.jpg';

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'TECH-01',
    name: 'นายธวัช สำราญจิตร์',
    nickname: 'ช่างทู',
    phone: '062-185-6163',
    avatar: '/assets/aistudio/Image_October_26__2026_-_9_21PM_753315c9',
    specialty: 'ช่างเทคนิคซ่อมบำรุง & ระบบเครื่องจักร',
    isAvailable: false,
    currentTicketId: 'FIX-2026-001',
  },
  {
    id: 'TECH-02',
    name: 'นายธนพนธ์ พันธ์ฟัก',
    nickname: 'ช่างต๊ะ',
    phone: '081-131-9756',
    avatar: '/assets/aistudio/Image_October_26__2026_-_9_23PM_4af746e2',
    specialty: 'ช่างเทคนิคซ่อมบำรุง & ระบบไฟฟ้า',
    isAvailable: true,
    currentTicketId: 'FIX-2026-002',
  },
];

export const INITIAL_TICKETS: RepairTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'FIX-2026-001',
    queueNumber: 'Q-01',
    title: 'สายพานลำเลียงมอเตอร์ขับเสียงดังและกระตุก',
    category: 'เครื่องจักรฝ่ายผลิต',
    description: 'สายพานลำเลียงชิ้นส่วนไลน์ผลิต 2 เริ่มมีเสียงเสียดสีดังผิดปกติและมีกลิ่นไหม้เล็กน้อย ต้องการให้ช่างตรวจเช็คด่วน',
    urgency: 'URGENT',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    building: 'อาคารโรงงาน 1',
    floor: 'ชั้น 1',
    roomOrSpot: 'ไลน์ผลิตประกอบย่อย #2 (ใกล้ทางออกขนส่ง)',
    assetCode: 'CV-CONV-204',
    department: 'ฝ่ายผลิต (Production)',
    requesterName: 'วิภาดา รัตนโชติ (หัวหน้ากะ)',
    contactNumber: '02-777-1011 ต่อ 124',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'NEXT_QUEUE',
    statusReason: 'จัดเตรียมเครื่องมือวัดแรงสั่นสะเทือนแล้ว เป็นคิวถัดไปหลังช่างทูปิดงานปัจจุบัน',
    assignedTechnician: INITIAL_TECHNICIANS[0],
    estimatedMinutes: 30,
    estimatedCompletionTime: '15:30 น.',
  },
  {
    id: 't-2',
    ticketNumber: 'FIX-2026-002',
    queueNumber: 'Q-02',
    title: 'แอร์ห้อง Server กลางสำนักงานน้ำรั่วหยดลงพื้น',
    category: 'ระบบปรับอากาศ (HVAC)',
    description: 'เครื่องปรับอากาศขนาด 36,000 BTU ท่อน้ำทิ้งตัน มีน้ำหยดลงใกล้ตู้ Rack Server ฝั่งทิศเหนือ เกรงว่าจะกระทบอุปกรณ์',
    urgency: 'CRITICAL',
    photoUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
    building: 'อาคารสำนักงานใหญ่ A',
    floor: 'ชั้น 4',
    roomOrSpot: 'ห้องเซิร์ฟเวอร์หลัก Server Room 402',
    assetCode: 'AC-SVR-402',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)',
    requesterName: 'ธีรเดช พัฒนสุข',
    contactNumber: '081-998-8776',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'IN_PROGRESS',
    statusReason: 'ช่างต๊ะกำลังดำเนินการเป่าล้างท่อน้ำทิ้งและตรวจเช็คถาดรองน้ำ',
    assignedTechnician: INITIAL_TECHNICIANS[1],
    estimatedMinutes: 20,
    estimatedCompletionTime: '14:45 น.',
  },
  {
    id: 't-3',
    ticketNumber: 'FIX-2026-003',
    queueNumber: 'Q-03',
    title: 'บอร์ดควบคุมอินเวอร์เตอร์เครื่องกลึง CNC แสดง Fault Code E-08',
    category: 'เครื่องจักรฝ่ายผลิต',
    description: 'เครื่องตัดและกลึงชิ้นงานไม่ยอมหมุนสปินเดิล มีโค้ดเตือนโอเวอร์ฮีต ตรวจสอบเบื้องต้นพัดลมระบายความร้อนไม่หมุน',
    urgency: 'NORMAL',
    photoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    building: 'อาคารโรงงาน 2',
    floor: 'ชั้น 1',
    roomOrSpot: 'โซน CNC Machine Shop หลังตู้ควบคุมไฟ',
    assetCode: 'CNC-LATHE-08',
    department: 'ฝ่ายวิศวกรรมการผลิต',
    requesterName: 'กิตติศักดิ์ บุญชู',
    contactNumber: '084-332-1144',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    status: 'WAITING_PARTS',
    statusReason: 'รออะไหล่พัดลมระบายความร้อน DC 24V 120mm และชุดคาปาซิเตอร์นำเข้า รอจัดส่งบ่ายพรุ่งนี้',
    assignedTechnician: INITIAL_TECHNICIANS[0],
    estimatedMinutes: 120,
    estimatedCompletionTime: 'พรุ่งนี้ 14:00 น.',
  },
  {
    id: 't-4',
    ticketNumber: 'FIX-2026-004',
    queueNumber: 'Q-04',
    title: 'ลิฟต์โดยสารตัวที่ 1 ประตูปิดเปิดติดขัดมีเสียงกระแทก',
    category: 'ลิฟต์และทางลาด',
    description: 'ลิฟต์โดยสารฝั่งล็อบบี้ ประตูเซ็นเซอร์ติดขัด และมีเสียงดังตอนปิดสนิท',
    urgency: 'CRITICAL',
    photoUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80',
    building: 'อาคารสำนักงานใหญ่ A',
    floor: 'ชั้น 1 - ล็อบบี้',
    roomOrSpot: 'โถงลิฟต์โดยสารตัวที่ 1 (Elevator #1)',
    assetCode: 'ELV-PASS-01',
    department: 'ฝ่ายบริหารอาคารและธุรการ',
    requesterName: 'นภัสสร รักษ์สุข',
    contactNumber: '02-777-1011 ต่อ 100',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: 'TECH_BUSY',
    statusReason: 'ช่างต๊ะกำลังติดเคสฉุกเฉินซ่อมแซมระบบไฟฟ้าหลัก คาดว่าจะเข้าตรวจสอบได้ภายใน 45 นาที',
    assignedTechnician: INITIAL_TECHNICIANS[1],
    estimatedMinutes: 60,
    estimatedCompletionTime: '16:00 น.',
  },
  {
    id: 't-5',
    ticketNumber: 'FIX-2026-005',
    queueNumber: 'Q-05',
    title: 'ก๊อกน้ำและท่อระบายน้ำอ่างล้างมือห้องน้ำหญิงรั่วซึม',
    category: 'ระบบประปาและสุขภัณฑ์',
    description: 'มีน้ำรั่วใต้เคาน์เตอร์อ่างล้างหน้าห้องน้ำหญิง ไหลนองพื้นทางเดิน อาจทำให้เกิดอุบัติเหตุลื่นล้ม',
    urgency: 'NORMAL',
    photoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    building: 'อาคารศูนย์อาหารและสวัสดิการ',
    floor: 'ชั้น 2',
    roomOrSpot: 'ห้องน้ำหญิงติดบันไดทิศใต้',
    assetCode: 'PLUMB-W2-03',
    department: 'ฝ่ายทรัพยากรบุคคลและแม่บ้าน',
    requesterName: 'สมใจ จิตแจ่มใส',
    contactNumber: '087-123-9988',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: 'PENDING',
    statusReason: 'บันทึกเข้าระบบแล้ว กำลังรอช่างรับงานตามลำดับคิว',
    estimatedMinutes: 30,
  },
  {
    id: 't-6',
    ticketNumber: 'FIX-2026-000',
    queueNumber: 'Q-00',
    title: 'เปลี่ยนโคมไฟส่องสว่าง LED ทางเดินโรงอาหารกระพริบ',
    category: 'ระบบไฟฟ้าและแสงสว่าง',
    description: 'หลอด LED ยาว 18W กระพริบต่อเนื่อง รบกวนพนักงานรับประทานอาหาร',
    urgency: 'NORMAL',
    building: 'อาคารศูนย์อาหารและสวัสดิการ',
    floor: 'ชั้น 1',
    roomOrSpot: 'ทางเดินหน้าเคาน์เตอร์เครื่องดื่ม โซน B',
    assetCode: 'LIGHT-CAN-12',
    department: 'ฝ่ายบริการกลางและธุรการ',
    requesterName: 'ประภาส แสงทอง',
    contactNumber: '083-221-5544',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'COMPLETED',
    statusReason: 'ซ่อมแซมและเปลี่ยนอุปกรณ์เสร็จสิ้น ทดสอบการทำงานปกติ',
    assignedTechnician: INITIAL_TECHNICIANS[0],
    completedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    repairNotes: 'เปลี่ยนโคม LED T8 18W ยี่ห้อ Philips จำนวน 2 หลอด พร้อมเปลี่ยนบัลลาสต์อิเล็กทรอนิกส์ใหม่ 1 ชุด ทดสอบวัดแรงดัน 220V นิ่งสนิท',
    partsUsed: [
      { id: 'p1', name: 'หลอด LED T8 18W Daylight', quantity: 2, unitPrice: 120 },
      { id: 'p2', name: 'บัลลาสต์อิเล็กทรอนิกส์ 36W', quantity: 1, unitPrice: 250 },
    ],
    totalCost: 490,
    satisfactionRating: 5,
    satisfactionComment: 'ช่างทูมาไวมาก สุภาพ และเก็บกวาดเศษกล่องเรียบร้อยดีเยี่ยม',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=600&q=80',
  },
];

const STORAGE_KEYS = {
  TICKETS: 'facilifix_tickets_v4',
  TECHNICIANS: 'facilifix_technicians_v4',
  LINE_CONFIG: 'facilifix_line_config_v4',
  LINE_LOGS: 'facilifix_line_logs_v4',
  CLOSURE_PASSWORD: 'facilifix_closure_password_v1',
};

export const DEFAULT_CLOSURE_PASSWORD = 'HTS168eng';

export const storageService = {
  getTickets(): RepairTicket[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (!data) {
        this.saveTickets(INITIAL_TICKETS);
        return INITIAL_TICKETS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TICKETS;
    }
  },

  saveTickets(tickets: RepairTicket[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error('Error saving tickets:', e);
    }
  },

  getTechnicians(): Technician[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
      if (!data) {
        this.saveTechnicians(INITIAL_TECHNICIANS);
        return INITIAL_TECHNICIANS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TECHNICIANS;
    }
  },

  saveTechnicians(techs: Technician[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(techs));
    } catch (e) {
      console.error('Error saving technicians:', e);
    }
  },

  getLineConfig(): LineNotificationConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LINE_CONFIG);
      if (!data) {
        const defaultConfig: LineNotificationConfig = {
          enabled: true,
          apiMode: 'messaging_api',
          channelAccessToken: '',
          botBasicId: '@073vezfu',
          botName: 'HTSengineering-BOT',
          sendMode: 'broadcast',
          defaultTargetId: '',
          useFlexMessage: true,
          notifyToken: '',
          channelWebhookUrl: '',
          autoNotifyOnCreate: true,
          autoNotifyOnStatusChange: true,
          autoNotifyOnClose: true,
        };
        this.saveLineConfig(defaultConfig);
        return defaultConfig;
      }
      const parsed = JSON.parse(data);
      // Merge with default values in case older schema was cached
      return {
        enabled: parsed.enabled ?? true,
        apiMode: parsed.apiMode || 'messaging_api',
        channelAccessToken: parsed.channelAccessToken || '',
        channelSecret: parsed.channelSecret || '',
        botBasicId: parsed.botBasicId || '@073vezfu',
        botName: parsed.botName || 'HTSengineering-BOT',
        sendMode: parsed.sendMode || 'broadcast',
        defaultTargetId: parsed.defaultTargetId || '',
        tech1LineId: parsed.tech1LineId || '',
        tech2LineId: parsed.tech2LineId || '',
        useFlexMessage: parsed.useFlexMessage ?? true,
        notifyToken: parsed.notifyToken || '',
        channelWebhookUrl: parsed.channelWebhookUrl || '',
        autoNotifyOnCreate: parsed.autoNotifyOnCreate ?? true,
        autoNotifyOnStatusChange: parsed.autoNotifyOnStatusChange ?? true,
        autoNotifyOnClose: parsed.autoNotifyOnClose ?? true,
      };
    } catch {
      return {
        enabled: true,
        apiMode: 'messaging_api',
        channelAccessToken: '',
        botBasicId: '@073vezfu',
        botName: 'HTSengineering-BOT',
        sendMode: 'broadcast',
        defaultTargetId: '',
        useFlexMessage: true,
        notifyToken: '',
        channelWebhookUrl: '',
        autoNotifyOnCreate: true,
        autoNotifyOnStatusChange: true,
        autoNotifyOnClose: true,
      };
    }
  },

  saveLineConfig(config: LineNotificationConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LINE_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving line config:', e);
    }
  },

  getLineLogs(): LineMessageLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LINE_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLineLog(log: LineMessageLog): void {
    try {
      const existing = this.getLineLogs();
      const updated = [log, ...existing].slice(0, 50); // keep last 50
      localStorage.setItem(STORAGE_KEYS.LINE_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving line log:', e);
    }
  },

  getClosurePassword(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLOSURE_PASSWORD);
      return saved || DEFAULT_CLOSURE_PASSWORD;
    } catch {
      return DEFAULT_CLOSURE_PASSWORD;
    }
  },

  setClosurePassword(newPassword: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOSURE_PASSWORD, newPassword);
    } catch (e) {
      console.error('Error saving closure password:', e);
    }
  },

  verifyClosurePassword(entered: string, activeTechId?: string): boolean {
    const trimmed = entered.trim();
    if (!trimmed) return false;

    // 1. Master Default Fallback: HTS168eng ALWAYS works!
    if (trimmed === DEFAULT_CLOSURE_PASSWORD) {
      return true;
    }

    // 2. Global custom password if changed
    const customGlobal = this.getClosurePassword();
    if (customGlobal && trimmed === customGlobal.trim()) {
      return true;
    }

    // 3. Active technician personal password
    const techs = this.getTechnicians();
    if (activeTechId) {
      const activeTech = techs.find((t) => t.id === activeTechId);
      if (activeTech?.personalPassword && trimmed === activeTech.personalPassword.trim()) {
        return true;
      }
    }

    // 4. Check if entered password matches any technician's personal password
    const matchedAny = techs.some((t) => t.personalPassword && trimmed === t.personalPassword.trim());
    if (matchedAny) {
      return true;
    }

    return false;
  },

  addTechnician(newTech: Omit<Technician, 'id' | 'isAvailable'>): Technician {
    const techs = this.getTechnicians();
    const id = `TECH-${String(Date.now()).slice(-4)}`;
    const tech: Technician = {
      ...newTech,
      id,
      isAvailable: true,
    };
    const updated = [...techs, tech];
    this.saveTechnicians(updated);
    return tech;
  },

  updateTechnician(updatedTech: Technician): void {
    const techs = this.getTechnicians();
    const updated = techs.map((t) => (t.id === updatedTech.id ? updatedTech : t));
    this.saveTechnicians(updated);
  },

  deleteTechnician(id: string): boolean {
    const techs = this.getTechnicians();
    if (techs.length <= 1) {
      return false; // must keep at least 1 technician
    }
    const updated = techs.filter((t) => t.id !== id);
    this.saveTechnicians(updated);
    return true;
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.TECHNICIANS);
    localStorage.removeItem(STORAGE_KEYS.LINE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CLOSURE_PASSWORD);
  },
};
