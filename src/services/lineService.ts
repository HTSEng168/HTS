import { RepairTicket, LineMessageLog, TicketStatus, LineNotificationConfig } from '../types';
import { storageService } from './storageService';
import { createTicketFlexMessage, createTestFlexMessage } from './lineFlexBuilder';

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
👨‍🔧 ช่างผู้ดูแล: ${ticket.assignedTechnician ? ticket.assignedTechnician.nickname : 'รอจัดสรรช่าง'}
📱 ตรวจสอบงานได้ในแอป Siri Maintenance & Engineering`;
  }

  if (eventType === 'CLOSED') {
    return `🎉 [ปิดใบแจ้งซ่อมสำเร็จ] ${ticket.ticketNumber} (คิว: ${ticket.queueNumber})
⏰ เวลาปิดงาน: ${dateStr} น.
📌 รายการ: ${ticket.title}
🏢 จุดที่ตั้ง: ${ticket.building} ${ticket.floor} (${ticket.roomOrSpot})
👨‍🔧 ช่างผู้ดูแล: ${ticket.assignedTechnician ? `${ticket.assignedTechnician.nickname} (${ticket.assignedTechnician.name})` : 'ทีมช่างส่วนกลาง'}
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
${ticket.statusReason ? `💬 หมายเหตุ: ${ticket.statusReason}` : ''}
👨‍🔧 ช่างผู้รับผิดชอบ: ${ticket.assignedTechnician ? `${ticket.assignedTechnician.nickname} (${ticket.assignedTechnician.name})` : 'รอจัดสรรช่าง'}
⏳ ประมาณการเสร็จ: ${ticket.estimatedCompletionTime || 'กำลังประเมิน'}`;
}

export const lineService = {
  // Test connection to LINE Bot info (@073vezfu / HTSengineering-BOT)
  async verifyBotConnection(channelAccessToken: string): Promise<{ success: boolean; bot?: any; error?: string }> {
    try {
      const res = await fetch('/api/line/bot-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelAccessToken: channelAccessToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'เชื่อมต่อบอทไม่สำเร็จ กรุณาตรวจสอบ Token' };
      }
      return { success: true, bot: data.bot };
    } catch (err: any) {
      return { success: false, error: err.message || 'ไม่สามารถติดต่อเซอร์เวอร์ API Proxy ได้' };
    }
  },

  // Send real test message via Messaging API
  async sendTestNotification(config: LineNotificationConfig): Promise<{ success: boolean; message: string }> {
    const targetGroupId = (config.groupId || config.defaultTargetId || 'C2f466a90ac4f15b1f9231c889e23d3d7').trim();
    const token = config.channelAccessToken?.trim();

    const flexMsg = createTestFlexMessage(config.botName, config.botBasicId);
    const textMsg = {
      type: 'text',
      text: `🎉 [Siri Maintenance] ทดสอบเชื่อมต่อ LINE สำเร็จ! ส่งข้อมูลแจ้งซ่อมเข้ากลุ่ม ID: ${targetGroupId} อัตโนมัติ (บอท ${config.botName})`,
    };
    const messages = config.useFlexMessage ? [flexMsg, textMsg] : [textMsg];

    let endpoint = '/api/line/push';
    let targetId = targetGroupId;
    let recipientLabel = `กลุ่ม LINE ช่างซ่อม (Group ID: ${targetGroupId})`;
    let modeType: 'MESSAGING_API_PUSH' | 'MESSAGING_API_BROADCAST' = 'MESSAGING_API_PUSH';

    if (config.sendMode === 'broadcast') {
      endpoint = '/api/line/broadcast';
      recipientLabel = `ผู้ติดตามบอท ${config.botBasicId} (Broadcast)`;
      modeType = 'MESSAGING_API_BROADCAST';
    } else if (config.sendMode === 'push') {
      endpoint = '/api/line/push';
      targetId = config.defaultTargetId || targetGroupId;
      recipientLabel = `LINE ID: ${targetId}`;
    } else {
      // default: 'group'
      endpoint = '/api/line/push';
      targetId = targetGroupId;
      recipientLabel = `กลุ่ม LINE ช่างซ่อม (Group ID: ${targetGroupId})`;
    }

    try {
      const payload: any = { messages };
      if (token) payload.channelAccessToken = token;
      if (config.sendMode !== 'broadcast') payload.to = targetId;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok && resData.success) {
        const logEntry: LineMessageLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          recipient: recipientLabel,
          ticketNumber: 'TEST-CONNECTION',
          message: `[ทดสอบจริงผ่าน Messaging API] ส่งเข้า ${recipientLabel} สำเร็จ`,
          status: 'SENT',
          mode: modeType,
          flexPreview: flexMsg,
        };
        storageService.saveLineLog(logEntry);

        return {
          success: true,
          message: `🚀 ส่งข้อความทดสอบจริงเข้ากลุ่ม LINE (${targetGroupId}) สำเร็จเรียบร้อย!`,
        };
      }

      // If token missing on both client and server, simulate
      if (res.status === 400 && String(resData.error || '').includes('Token')) {
        const dummyLog: LineMessageLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          recipient: `${recipientLabel} [โหมดจำลอง - ยังไม่ได้บันทึก Token]`,
          ticketNumber: 'TEST-SIMULATED',
          message: `[ทดสอบจำลอง] ระบบพร้อมส่งเข้ากลุ่ม ${targetGroupId} (รอวาง Channel Access Token และกดบันทึกถาวร)`,
          status: 'SIMULATED',
          mode: 'SIMULATED',
          flexPreview: flexMsg,
        };
        storageService.saveLineLog(dummyLog);

        return {
          success: true,
          message: `💡 โหมดจำลองทำงานสมบูรณ์! เมื่อคุณวาง Channel Access Token (Long-lived) แล้วกด "บันทึกถาวรลงระบบ" ข้อความจะยิงเข้ากลุ่ม LINE ${targetGroupId} จริงทันที`,
        };
      }

      return {
        success: false,
        message: resData.error || `ส่งไม่สำเร็จ กรุณาตรวจสอบว่าเชิญบอท ${config.botBasicId || '@985anugd'} (${config.botName || 'HTS-BOT'}) เข้ากลุ่ม ${targetGroupId} แล้วหรือยัง`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'}`,
      };
    }
  },

  // Main notification dispatcher called on ticket create, update, or closure
  async sendNotification(
    ticket: RepairTicket,
    eventType: 'NEW' | 'STATUS_CHANGE' | 'CLOSED'
  ): Promise<{ success: boolean; message: string; simulatedLog: LineMessageLog }> {
    const config = storageService.getLineConfig();
    const defaultGroup = config.groupId || config.defaultTargetId || 'C2f466a90ac4f15b1f9231c889e23d3d7';

    if (!config.enabled) {
      return {
        success: false,
        message: 'ระบบแจ้งเตือน LINE ปิดใช้งานอยู่',
        simulatedLog: {} as LineMessageLog,
      };
    }

    // Check trigger rules
    if (eventType === 'NEW' && !config.autoNotifyOnCreate) {
      return { success: true, message: 'ข้ามการแจ้งเตือนตามการตั้งค่า', simulatedLog: {} as LineMessageLog };
    }
    if (eventType === 'STATUS_CHANGE' && !config.autoNotifyOnStatusChange) {
      return { success: true, message: 'ข้ามการแจ้งเตือนตามการตั้งค่า', simulatedLog: {} as LineMessageLog };
    }
    if (eventType === 'CLOSED' && !config.autoNotifyOnClose) {
      return { success: true, message: 'ข้ามการแจ้งเตือนตามการตั้งค่า', simulatedLog: {} as LineMessageLog };
    }

    const formattedText = formatLineMessage(ticket, eventType);
    const flexMessage = createTicketFlexMessage(ticket, eventType);

    let sentReal = false;
    let recipientDesc = `กลุ่ม LINE ช่างซ่อม (Group ID: ${defaultGroup})`;
    let logStatus: 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
    let logMode: 'MESSAGING_API_PUSH' | 'MESSAGING_API_BROADCAST' | 'LINE_NOTIFY' | 'SIMULATED' = 'SIMULATED';

    // 1. If LINE Messaging API mode
    if (config.apiMode === 'messaging_api') {
      try {
        const messages = config.useFlexMessage
          ? [flexMessage]
          : [{ type: 'text', text: formattedText }];

        // Check assigned technician lineId
        const techLineId = ticket.assignedTechnician?.id === 'TECH-01' 
          ? (config.tech1LineId || (ticket.assignedTechnician as any)?.lineUserId)
          : ticket.assignedTechnician?.id === 'TECH-02'
          ? (config.tech2LineId || (ticket.assignedTechnician as any)?.lineUserId)
          : (ticket.assignedTechnician as any)?.lineUserId;

        const tokenPayload = config.channelAccessToken?.trim() ? config.channelAccessToken.trim() : undefined;

        if (config.sendMode === 'group' || (!config.sendMode && defaultGroup)) {
          // Default Mode: Send directly to the specified LINE Group ID
          const response = await fetch('/api/line/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelAccessToken: tokenPayload,
              to: defaultGroup.trim(),
              messages,
            }),
          });
          const resJson = await response.json().catch(() => ({}));
          if (response.ok && resJson.success) {
            sentReal = true;
            recipientDesc = `กลุ่ม LINE (ID: ${defaultGroup})`;
            logStatus = 'SENT';
            logMode = 'MESSAGING_API_PUSH';
          }
        } else if (config.sendMode === 'technician_target' && techLineId) {
          // Push directly to technician
          const response = await fetch('/api/line/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelAccessToken: tokenPayload,
              to: techLineId.trim(),
              messages,
            }),
          });
          const resJson = await response.json().catch(() => ({}));
          if (response.ok && resJson.success) {
            sentReal = true;
            recipientDesc = `ช่าง ${ticket.assignedTechnician?.nickname} (${techLineId})`;
            logStatus = 'SENT';
            logMode = 'MESSAGING_API_PUSH';
          }
        } else if (config.sendMode === 'push' && config.defaultTargetId) {
          // Push to configured User ID or Group ID
          const response = await fetch('/api/line/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelAccessToken: tokenPayload,
              to: config.defaultTargetId.trim(),
              messages,
            }),
          });
          const resJson = await response.json().catch(() => ({}));
          if (response.ok && resJson.success) {
            sentReal = true;
            recipientDesc = `LINE Target: ${config.defaultTargetId}`;
            logStatus = 'SENT';
            logMode = 'MESSAGING_API_PUSH';
          }
        } else {
          // Broadcast to all bot friends
          const response = await fetch('/api/line/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelAccessToken: tokenPayload,
              messages,
            }),
          });
          const resJson = await response.json().catch(() => ({}));
          if (response.ok && resJson.success) {
            sentReal = true;
            recipientDesc = `บรอดแคสต์บอท ${config.botBasicId} (ทุกคนที่แอดไลน์)`;
            logStatus = 'SENT';
            logMode = 'MESSAGING_API_BROADCAST';
          }
        }
      } catch (err) {
        console.warn('Real LINE Messaging API fetch failed, falling back to simulated:', err);
      }
    } else if (config.apiMode === 'notify' && config.notifyToken && config.notifyToken !== 'SAMPLE_LINE_NOTIFY_TOKEN') {
      // Legacy LINE Notify
      try {
        const params = new URLSearchParams();
        params.append('message', formattedText);
        await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${config.notifyToken.trim()}`,
          },
          body: params,
          mode: 'no-cors',
        });
        sentReal = true;
        recipientDesc = 'LINE Notify Group';
        logStatus = 'SENT';
        logMode = 'LINE_NOTIFY';
      } catch (err) {
        console.warn('LINE Notify request failed:', err);
      }
    }

    const logEntry: LineMessageLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      recipient: recipientDesc,
      ticketNumber: ticket.ticketNumber,
      message: formattedText,
      status: logStatus,
      mode: logMode,
      flexPreview: flexMessage,
    };

    // Save to storage
    storageService.saveLineLog(logEntry);

    // Trigger local CustomEvent so app displays real-time banner
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('facilifix-line-alert', {
          detail: {
            ticket,
            log: logEntry,
            text: formattedText,
            sentReal,
            botBasicId: config.botBasicId,
          },
        })
      );
    }

    return {
      success: true,
      message: sentReal
        ? `ส่งการแจ้งเตือนผ่าน LINE Messaging API (@073vezfu) สำเร็จ!`
        : `บันทึกการแจ้งเตือนจำลองสำเร็จ (พร้อมส่งจริงเมื่อใส่ Channel Access Token)`,
      simulatedLog: logEntry,
    };
  },
};
