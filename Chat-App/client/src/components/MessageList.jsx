import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://127.0.0.1:3001';

const LINK_REGEX = /(https?:\/\/[^\s]+)/g;

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;

const REACTION_EMOJI = ['👍', '❤️', '😄', '😮', '😢', '🙏'];

function renderContent(content, onLightbox) {
  const parts = content.split(LINK_REGEX);
  return parts.map((part, i) => {
    if (part.match(LINK_REGEX)) {
      const isImage = part.match(IMAGE_EXT);
      if (isImage) {
        return (
          <span key={i} className="block mt-1">
            <a href={part} target="_blank" rel="noopener noreferrer"
               className="text-accent hover:underline text-xs break-all">{part}</a>
            <img src={part} alt="" className="max-w-[280px] max-h-72 rounded-xl mt-1.5 cursor-pointer border border-white/[0.06]
              hover:opacity-95 transition-opacity"
              onClick={() => onLightbox?.(part)} loading="lazy" />
          </span>
        );
      }
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
           className="text-accent hover:underline break-all">{part}</a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  // 使用北京时间
  const beijingOpt = { timeZone: 'Asia/Shanghai' };
  const dateBJ = date.toLocaleDateString('zh-CN', beijingOpt);
  const nowBJ = now.toLocaleDateString('zh-CN', beijingOpt);

  if (dateBJ === nowBJ) return '今天';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayBJ = yesterday.toLocaleDateString('zh-CN', beijingOpt);
  if (dateBJ === yesterdayBJ) return '昨天';

  const yearNow = now.toLocaleDateString('zh-CN', { ...beijingOpt, year: 'numeric' });
  const yearDate = date.toLocaleDateString('zh-CN', { ...beijingOpt, year: 'numeric' });
  return date.toLocaleDateString('zh-CN', {
    month: 'long', day: 'numeric',
    year: yearDate !== yearNow ? 'numeric' : undefined,
    timeZone: 'Asia/Shanghai'
  });
}

function shouldShowDateSeparator(messages, idx) {
  if (idx === 0) return true;
  const curr = new Date(messages[idx]?.created_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const prev = new Date(messages[idx - 1]?.created_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  return curr !== prev;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function FileMessage({ url, name, size, onLightbox }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

  if (isImage) {
    return (
      <div className="mt-1.5">
        <img
          src={url}
          alt={name}
          className="max-w-[240px] max-h-56 rounded-xl cursor-pointer border border-white/[0.06] hover:opacity-95 transition-opacity object-cover"
          onClick={() => onLightbox?.(url)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="mt-1.5 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]
        hover:bg-white/[0.08] transition-colors group max-w-[280px]">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        {size && <p className="text-[10px] text-gray-600">{formatFileSize(size)}</p>}
      </div>
      <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
      </svg>
    </a>
  );
}

function MessageReactions({ reactions = {}, onReact, messageId, username }) {
  const [showPicker, setShowPicker] = useState(false);

  const entries = Object.entries(reactions).filter(([, users]) => users.length > 0);

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
      {entries.map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => onReact(messageId, emoji)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200
            ${users.includes(username) 
              ? 'bg-primary/15 border border-primary/20 text-primary-200' 
              : 'bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300'}`}
        >
          <span>{emoji}</span>
          <span className="text-[11px] font-medium">{users.length}</span>
        </button>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.03] border border-white/[0.06] 
            text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] transition-all text-sm"
        >
          +
        </button>
        {showPicker && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
            <div className="absolute bottom-full left-0 mb-1 z-20 flex items-center gap-1 p-1.5 glass rounded-xl shadow-xl animate-fade-in">
              {REACTION_EMOJI.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { onReact(messageId, emoji); setShowPicker(false); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.08] rounded-lg text-lg transition-all
                    hover:scale-125 active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessageList({ messages, username, messagesEndRef, onReply, onReaction, onEdit, onDelete, searchResults }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollContainerRef = useRef(null);
  const prevMsgLength = useRef(messages.length);
  const isNearBottom = useRef(true);

  // 播放通知音效（Web Audio API 生成简洁 chime）
  const playNotification = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  // 检测新消息（非自己发送、不在底部时播放音效）
  useEffect(() => {
    if (messages.length <= prevMsgLength.current) {
      prevMsgLength.current = messages.length;
      return;
    }
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.username !== username && lastMsg.type !== 'system') {
      if (!isNearBottom.current && !searchResults) {
        playNotification();
      }
    }
    prevMsgLength.current = messages.length;
  }, [messages, username, playNotification, searchResults]);

  // 自动滚动到底部
  useEffect(() => {
    if (isNearBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  // 滚动监听
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 100;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isNearBottom.current = atBottom;
    setShowScrollBtn(!atBottom);
  }, []);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    isNearBottom.current = true;
    setShowScrollBtn(false);
  };

  // ESC 关闭灯箱
  useEffect(() => {
    if (!lightboxUrl) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setLightboxUrl(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [lightboxUrl]);

  const displayMessages = searchResults || messages;

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.content);
    setMenuMsgId(null);
  };

  const saveEdit = (id) => {
    if (editText.trim() && editText !== displayMessages.find(m => m.id === id)?.content) {
      onEdit(id, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  if (displayMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h3 className="text-base font-heading font-semibold text-gray-300 mb-1">
            {searchResults ? '没有匹配的消息' : '暂无消息'}
          </h3>
          <p className="text-sm text-gray-500 font-body">
            {searchResults ? '换个关键词试试' : '发送第一条消息，开始聊天吧'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-0.5"
      style={{ overscrollBehavior: 'contain' }}
    >
      {searchResults && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-accent/5 border border-accent/10">
          <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-xs text-gray-400 font-body">搜索到 {displayMessages.length} 条结果</span>
        </div>
      )}

      {displayMessages.map((msg, idx) => {
        const isSystem = msg.type === 'system';
        const isOwn = msg.username === username;
        const isPrivate = msg.target_user;
        const showDate = !searchResults && shouldShowDateSeparator(displayMessages, idx);
        const isConsecutive = !searchResults && idx > 0 &&
          displayMessages[idx - 1]?.username === msg.username &&
          new Date(msg.created_at) - new Date(displayMessages[idx - 1].created_at) < 120000;

        if (isSystem) {
          return (
            <div key={msg.id || idx} className="flex justify-center py-3 message-enter">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/[0.04]" />
                <span className="text-xs text-gray-500 bg-surface/50 px-3 py-1 rounded-full border border-white/[0.04] font-body">
                  {msg.content}
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/[0.04]" />
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id || idx}>
            {showDate && (
              <div className="date-separator message-enter">
                <span className="text-[11px] text-gray-600 font-body px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]">
                  {formatDate(msg.created_at)}
                </span>
              </div>
            )}

            <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter`}
                 style={{ animationDelay: '0ms' }}>
              <div className={`max-w-[75%] sm:max-w-[60%] ${isOwn ? 'order-1' : ''}`}>
                {/* 用户名 */}
                {!isConsecutive && (
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isOwn ? 'justify-end' : ''}`}>
                    <div className="flex items-center gap-1.5">
                      {!isOwn && (
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                          isPrivate
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                          {msg.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className={`text-xs font-medium font-body ${
                        isOwn
                          ? isPrivate ? 'text-purple-400' : 'text-primary-400'
                          : isPrivate ? 'text-purple-300' : 'text-red-300'
                      }`}>
                        {isOwn ? '你' : msg.username}
                      </span>
                      {isPrivate && (
                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full font-body">
                          {isOwn ? `私聊 → ${msg.target_user}` : '私聊给你'}
                        </span>
                      )}
                      {!isPrivate && (
                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full font-body">
                          公开
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 font-body">
                        {new Date(msg.created_at).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}

                {/* 消息气泡 */}
                <div className={`relative ${isOwn ? 'flex flex-col items-end' : ''}`}>
                  <div className={`relative px-4 py-2.5 break-words ${
                    isOwn
                      ? isPrivate
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl rounded-tr-sm'
                      : isPrivate
                        ? 'bg-purple-900/20 text-gray-200 rounded-2xl rounded-tl-sm border border-purple-500/15'
                        : 'bg-red-900/15 text-gray-200 rounded-2xl rounded-tl-sm border border-red-500/10'
                  }`}>
                    {/* 编辑模式 */}
                    {editingId === msg.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-surface/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          rows={2}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(msg.id); }
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditingId(null)}
                            className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors">
                            取消
                          </button>
                          <button onClick={() => saveEdit(msg.id)}
                            className="text-xs text-white bg-primary hover:bg-primary/90 px-3 py-1 rounded-lg transition-all">
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-body leading-relaxed">
                          {msg.type === 'file' ? (
                            <FileMessage url={msg.file_url?.startsWith('http') ? msg.file_url : `${API_BASE}${msg.file_url}`} name={msg.file_name} size={msg.file_size} onLightbox={setLightboxUrl} />
                          ) : (
                            renderContent(msg.content, setLightboxUrl)
                          )}
                        </div>
                        {msg.edited ? (
                          <span className="text-[10px] text-white/40 mt-0.5 block">已编辑</span>
                        ) : null}
                      </>
                    )}

                    {/* 操作按钮组（hover 显示在气泡外侧，不遮挡） */}
                    {editingId !== msg.id && (
                      <div className={`absolute top-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                        isOwn ? 'right-full mr-2' : 'left-full ml-2'
                      }`}>
                        {/* 回复按钮（自己消息不可回复） */}
                        {!isOwn && (
                        <button
                          onClick={() => onReply({ username: msg.username, content: msg.content })}
                          className="w-7 h-7 rounded-full bg-surface-300/80 border border-white/[0.06] flex items-center justify-center
                            hover:bg-surface-300 transition-colors shadow-sm"
                          title="回复"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                          </svg>
                        </button>
                        )}
                        {/* 自己的消息：编辑和删除按钮 */}
                        {isOwn && (
                          <>
                            <button
                              onClick={() => startEdit(msg)}
                              className="w-7 h-7 rounded-full bg-surface-300/80 border border-white/[0.06] flex items-center justify-center
                                hover:bg-surface-300 transition-colors shadow-sm"
                              title="编辑"
                            >
                              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('确定删除这条消息？')) onDelete(msg.id);
                              }}
                              className="w-7 h-7 rounded-full bg-surface-300/80 border border-white/[0.06] flex items-center justify-center
                                hover:bg-red-500/20 hover:border-red-500/20 transition-colors shadow-sm"
                              title="删除"
                            >
                              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 回复引用 */}
                  {msg.reply_to && (
                    <div className={`mt-1 max-w-[80%] px-3 py-1.5 rounded-lg bg-white/[0.03] border-l-2 border-primary/30 ${isOwn ? 'text-right' : ''}`}>
                      <p className="text-[10px] text-primary/60 font-medium">回复 {msg.reply_to_username}</p>
                      <p className="text-xs text-gray-500 truncate">{msg.reply_to}</p>
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <MessageReactions reactions={msg.reactions} onReact={onReaction} messageId={msg.id} username={username} />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />

      {/* 图片灯箱 */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl object-contain cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center
              text-white/70 hover:text-white hover:bg-black/70 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="absolute bottom-6 text-xs text-white/40 font-body">按 ESC 关闭</span>
        </div>
      )}

      {/* 滚动到底部按钮 */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary shadow-lg shadow-primary/30 
            flex items-center justify-center text-white hover:bg-primary/90 transition-all duration-200 
            animate-fade-in active:scale-90 z-10"
          title="滚动到底部"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}