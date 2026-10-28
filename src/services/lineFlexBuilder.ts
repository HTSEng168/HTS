import { RepairTicket, TicketStatus } from '../types';
import { STATUS_LABELS_TH, PRIORITY_LABELS_TH } from './lineService';

const LOGO_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; // fallback icon or app logo

export function createTicketFlexMessage(
  ticket: RepairTicket,
  eventType: 'NEW' | 'STATUS_CHANGE' | 'CLOSED'
) {
  const statusInfo = STATUS_LABELS_TH[ticket.status];
  const priorityInfo = PRIORITY_LABELS_TH[ticket.urgency];
  const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

  let headerTitle = '🚨 แจ้งซ่อมใหม่ (New Ticket)';
  let headerColor = '#0284c7'; // sky-600
  let badgeColor = '#0ea5e9';

  if (eventType === 'STATUS_CHANGE') {
    headerTitle = '🔄 อัปเดตสถานะคิวงานซ่อม';
    if (ticket.status === 'IN_PROGRESS') {
      headerColor = '#4f46e5'; // indigo
    } else if (ticket.status === 'WAITING_PARTS') {
      headerColor = '#ea580c'; // orange
    } else if (ticket.status === 'TECH_BUSY') {
      headerColor = '#e11d48'; // rose
    } else if (ticket.status === 'NEXT_QUEUE') {
      headerColor = '#2563eb'; // blue
    }
  } else if (eventType === 'CLOSED') {
    headerTitle = '✅ ปิดใบแจ้งซ่อมสำเร็จ (Closed)';
    headerColor = '#059669'; // emerald
  }

  if (ticket.urgency === 'CRITICAL' && eventType === 'NEW') {
    headerColor = '#dc2626'; // red
    badgeColor = '#ef4444';
  } else if (ticket.urgency === 'URGENT' && eventType === 'NEW') {
    headerColor = '#d97706'; // amber
    badgeColor = '#f59e0b';
  }

  // Construct Flex Bubble
  const bubble: any = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: headerColor,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: 'SIRI MAINTENANCE & ENGINEERING',
              weight: 'bold',
              color: '#ffffff',
              size: 'xxs',
              flex: 3,
            },
            {
              type: 'text',
              text: ticket.queueNumber || 'Q-00',
              weight: 'bold',
              color: '#ffffff',
              align: 'end',
              size: 'xs',
              flex: 1,
            },
          ],
        },
        {
          type: 'text',
          text: headerTitle,
          weight: 'bold',
          color: '#ffffff',
          size: 'md',
          margin: 'sm',
        },
        {
          type: 'text',
          text: `ใบงาน: ${ticket.ticketNumber} • ${dateStr} ${timeStr} น.`,
          size: 'xxs',
          color: '#ffffffcc',
          margin: 'xs',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      contents: [
        // Title
        {
          type: 'text',
          text: ticket.title,
          weight: 'bold',
          size: 'sm',
          wrap: true,
          color: '#0f172a',
        },
        // Urgency and Status Badges
        {
          type: 'box',
          layout: 'horizontal',
          margin: 'md',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: `${statusInfo.icon} ${statusInfo.label}`,
                  size: 'xs',
                  color: '#ffffff',
                  weight: 'bold',
                  align: 'center',
                },
              ],
              backgroundColor: '#334155',
              cornerRadius: '6px',
              paddingAll: '4px',
              flex: 2,
            },
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: `ระดับ: ${priorityInfo.label}`,
                  size: 'xs',
                  color: '#ffffff',
                  weight: 'bold',
                  align: 'center',
                },
              ],
              backgroundColor: badgeColor,
              cornerRadius: '6px',
              paddingAll: '4px',
              flex: 2,
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
        },
        // Details List
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🏢 สถานที่',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: `${ticket.building} ${ticket.floor} (${ticket.roomOrSpot})`,
                  size: 'xs',
                  color: '#1e293b',
                  wrap: true,
                  weight: 'bold',
                  flex: 5,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🏷️ ผู้แจ้ง',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: `${ticket.requesterName} (${ticket.department}) โทร: ${ticket.contactNumber}`,
                  size: 'xs',
                  color: '#1e293b',
                  wrap: true,
                  flex: 5,
                },
              ],
            },
            ticket.assetCode
              ? {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '⚙️ รหัสเครื่อง',
                      size: 'xs',
                      color: '#64748b',
                      flex: 2,
                    },
                    {
                      type: 'text',
                      text: ticket.assetCode,
                      size: 'xs',
                      color: '#0284c7',
                      weight: 'bold',
                      flex: 5,
                    },
                  ],
                }
              : null,
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '👨‍🔧 ช่างดูแล',
                  size: 'xs',
                  color: '#64748b',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: ticket.assignedTechnician
                    ? `${ticket.assignedTechnician.nickname} (${ticket.assignedTechnician.name}) โทร: ${ticket.assignedTechnician.phone}`
                    : 'ทีมช่างส่วนกลาง (กำลังจัดสรร)',
                  size: 'xs',
                  color: '#047857',
                  weight: 'bold',
                  wrap: true,
                  flex: 5,
                },
              ],
            },
            ticket.statusReason
              ? {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '💬 หมายเหตุ',
                      size: 'xs',
                      color: '#64748b',
                      flex: 2,
                    },
                    {
                      type: 'text',
                      text: ticket.statusReason,
                      size: 'xs',
                      color: '#475569',
                      wrap: true,
                      flex: 5,
                    },
                  ],
                }
              : null,
            // Closure notes if closed
            eventType === 'CLOSED' && ticket.repairNotes
              ? {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '📝 สรุปงาน',
                      size: 'xs',
                      color: '#64748b',
                      flex: 2,
                    },
                    {
                      type: 'text',
                      text: ticket.repairNotes,
                      size: 'xs',
                      color: '#0f172a',
                      wrap: true,
                      weight: 'bold',
                      flex: 5,
                    },
                  ],
                }
              : null,
            eventType === 'CLOSED' && ticket.totalCost !== undefined
              ? {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '💰 ค่าใช้จ่าย',
                      size: 'xs',
                      color: '#64748b',
                      flex: 2,
                    },
                    {
                      type: 'text',
                      text: ticket.totalCost > 0 ? `${ticket.totalCost.toLocaleString()} บาท` : 'ไม่มีค่าใช้จ่ายเพิ่มเติม',
                      size: 'xs',
                      color: '#059669',
                      weight: 'bold',
                      flex: 5,
                    },
                  ],
                }
              : null,
          ].filter(Boolean),
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          color: headerColor,
          action: {
            type: 'uri',
            label: '📱 เปิดดูสถานะในแอปพลิเคชัน',
            uri: 'https://line.me/R/ti/p/@073vezfu', // direct to LINE OA or web app
          },
        },
      ],
    },
  };

  // If ticket has image URL that is web-accessible (https://)
  if (ticket.photoUrl && ticket.photoUrl.startsWith('https://')) {
    bubble.hero = {
      type: 'image',
      url: ticket.photoUrl,
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
    };
  }

  const altText = `[Siri Maintenance] ${headerTitle}: ${ticket.queueNumber} (${ticket.title}) - สถานะ: ${statusInfo.label}`;

  return {
    type: 'flex',
    altText,
    contents: bubble,
  };
}

