import { useState, useRef, useCallback, useEffect } from 'react';

const EMOJI_LIST = ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🤠','🥳','🥺','😢','😭','😤','😠','😡','🤬','🤧','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','💀','☠️','👻','👽','👾','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙌','👏','👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','👀'];

export default function MessageInput({ onSend, socket, channel, replyTo, onCancelReply, onUploadFile }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [focused, setFocused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const typingRef = useRef(null);
  const fileInputRef = useRef(null);

  const emitTyping = useCallback(() => {
    if (!socket) return;
    socket.emit('user:typing', { channel, targetUser: replyTo?.username || null });
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      socket.emit('user:stopTyping', { channel, targetUser: replyTo?.username || null });
    }, 1000);
  }, [socket, channel, replyTo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim(), 'text');
    setText('');
    setShowEmoji(false);
    if (socket) {
      socket.emit('user:stopTyping', { channel, targetUser: replyTo?.username || null });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleFileSelect = async (file) => {
    if (!file || !onUploadFile) return;
    setUploading(true);
    const result = await onUploadFile(file);
    setUploading(false);
    if (result) {
      onSend('', 'file', replyTo?.username || null, result);
    }
  };

  // Ctrl+V 粘贴图片
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUploadFile, replyTo]);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFileSelect(file);
  };

  return (
    <div className="border-t border-white/[0.04] bg-surface/30">
      {/* 回复提示 */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-primary/5 border-b border-primary/10 animate-fade-in">
          <svg className="w-4 h-4 text-primary/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          <span className="text-xs text-gray-400 font-body">
            回复 <span className="text-primary font-medium">{replyTo.username}</span>
          </span>
          <span className="text-xs text-gray-600 truncate flex-1 font-body">{replyTo.content}</span>
          <button onClick={onCancelReply} className="p-0.5 text-gray-500 hover:text-white transition-colors rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 拖拽上传区域高亮 */}
      {dragOver && (
        <div className="mx-3 sm:mx-4 mt-2 px-4 py-6 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center">
          <span className="text-sm text-primary font-body">释放以上传文件</span>
        </div>
      )}

      {/* 输入区域 */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 sm:px-4 py-3"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* 文件上传按钮 */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
              uploading
                ? 'bg-primary/10 text-primary animate-pulse'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title={uploading ? '上传中...' : '上传文件'}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* Emoji 按钮 */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
              showEmoji
                ? 'bg-primary/20 text-primary shadow-sm shadow-primary/10'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="表情符号"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </button>
          {showEmoji && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowEmoji(false)} />
              <div className="absolute bottom-full left-0 mb-2 w-72 h-52 bg-surface-100 border border-white/10 rounded-xl p-3 overflow-y-auto shadow-2xl z-20 animate-fade-in">
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI_LIST.map((emoji, i) => (
                    <button key={i} type="button" onClick={() => insertEmoji(emoji)}
                      className="hover:bg-white/[0.08] rounded-lg p-1.5 text-lg transition-all hover:scale-125 active:scale-90">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 文本输入框 */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); emitTyping(); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={replyTo ? `回复 ${replyTo.username}...` : '输入消息...'}
            rows={1}
            className={`w-full h-11 px-4 py-2.5 bg-surface/80 border rounded-xl text-white text-sm 
              placeholder-gray-600 font-body outline-none resize-none leading-5 transition-all duration-200
              ${focused ? 'border-primary/30 ring-1 ring-primary/10' : 'border-white/[0.06]'}`}
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* 发送按钮 */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/90 
            hover:from-primary/90 hover:to-primary disabled:opacity-30 disabled:cursor-not-allowed text-white 
            transition-all duration-200 active:scale-90 shadow-lg shadow-primary/20 shrink-0"
          title="发送"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}