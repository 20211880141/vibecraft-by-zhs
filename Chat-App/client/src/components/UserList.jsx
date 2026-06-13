export default function UserList({ users, currentUser, onStartPrivateChat, onClose }) {
  return (
    <div className="w-64 bg-surface/50 border-l border-white/[0.04] flex flex-col h-full">
      {/* 标题 */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.04]">
        <h2 className="text-sm font-semibold text-white font-heading">在线用户</h2>
        <button onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 用户列表 — 标题栏与列表项之间零间距 */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 pt-0 space-y-0.5">
        {users.map((user) => (
          <div
            key={user}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              user === currentUser
                ? 'bg-primary/5'
                : 'hover:bg-white/[0.04] cursor-pointer'
            }`}
            onClick={() => user !== currentUser && onStartPrivateChat(user)}
          >
            {/* 头像 */}
            <div className="relative">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                user === currentUser
                  ? 'from-primary to-accent'
                  : 'from-gray-500 to-gray-600'
              } flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                {user[0].toUpperCase()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${
                user === currentUser ? 'bg-green-500' : 'bg-green-400'
              }`} />
            </div>

            {/* 用户名 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-body truncate ${
                  user === currentUser ? 'text-primary font-medium' : 'text-gray-300'
                }`}>
                  {user}
                </span>
                {user === currentUser && (
                  <span className="text-[10px] text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded-full">你</span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 font-body">
                {user === currentUser ? '在线' : '在线'}
              </p>
            </div>

            {/* 私聊按钮 */}
            {user !== currentUser && (
              <button
                onClick={(e) => { e.stopPropagation(); onStartPrivateChat(user); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 
                  transition-all duration-200"
                title="私聊"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 底部统计 */}
      <div className="p-3 border-t border-white/[0.04]">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
          <span className="text-xs text-gray-500 font-body">{users.length} 位用户在线</span>
        </div>
      </div>
    </div>
  );
}