import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Verify / Test Channel Access Token & Get Bot Info
  apiRouter.post('/line/bot-info', async (req, res) => {
    try {
      const { channelAccessToken } = req.body;
      const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุ Channel Access Token',
        });
      }

      const response = await fetch('https://api.line.me/v2/bot/info', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
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
      const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุ Channel Access Token',
        });
      }

      if (!to) {
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
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          to: to.trim(),
          messages: messages.slice(0, 5), // LINE allows max 5 messages per call
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: (data as any)?.message || 'ส่งข้อความ LINE Push ไม่สำเร็จ',
          details: data,
        });
      }

      return res.json({
        success: true,
        message: 'ส่งข้อความแจ้งเตือนผ่าน LINE สำเร็จ',
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
      const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุ Channel Access Token',
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
          Authorization: `Bearer ${token.trim()}`,
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
      const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุ Channel Access Token',
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
          Authorization: `Bearer ${token.trim()}`,
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

  // Webhook receiver for LINE Bot (supports verify ping and basic greeting)
  apiRouter.post('/line/webhook', (req, res) => {
    console.log('Received LINE Webhook event:', JSON.stringify(req.body, null, 2));
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