export function createTestFlexMessage(botName: string, botBasicId: string) {
  return {
    type: 'flex',
    altText: `ทดสอบเชื่อมต่อ LINE Messaging API สำเร็จ (${botName} ${botBasicId})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#06C755',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'SIRI MAINTENANCE & ENGINEERING',
            weight: 'bold',
            color: '#ffffff',
            size: 'xxs',
          },
          {
            type: 'text',
            text: '🎉 เชื่อมต่อ Messaging API สำเร็จ!',
            weight: 'bold',
            color: '#ffffff',
            size: 'md',
            margin: 'sm',
          },
          {
            type: 'text',
            text: `บอท: ${botName} (${botBasicId})`,
            color: '#ffffffcc',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'ระบบส่งข้อความแจ้งเตือนผ่าน LINE Messaging API ทำงานได้สมบูรณ์แล้ว',
            wrap: true,
            size: 'xs',
            color: '#334155',
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '👨‍🔧 ทีมช่างประจำระบบ:',
                weight: 'bold',
                size: 'xs',
                color: '#0f172a',
              },
              {
                type: 'text',
                text: '• ช่างทู (นายธวัช สำราญจิตร์) — โทร 062-185-6163',
                size: 'xxs',
                color: '#475569',
              },
              {
                type: 'text',
                text: '• ช่างต๊ะ (นายธนพนธ์ พันธ์ฟัก) — โทร 081-131-9756',
                size: 'xxs',
                color: '#475569',
              },
              {
                type: 'text',
                text: '⚡ พร้อมแจ้งเตือน: แจ้งซ่อมใหม่ / จัดคิว / เปลี่ยนสถานะ / ปิดใบงาน',
                size: 'xxs',
                color: '#0284c7',
                margin: 'sm',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: '#06C755',
            action: {
              type: 'uri',
              label: '✅ ตรวจสอบระบบเรียบร้อย',
              uri: `https://line.me/R/ti/p/${botBasicId}`,
            },
          },
        ],
      },
    },
  };
}
