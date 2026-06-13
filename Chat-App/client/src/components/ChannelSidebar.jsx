import { useState } from 'react';

export default function ChannelSidebar({ channels, currentChannel, onlineCount, onJoinChannel, onCreateChannel, onClose }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateChannel(newName.trim().toLowerCase().replace(/\s+/g, '-'));
      setNewName('');
      setShowCreate(false);
    }
  };

  return (
    <div className="w-56 bg-[#1a1225] border-r border-white/[0.04] flex flex-col shrink-0 h-full hidden md:flex">
      {/* 标题 */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-white font-heading">频道</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            title="创建频道"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          {/* 移动端关闭按钮 */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            title="关闭"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 创建频道 */}
      {showCreate && (
        <form onSubmit={handleCreate} className="p-3 border-b border-white/[0.04] animate-fade-in">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="频道名称"
            className="w-full px-3 py-2 bg-surface/80 border border-white/10 rounded-lg text-white text-xs font-body 
              placeholder-gray-600 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button type="submit"
              className="flex-1 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded-lg transition-all active:scale-[0.97]">
              创建
            </button>
            <button type="button" onClick={() => { setShowCreate(false); setNewName(''); }}
              className="py-1.5 px-3 text-gray-400 hover:text-white text-xs transition-colors">
              取消
            </button>
          </div>
        </form>
      )}

      {/* 频道列表 — 填充剩余空间，把底部在线信息推到底 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-0.5">
        {channels.map((ch) => (
          <button
            key={ch.name}
            onClick={() => onJoinChannel(ch.name)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 group ${
              currentChannel === ch.name
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                currentChannel === ch.name ? 'bg-primary shadow-sm shadow-primary/50' : 'bg-gray-600 group-hover:bg-gray-500'
              }`} />
              <span className="font-medium"># {ch.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 底部在线信息 — 贴底，与右侧输入框等高对齐 */}
      <div className="shrink-0 px-4 py-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50 animate-pulse" />
          <span className="text-sm text-gray-500 font-body">{onlineCount} 在线</span>
        </div>
      </div>
    </div>
  );
}