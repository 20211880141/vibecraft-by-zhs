import { useState } from 'react';

export default function Login({ onLogin, error }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) onLogin(input.trim());
  };

  return (
    <div className="h-screen flex items-center justify-center bg-surface overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* 登录卡片 */}
      <div className="relative glass rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Chat App</h1>
          <p className="text-sm text-gray-400 mt-1.5 font-body">输入用户名开始聊天</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="输入你的用户名..."
              className={`w-full px-4 py-3.5 bg-surface/50 border rounded-xl text-white text-sm 
                placeholder-gray-500 font-body outline-none transition-all duration-200
                ${focused ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/10'}`}
              maxLength={20}
              autoFocus
            />
            {input.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="flex -space-x-1">
                  {[...Array(Math.min(input.length, 3))].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary-400 text-sm font-body animate-fade-in">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 
              hover:to-primary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl 
              font-medium font-body text-sm transition-all duration-200 active:scale-[0.98]
              shadow-lg shadow-primary/20"
          >
            进入聊天
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-600 font-body">
          按 Enter 快速发送
        </p>
      </div>
    </div>
  );
}