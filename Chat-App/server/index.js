import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============ 限流中间件 ============

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 分钟
  max: 60, // 每个 IP 最多 60 次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试', code: 'RATE_LIMITED' }
});

const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 分钟
  max: 10, // 每个 IP 最多 10 次上传
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '上传过于频繁，请稍后再试', code: 'RATE_LIMITED' }
});

// 应用限流到 API 路由
app.use('/api/', apiLimiter);
app.use('/api/upload', uploadLimiter);

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 生产环境：托管前端构建文件
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const clientDist = path.join(__dirname, '../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    console.log('[部署] 前端静态文件已加载');
  }
}

// ============ 文件上传配置 ============

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
                       'application/pdf', 'text/plain',
                       'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'application/zip', 'application/x-rar-compressed'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`));
    }
  }
});

// ============ 全局错误中间件 ============

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || '服务器内部错误';
  console.error(`[错误] ${status} - ${message}`);
  res.status(status).json({ error: message, code: err.code || 'INTERNAL_ERROR' });
});

// ============ 输入校验工具 ============

const VALID_USERNAME = /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_CHANNEL_LENGTH = 50;
const VALID_CHANNEL = /^[a-zA-Z0-9_\-]{1,50}$/;

function validateUsername(name) {
  if (!name || !VALID_USERNAME.test(name)) {
    return '用户名需为 1-20 个字符（字母、数字、中文、下划线）';
  }
  return null;
}

function validateMessage(content) {
  if (!content || !content.trim()) return '消息不能为空';
  if (content.length > MAX_MESSAGE_LENGTH) return `消息不能超过 ${MAX_MESSAGE_LENGTH} 个字符`;
  return null;
}

function validateChannelName(name) {
  if (!name || !VALID_CHANNEL.test(name)) return '频道名需为 1-50 个字符（字母、数字、下划线、连字符）';
  return null;
}

// ============ REST API ============

// 文件上传
app.post('/api/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: '文件大小不能超过 10MB', code: 'FILE_TOO_LARGE' });
        }
        return res.status(400).json({ error: err.message, code: 'UPLOAD_ERROR' });
      }
      return res.status(400).json({ error: err.message, code: 'FILE_TYPE_ERROR' });
    }
    if (!req.file) return res.status(400).json({ error: '请选择文件', code: 'NO_FILE' });

    res.json({
      url: `/uploads/${req.file.filename}`,
      name: encodeURIComponent(req.file.originalname),
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// 获取历史消息
app.get('/api/messages', asyncHandler(async (req, res) => {
  const channel = req.query.channel || 'general';
  const messages = db.prepare(
    'SELECT * FROM messages WHERE channel = ? AND target_user IS NULL ORDER BY created_at ASC LIMIT 100'
  ).all(channel);
  res.json(messages);
}));

// 搜索消息（LIKE 模糊匹配，支持中文子串搜索）
app.get('/api/messages/search', asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  const channel = req.query.channel || 'general';
  const username = req.query.username || '';
  if (!q) return res.json([]);

  const pattern = `%${q}%`;
  const messages = db.prepare(
    `SELECT * FROM messages WHERE channel = ? AND (target_user IS NULL OR username = ? OR target_user = ?) AND content LIKE ? ORDER BY created_at DESC LIMIT 50`
  ).all(channel, username, username, pattern);
  res.json(messages);
}));

// 编辑消息
app.put('/api/messages/:id', asyncHandler(async (req, res) => {
  const msgId = parseInt(req.params.id);
  const { content, username } = req.body;

  const err = validateMessage(content);
  if (err) return res.status(400).json({ error: err, code: 'INVALID_CONTENT' });

  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
  if (!msg) return res.status(404).json({ error: '消息不存在', code: 'NOT_FOUND' });
  if (msg.username !== username) return res.status(403).json({ error: '只能编辑自己的消息', code: 'FORBIDDEN' });

  db.prepare('UPDATE messages SET content = ?, edited = 1, updated_at = ? WHERE id = ?')
    .run(content.trim(), new Date().toISOString(), msgId);

  const updated = db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
  io.to(msg.channel).emit('message:updated', updated);
  res.json(updated);
}));

// 删除消息
app.delete('/api/messages/:id', asyncHandler(async (req, res) => {
  const msgId = parseInt(req.params.id);
  const { username } = req.body;

  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
  if (!msg) return res.status(404).json({ error: '消息不存在', code: 'NOT_FOUND' });
  if (msg.username !== username) return res.status(403).json({ error: '只能删除自己的消息', code: 'FORBIDDEN' });

  db.prepare('DELETE FROM messages WHERE id = ?').run(msgId);
  io.to(msg.channel).emit('message:deleted', { id: msgId, channel: msg.channel });
  res.json({ success: true });
}));

// 获取频道列表
app.get('/api/channels', asyncHandler(async (req, res) => {
  const channels = db.prepare('SELECT * FROM channels ORDER BY name ASC').all();
  res.json(channels);
}));

// 获取在线用户
app.get('/api/users/online', (req, res) => {
  res.json(Array.from(onlineUsers.values()).map(u => u.username));
});

// ============ Socket.IO ============

const onlineUsers = new Map(); // socketId -> { username, channel }

