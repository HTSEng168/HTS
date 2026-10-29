import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.resolve(__dirname, 'line-server-config.json');

// System-locked credentials embedded into the application
export const SYSTEM_LOCKED_LINE_TOKEN = 'Dx0V4cHaU9Lt0GvZeST+HwAz6oeghe9YOERflKvYQg3YYeYOJQSXu0+hNdlNMXJcQR/wWhOxFqL1m4K8uGFvDUiwnu8m49ioAC7AkYSBsUSfEQb345/zQZ8Dbb1gEA82maLBoszw/sQFlO4Ng769/wdB04t89/1O/w1cDnyilFU=';
export const SYSTEM_LOCKED_GROUP_ID = 'C855d26f70609970989ec42237d9b8dfd';
export const SYSTEM_LOCKED_BOT_ID = '@985anugd';
export const SYSTEM_LOCKED_BOT_NAME = 'HTS-BOT';

interface ServerLineConfig {
  channelAccessToken: string;
  groupId: string;
  botBasicId: string;
  botName: string;
}

function loadServerConfig(): ServerLineConfig {
  let config: ServerLineConfig = {
    channelAccessToken: SYSTEM_LOCKED_LINE_TOKEN,
    groupId: SYSTEM_LOCKED_GROUP_ID,
    botBasicId: SYSTEM_LOCKED_BOT_ID,
    botName: SYSTEM_LOCKED_BOT_NAME,
  };

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      config = { ...config, ...data };
    }
  } catch (err) {
    console.warn('Could not read line-server-config.json:', err);
  }

  // Guarantee locked values are always present
  if (!config.channelAccessToken) config.channelAccessToken = SYSTEM_LOCKED_LINE_TOKEN;
  if (!config.groupId) config.groupId = SYSTEM_LOCKED_GROUP_ID;
  if (!config.botBasicId || config.botBasicId === '@073vezfu') config.botBasicId = SYSTEM_LOCKED_BOT_ID;
  if (!config.botName || config.botName === 'HTSengineering-BOT') config.botName = SYSTEM_LOCKED_BOT_NAME;

  return config;
}

