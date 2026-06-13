import { useState, useEffect, useRef, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ChannelSidebar from './ChannelSidebar';

export default function Chat({
  socket, username, messages, onlineUsers, channels, currentChannel,
  typingUsers, error, searchResults, onSendMessage, onJoinChannel, onCreateChannel,
  onAddReaction, onEditMessage, onDeleteMessage, onSearchMessages,
  onUploadFile, onLogout,
  messagesEndRef
}) {
  const [showUsers, setShowUsers] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimerRef = useRef(null);
  const searchInputRef = useRef(null);

  const activeTyping = Object.entries(typingUsers)
    .filter(([name, isTyping]) => isTyping && name !== username)
    .map(([name]) => name);

  // 选频道时自动关闭移动端侧栏
  const handleJoinChannel = (channel) => {
    onJoinChannel(channel);
    setShowSidebar(false);
    setShowSearch(false);
    setSearchQuery('');
    if (onSearchMessages) onSearchMessages('');
  };

  // 搜索防抖
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      if (onSearchMessages) onSearchMessages(value);
    }, 300);
  }, [onSearchMessages]);

  // 切换搜索框
  const toggleSearch = () => {
    const next = !showSearch;
    setShowSearch(next);
    if (!next) {
      setSearchQuery('');
      if (onSearchMessages) onSearchMessages('');
    }
  };

  // 搜索框打开时自动聚焦
  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
    if (onSearchMessages) onSearchMessages('');
    searchInputRef.current?.focus();
  };

  // ESC 关闭所有面板 + 清除搜索
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowSidebar(false);
        setShowUsers(false);
        setShowSearch(false);
        setSearchQuery('');
        if (onSearchMessages) onSearchMessages('');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      {/* ======== 移动端侧栏遮罩 ======== */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden animate-fade-in"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ======== 频道侧栏 ======== */}
      <div className={`${
        // 移动端：固定 overlay 抽屉
        'fixed inset-y-0 left-0 z-30 w-56 -translate-x-full md:static md:translate-x-0 md:z-auto transition-transform duration-300 ease-out'
      } ${showSidebar ? '!translate-x-0' : ''}`}>
        <ChannelSidebar
          channels={channels}
          currentChannel={currentChannel}
          onlineCount={onlineUsers.length}
          onJoinChannel={handleJoinChannel}
          onCreateChannel={onCreateChannel}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* ======== 主聊天区 ======== */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* 顶部栏 */}
        <header className="h-16 glass border-b border-white/[0.04] flex items-center justify-between px-3 sm:px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* 移动端：菜单按钮 */}
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
              title="频道列表"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* 频道名 */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs md:text-sm font-semibold text-primary font-heading">#</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-sm font-semibold text-white font-heading leading-tight truncate">
                  {currentChannel}
                </h1>
                <p className="text-[10px] md:text-[11px] text-gray-500 font-body hidden xs:block">
                  {onlineUsers.length} 人在线
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* 在线数（桌面端显示） */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              <span className="text-xs text-green-400 font-body whitespace-nowrap">{onlineUsers.length} 在线</span>
            </div>

            {/* 用户名 */}
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-white/[0.03]">
              <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {username[0].toUpperCase()}
              </div>
              <span className="text-xs text-gray-300 font-medium font-body hidden sm:block truncate max-w-[80px]">{username}</span>
            </div>

            {/* 搜索按钮 */}
            <button
              onClick={toggleSearch}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showSearch ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title="搜索消息"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* 用户列表切换按钮 */}
            <button
              onClick={() => setShowUsers(u => !u)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showUsers ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title="在线用户"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </button>

            {/* 退出按钮 */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200"
              title="退出登录"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* 错误提示 */}
        {error && (
          <div className="mx-3 sm:mx-4 md:mx-6 mt-2 md:mt-3 px-3 md:px-4 py-2 md:py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary-400 text-xs md:text-sm font-body animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* 搜索栏（点击搜索按钮后展开） */}
        {showSearch && (
          <div className="px-3 sm:px-4 md:px-6 pt-2 pb-1 animate-fade-in">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="搜索消息内容..."
                className="w-full h-9 pl-9 pr-8 bg-surface/80 border border-primary/30 ring-1 ring-primary/10 rounded-lg text-xs text-white 
                  placeholder-gray-600 font-body outline-none transition-all"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 消息列表 */}
        <MessageList
          messages={messages}
          username={username}
          messagesEndRef={messagesEndRef}
          onReply={setReplyTo}
          onReaction={onAddReaction}
          onEdit={onEditMessage}
          onDelete={onDeleteMessage}
          searchResults={searchResults}
        />

        {/* 输入中指示器 */}
        {activeTyping.length > 0 && (
          <div className="px-3 sm:px-4 md:px-6 py-1.5 md:py-2 flex items-center gap-2 animate-fade-in">
            <div className="flex items-center gap-0.5">
              {activeTyping.slice(0, 3).map((name, i) => (
                <div key={i} className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-[7px] md:text-[8px] font-bold text-white -mr-1 border border-surface"
                     style={{ zIndex: 3 - i }}>
                  {name[0].toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[11px] md:text-xs text-gray-500 font-body">
              {activeTyping.length === 1 ? `${activeTyping[0]} 正在输入` : `${activeTyping.join(', ')} 正在输入`}
            </span>
            <div className="typing-indicator ml-1">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
            </div>
          </div>
        )}

        {/* 消息输入框 */}
        <MessageInput
          onSend={(content, type, targetUser, fileData) => {
            onSendMessage(content, type, targetUser || replyTo?.username || null, fileData);
            setReplyTo(null);
          }}
          socket={socket}
          channel={currentChannel}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onUploadFile={onUploadFile}
        />
      </div>

      {/* ======== 在线用户面板 ======== */}
      {showUsers && (
        <>
          {/* 移动端遮罩 */}
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden animate-fade-in"
            onClick={() => setShowUsers(false)}
          />
          {/* 面板：移动端全屏，桌面右侧栏 */}
          <div className={`${
            'fixed top-16 bottom-0 right-0 z-30 w-64 animate-fade-in'
          }`}>
            <UserList
              users={onlineUsers}
              currentUser={username}
              onStartPrivateChat={(targetUser) => {
                setReplyTo({ username: targetUser });
                setShowUsers(false);
              }}
              onClose={() => setShowUsers(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}