io.on('connection', (socket) => {
  console.log(`[连接] ${socket.id}`);

  // 用户登录
  socket.on('user:login', (username) => {
    const validationError = validateUsername(username);
    if (validationError) {
      socket.emit('error:login', validationError);
      return;
    }

    // 检查用户名是否已在线
    for (const [, user] of onlineUsers) {
      if (user.username === username) {
        socket.emit('error:login', '该用户名已在线');
        return;
      }
    }

    onlineUsers.set(socket.id, { username, channel: 'general' });
    socket.username = username;
    socket.channel = 'general';

    socket.join('general');

    io.emit('users:online', Array.from(onlineUsers.values()).map(u => u.username));
    socket.broadcast.emit('system:message', {
      content: `${username} 加入了聊天`,
      type: 'system'
    });

    console.log(`[登录] ${username}`);
  });

  // 发送消息
  socket.on('message:send', (data) => {
    const { content, type = 'text', targetUser, channel, fileUrl, fileName, fileSize } = data;
    const username = socket.username;
    if (!username) return;

    if (type === 'file') {
      if (!fileUrl) {
        socket.emit('error:message', '文件信息缺失');
        return;
      }
    } else {
      const msgErr = validateMessage(content);
      if (msgErr) {
        socket.emit('error:message', msgErr);
        return;
      }
    }

    let targetChannel = channel || 'general';
    if (targetChannel === '') targetChannel = 'general';

    // 私聊：先检查对方是否在线
    let targetSocket = null;
    if (targetUser) {
      targetSocket = findSocketByUsername(targetUser);
      if (!targetSocket) {
        socket.emit('error:message', '用户不在线');
        return;
      }
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO messages (username, content, type, channel, target_user, file_url, file_name, file_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const result = stmt.run(
        username, (content || '').trim(), type, targetChannel,
        targetUser || null, fileUrl || null, fileName || null,
        fileSize || null
      );

      const message = {
        id: result.lastInsertRowid,
        username, content: (content || '').trim(), type,
        channel: targetChannel, target_user: targetUser || null,
        file_url: fileUrl || null, file_name: fileName || null,
        file_size: fileSize || null, edited: 0, created_at: new Date().toISOString(), updated_at: null
      };

      if (targetUser) {
        io.to(targetSocket).emit('message:new', message);
        socket.emit('message:new', message);
      } else {
        io.to(targetChannel).emit('message:new', message);
      }
    } catch (err) {
      console.error('[DB] 消息保存失败:', err.message);
      socket.emit('error:message', '消息发送失败，请重试');
    }
  });

  // 消息反应
  socket.on('message:react', (data) => {
    const { messageId, emoji, channel } = data;
    const username = socket.username;
    if (!username || !messageId || !emoji) return;

    try {
      const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
      if (!msg) return;

      io.to(channel || 'general').emit('message:reaction', {
        messageId, emoji, username, action: 'add'
      });
    } catch (err) {
      console.error('[DB] 反应处理失败:', err.message);
    }
  });

  // 切换频道
  socket.on('channel:join', (channel) => {
    const oldChannel = socket.channel;
    socket.leave(oldChannel);
    socket.join(channel);
    socket.channel = channel;

    const user = onlineUsers.get(socket.id);
    if (user) user.channel = channel;

    socket.emit('channel:changed', channel);
  });

  // 创建频道
  socket.on('channel:create', (name) => {
    const validationError = validateChannelName(name);
    if (validationError) {
      socket.emit('error:message', validationError);
      return;
    }

    try {
      db.prepare('INSERT INTO channels (name) VALUES (?)').run(name);
      io.emit('channels:update');
    } catch (err) {
      if (err.message?.includes('UNIQUE')) {
        socket.emit('error:message', '频道已存在');
      } else {
        console.error('[DB] 频道创建失败:', err.message);
        socket.emit('error:message', '频道创建失败');
      }
    }
  });

  // 输入中...
  socket.on('user:typing', (data) => {
    const { channel, targetUser } = data;
    if (targetUser) {
      const targetSocket = findSocketByUsername(targetUser);
      if (targetSocket) io.to(targetSocket).emit('user:typing', { username: socket.username });
    } else {
      socket.to(channel || 'general').emit('user:typing', { username: socket.username });
    }
  });

  socket.on('user:stopTyping', (data) => {
    const { channel, targetUser } = data;
    if (targetUser) {
      const targetSocket = findSocketByUsername(targetUser);
      if (targetSocket) io.to(targetSocket).emit('user:stopTyping', { username: socket.username });
    } else {
      socket.to(channel || 'general').emit('user:stopTyping', { username: socket.username });
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      io.emit('users:online', Array.from(onlineUsers.values()).map(u => u.username));
      socket.broadcast.emit('system:message', {
        content: `${user.username} 离开了聊天`,
        type: 'system'
      });
      console.log(`[断开] ${user.username}`);
    }
  });
});

function findSocketByUsername(username) {
  for (const [id, user] of onlineUsers) {
    if (user.username === username) return id;
  }
  return null;
}

// 生产环境：SPA 回退路由（必须放在所有 API 路由之后）
if (isProduction) {
  const clientDist = path.join(__dirname, '../client/dist');
  if (fs.existsSync(clientDist)) {
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

// 优雅关闭
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('\n[服务器] 正在关闭...');
  server.close(() => {
    console.log('[服务器] HTTP 服务器已关闭');
    db.close();
    console.log('[服务器] 数据库已关闭');
    process.exit(0);
  });
  // 30秒强制退出
  setTimeout(() => {
    console.error('[服务器] 强制退出');
    process.exit(1);
  }, 30000);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});