function saveServerConfig(newConfig: Partial<ServerLineConfig>) {
  try {
    const current = loadServerConfig();
    const updated = { ...current, ...newConfig };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    if (updated.channelAccessToken) {
      process.env.LINE_CHANNEL_ACCESS_TOKEN = updated.channelAccessToken;
    }
    if (updated.groupId) {
      process.env.LINE_TARGET_GROUP_ID = updated.groupId;
    }
    return updated;
  } catch (err) {
    console.error('Failed to write line-server-config.json:', err);
    throw err;
  }
}

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body parser
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Router
  const apiRouter = express.Router();

  // Health check
  apiRouter.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Siri Maintenance & Engineering LINE API Proxy',
      time: new Date().toISOString(),
    });
  });

  // Get current LINE server config (persistent channelAccessToken & groupId)
  apiRouter.get('/line/config', (_req, res) => {
    const current = loadServerConfig();
    const token = current.channelAccessToken || SYSTEM_LOCKED_LINE_TOKEN;
    const tokenPreview = token ? `${token.substring(0, 10)}...${token.substring(token.length - 8)}` : '';
    res.json({
      success: true,
      hasToken: true,
      isLocked: true,
      tokenPreview,
      token, // provided so client can auto-load and avoid manual re-entry
      groupId: current.groupId || SYSTEM_LOCKED_GROUP_ID,
      botBasicId: current.botBasicId || SYSTEM_LOCKED_BOT_ID,
      botName: current.botName || SYSTEM_LOCKED_BOT_NAME,
    });
  });

  // Save Channel Access Token and Group ID permanently to server config
  apiRouter.post('/line/save-token', async (req, res) => {
    try {
      const { channelAccessToken, groupId } = req.body;
      if (channelAccessToken === undefined && groupId === undefined) {
        return res.status(400).json({ success: false, error: 'กรุณาระบุข้อมูลที่ต้องการบันทึก' });
      }

      const payload: Partial<ServerLineConfig> = {};
      if (channelAccessToken !== undefined) {
        payload.channelAccessToken = String(channelAccessToken).trim();
      }
      if (groupId !== undefined) {
        payload.groupId = String(groupId).trim() || 'C855d26f70609970989ec42237d9b8dfd';
      }

      const updated = saveServerConfig(payload);

      let botInfo = null;
      let verifyWarning = null;
      if (updated.channelAccessToken) {
        try {
          const verifyRes = await fetch('https://api.line.me/v2/bot/info', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${updated.channelAccessToken}`,
            },
          });
          if (verifyRes.ok) {
            botInfo = await verifyRes.json();
            if (botInfo.basicId) updated.botBasicId = botInfo.basicId;
            if (botInfo.displayName) updated.botName = botInfo.displayName;
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
          } else {
            const errData = await verifyRes.json().catch(() => ({}));
            verifyWarning = (errData as any)?.message || 'Token อาจไม่ถูกต้องหรือหมดอายุ';
          }
        } catch (e: any) {
          verifyWarning = e?.message;
        }
      }

      return res.json({
        success: true,
        message: 'บันทึก Channel Access Token (Long-lived) ถาวรลงเซิร์ฟเวอร์เรียบร้อยแล้ว',
        hasToken: !!updated.channelAccessToken,
        token: updated.channelAccessToken,
        tokenPreview: updated.channelAccessToken ? `${updated.channelAccessToken.substring(0, 10)}...` : '',
        groupId: updated.groupId,
        bot: botInfo,
        warning: verifyWarning,
      });
    } catch (err: any) {
      console.error('Error saving line token:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'ไม่สามารถบันทึก Channel Access Token ได้',
      });
    }
  });

  // Verify / Test Channel Access Token & Get Bot Info
  apiRouter.post('/line/bot-info', async (req, res) => {
    try {
      const { channelAccessToken } = req.body;
      const serverCfg = loadServerConfig();
      const token = (channelAccessToken || serverCfg.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'ยังไม่ได้ระบุหรือบันทึก Channel Access Token ในระบบ',
        });
      }

      const response = await fetch('https://api.line.me/v2/bot/info', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: (data as any)?.message || 'ไม่สามารถเชื่อมต่อ LINE Bot ได้ กรุณาตรวจสอบ Token',
          details: data,
        });
      }

      return res.json({
        success: true,
        bot: data,
      });
    } catch (err: any) {
      console.error('Error fetching LINE bot info:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE Messaging API',
      });
    }
  });

  // Push Message to specific User ID or Group ID
  apiRouter.post('/line/push', async (req, res) => {
    try {
      const { channelAccessToken, to, messages } = req.body;
      const serverCfg = loadServerConfig();
      const token = (channelAccessToken || serverCfg.channelAccessToken || SYSTEM_LOCKED_LINE_TOKEN).trim();
      const targetTo = (to || serverCfg.groupId || SYSTEM_LOCKED_GROUP_ID).trim();

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'ยังไม่ได้บันทึก Channel Access Token (Long-lived) ในระบบ กรุณาบันทึกโทเคนก่อนส่งข้อความ',
        });
      }

      if (!targetTo) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุ Target ID (User ID หรือ Group ID)',
        });
      }

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุข้อความที่ต้องการส่ง (messages array)',
        });
      }

      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: targetTo,
          messages: messages.slice(0, 5), // LINE allows max 5 messages per call
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If push failed (e.g. 400 Failed to send messages because bot has not been invited to group yet)
        // Automatically fallback to Broadcast so messages are never lost!
        try {
          const broadcastRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              messages: messages.slice(0, 5),
            }),
          });
          const broadcastData = await broadcastRes.json().catch(() => ({}));

          if (broadcastRes.ok) {
            console.log('✅ Fallback to Broadcast succeeded for LINE message');
            return res.json({
              success: true,
              deliveredVia: 'broadcast',
              message: 'ส่งแจ้งเตือนเข้า LINE สำเร็จ (ระบบบรอดแคสต์ส่งถึงช่างทุกคนอัตโนมัติ)',
              warning: `บอท HTS-BOT (@985anugd) ยังไม่ได้อยู่ในกลุ่ม LINE (${targetTo}) ระบบจึงบรอดแคสต์ส่งตรงถึงช่างและผู้ติดตามทุกคนแทน เพื่อให้ได้รับข้อมูลแน่นอน 100% • คำแนะนำ: เชิญบอท @985anugd เข้ากลุ่ม LINE เพื่อให้ข้อความแสดงในกลุ่ม`,
              data: broadcastData,
            });
          }
        } catch (bErr) {
          console.warn('Fallback broadcast failed:', bErr);
        }

        let userFriendlyError = (data as any)?.message || 'ส่งข้อความ LINE Push ไม่สำเร็จ';
        if (userFriendlyError === 'Failed to send messages') {
          userFriendlyError = `บอท HTS-BOT (@985anugd) ยังไม่ได้รับเชิญเข้ากลุ่ม LINE (${targetTo}) หรือยังไม่ได้เปิดอนุญาตให้บอทเข้ากลุ่มใน LINE Official Account Manager กรุณาเชิญบอท @985anugd เข้ากลุ่ม`;
        }

        return res.status(response.status).json({
          success: false,
          error: userFriendlyError,
          details: data,
        });
      }

      return res.json({
        success: true,
        deliveredVia: 'push',
        message: 'ส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE สำเร็จ',
        target: targetTo,
        data,
      });
    } catch (err: any) {
      console.error('Error in LINE Push API:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'เกิดข้อผิดพลาดในการส่งข้อความ LINE Push',
      });
    }
  });

  // Broadcast Message to all friends/followers of the bot (e.g. @073vezfu)
  apiRouter.post('/line/broadcast', async (req, res) => {
    try {
      const { channelAccessToken, messages } = req.body;
      const serverCfg = loadServerConfig();
      const token = (channelAccessToken || serverCfg.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'ยังไม่ได้บันทึก Channel Access Token ในระบบ',
        });
      }

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุข้อความที่ต้องการบรอดแคสต์',
        });
      }

      const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messages.slice(0, 5),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: (data as any)?.message || 'ส่งข้อความ Broadcast ไม่สำเร็จ',
          details: data,
        });
      }

      return res.json({
        success: true,
        message: 'ส่งข้อความบรอดแคสต์ไปยังผู้ติดตามบอททุกคนสำเร็จ',
        data,
      });
    } catch (err: any) {
      console.error('Error in LINE Broadcast API:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'เกิดข้อผิดพลาดในการส่ง Broadcast',
      });
    }
  });

  // Multicast Message to specific list of user IDs
  apiRouter.post('/line/multicast', async (req, res) => {
    try {
      const { channelAccessToken, to, messages } = req.body;
      const serverCfg = loadServerConfig();
      const token = (channelAccessToken || serverCfg.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'ยังไม่ได้บันทึก Channel Access Token ในระบบ',
        });
      }

      if (!Array.isArray(to) || to.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุรายชื่อ User ID ใน to array',
        });
      }

      const response = await fetch('https://api.line.me/v2/bot/message/multicast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: to.map((id: string) => id.trim()),
          messages: messages.slice(0, 5),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: (data as any)?.message || 'ส่งข้อความ Multicast ไม่สำเร็จ',
          details: data,
        });
      }

      return res.json({
        success: true,
        message: 'ส่งข้อความ Multicast ไปยังช่างที่ระบุสำเร็จ',
        data,
      });
    } catch (err: any) {
      console.error('Error in LINE Multicast API:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'เกิดข้อผิดพลาดในการส่ง Multicast',
      });
    }
  });

  // Webhook receiver for LINE Bot (supports verify ping, group join, and auto-detecting group ID)
  apiRouter.post('/line/webhook', (req, res) => {
    try {
      console.log('Received LINE Webhook event:', JSON.stringify(req.body, null, 2));
      const events = req.body?.events || [];
      for (const ev of events) {
        if (ev.source?.groupId) {
          const detectedGroupId = String(ev.source.groupId).trim();
          console.log(`🎯 Auto-detected active LINE Group ID from webhook: ${detectedGroupId}`);
          saveServerConfig({ groupId: detectedGroupId });
        }
      }
    } catch (err) {
      console.warn('Error processing webhook event:', err);
    }
    res.status(200).json({ status: 'ok' });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Serve static assets or mount Vite in development mode
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
