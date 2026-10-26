import { RepairTicket, LineMessageLog, TicketStatus } from '../types';
import { storageService } from './storageService';

export const STATUS_LABELS_TH: Record<TicketStatus, { label: string; color: string; badge: string; icon: string }> = {
  PENDING: { label: 'รอดำเนินการ', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'bg-amber-500', icon: '⏳' },
  NEXT_QUEUE: { label: 'คิวถัดไป', color: 'text-blue-700 bg-blue-50 border-blue-200', badge: 'bg-blue-500', icon: '📋' },
  IN_PROGRESS: { label: 'กำลังซ่อม', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', badge: 'bg-indigo-600', icon: '🔧' },
  WAITING_PARTS: { label: 'รออะไหล่', color: 'text-orange-700 bg-orange-50 border-orange-200', badge: 'bg-orange-500', icon: '📦' },
  TECH_BUSY: { label: 'ช่างไม่ว่าง', color: 'text-rose-700 bg-rose-50 border-rose-200', badge: 'bg-rose-500', icon: '⚠️' },
  COMPLETED: { label: 'ซ่อมเสร็จสิ้น', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badge: 'bg-emerald-600', icon: '✅' },
  CANCELLED: { label: 'ยกเลิก', color: 'text-gray-600 bg-gray-100 border-gray-200', badge: 'bg-gray-400', icon: '✖️' },
};

export const PRIORITY_LABELS_TH = {
  NORMAL: { label: 'ปกติ', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  URGENT: { label: 'ด่วน', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  CRITICAL: { label: 'ด่วนที่สุด (วิกฤต)', color: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' },
};

export function formatLineMessage(
  ticket: RepairTicket,
  eventType: 'NEW' | 'STATUS_CHANGE' | 'CLOSED'
): string {
  const statusInfo = STATUS_LABELS_TH[ticket.status];
  const dateStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  if (eventType === 'NEW') {
    return `🚨 [แจ้งซ่อมใหม่] คิว: ${ticket.queueNumber} (${ticket.ticketNumber})
⏰ เวลา: ${dateStr} น.
📌 อุปกรณ์/ปัญหา: ${ticket.title}
🏢 สถานที่: ${ticket.building} ${ticket.floor} (${ticket.roomOrSpot})
🏷️ แผนกผู้แจ้ง: ${ticket.department} (${ticket.requesterName} โทร: ${ticket.contactNumber})
⚡ ความเร่งด่วน: ${PRIORITY_LABELS_TH[ticket.urgency].label}
🔧 สถานะ: ${statusInfo.icon} ${statusInfo.label}
🔗 ตรวจสอบงานได้ในแอป Siri Maintenance & Engineering`;
  }

  if (eventType === 'CLOSED') {
    return `🎉 [ปิดใบแจ้งซ่อมสำเร็จ] ${ticket.ticketNumber} (คิว: ${ticket.queueNumber})
⏰ เวลาปิดงาน: ${dateStr} น.
📌 รายการ: ${ticket.title}
🏢 จุดที่ตั้ง: ${ticket.building} ${ticket.floor} (${ticket.roomOrSpot})
👨‍🔧 ช่างผู้ดูแล: ${ticket.assignedTechnician ? ticket.assignedTechnician.name : 'ทีมช่างส่วนกลาง'}
📝 สรุปการซ่อม: ${ticket.repairNotes || 'ซ่อมแซมและทดสอบเรียบร้อย'}
💰 ค่าใช้จ่ายรวม: ${ticket.totalCost ? ticket.totalCost.toLocaleString() + ' บาท' : 'ไม่มีค่าใช้จ่าย'}
✅ สถานะ: ซ่อมเสร็จสิ้น พร้อมใช้งาน`;
  }

  // STATUS_CHANGE
  return `📢 [อัปเดตสถานะคิวงานซ่อม] ${ticket.ticketNumber} (คิว: ${ticket.queueNumber})
⏰ เวลา: ${dateStr} น.
📌 งาน: ${ticket.title}
🏢 สถานที่: ${ticket.roomOrSpot}
🔄 สถานะใหม่: ${statusInfo.icon} ${statusInfo.label}
${ticket.statusReason ? `💬 เหตุผล/หมายเหตุ: ${ticket.statusReason}` : ''}
👨‍🔧 ช่างผู้รับผิดชอบ: ${ticket.assignedTechnician ? ticket.assignedTechnician.nickname : 'รอจัดสรรช่าง'}
⏳ ประมาณการเสร็จ: ${ticket.estimatedCompletionTime || 'กำลังประเมิน'}`;
}

export const lineService = {
  async sendNotification(
    ticket: RepairTicket,
    eventType: 'NEW' | 'STATUS_CHANGE' | 'CLOSED'
  ): Promise<{ success: boolean; message: string; simulatedLog: LineMessageLog }> {
    const config = storageService.getLineConfig();
    const formattedText = formatLineMessage(ticket, eventType);

    const logEntry: LineMessageLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      recipient: 'กลุ่ม LINE ช่างซ่อมบำรุงประจำอาคาร (Official Tech Group)',
      ticketNumber: ticket.ticketNumber,
      message: formattedText,
      status: 'SENT',
    };

    // Save to storage logs
    storageService.saveLineLog(logEntry);

    // If user configured real Line webhook or notify, we can attempt fetch if no CORS block, or return simulated
    if (config.enabled && config.notifyToken && config.notifyToken !== 'SAMPLE_LINE_NOTIFY_TOKEN') {
      try {
        // Attempt sending via LINE Notify endpoint if configured
        const params = new URLSearchParams();
        params.append('message', formattedText);

        await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${config.notifyToken}`,
          },
          body: params,
          mode: 'no-cors', // handle browser CORS restriction safely
        });
      } catch (err) {
        console.warn('Real LINE fetch skipped or restricted by browser CORS, saved simulated payload:', err);
      }
    }

    // Trigger local CustomEvent so the app UI can display a native-looking LINE toast popup
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('facilifix-line-alert', {
          detail: {
            ticket,
            log: logEntry,
            text: formattedText,
          },
        })
      );
    }

    return {
      success: true,
      message: 'ส่งการแจ้งเตือน LINE ไปยังกลุ่มช่างสำเร็จ',
      simulatedLog: logEntry,
    };
  },
};
