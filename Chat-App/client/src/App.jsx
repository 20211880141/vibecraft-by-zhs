import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import Login from './components/Login';
import Chat from './components/Chat';

// 生产环境使用相同域名，开发环境指向后端端口
const SOCKET_URL = import.meta.env.DEV ? 'http://127.0.0.1:3001' : '';
const API_URL = SOCKET_URL;

export default function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [typingUsers, setTypingUsers] = useState({});
  const [error, setError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [searchResults, setSearchResults] = useState(null);

  // Init socket
  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => setLoading(false));
    s.on('connect_error', () => {
      setError('无法连接到服务器');
      setLoading(false);
    });

    return () => s.disconnect();
  }, []);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => setMessages(prev => [...prev, msg]);
    const onSystem = (msg) => setMessages(prev => [...prev, { ...msg, id: Date.now() }]);
    const onUsers = (users) => setOnlineUsers(users);
    const onChannelsUpdate = () => fetchChannels();
    const onChannelChanged = (ch) => setCurrentChannel(ch);
    const onTyping = ({ username: u }) => setTypingUsers(prev => ({ ...prev, [u]: true }));
    const onStopTyping = ({ username: u }) => setTypingUsers(prev => ({ ...prev, [u]: false }));
    const onError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };
    const onLoginError = (msg) => { setLoginError(msg); setTimeout(() => setLoginError(''), 4000); };

    // 消息被更新
    const onMessageUpdated = (updated) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    // 消息被删除
    const onMessageDeleted = ({ id }) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    };

    const onReaction = ({ messageId, emoji, username: u, action }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          const reactions = m.reactions ? { ...m.reactions } : {};
          if (action === 'add') {
            reactions[emoji] = [...(reactions[emoji] || []), u];
          } else {
            reactions[emoji] = (reactions[emoji] || []).filter(name => name !== u);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          }
          return { ...m, reactions };
        }
        return m;
      }));
    };

    socket.on('message:new', onMessage);
    socket.on('system:message', onSystem);
    socket.on('users:online', onUsers);
    socket.on('channels:update', onChannelsUpdate);
    socket.on('channel:changed', onChannelChanged);
    socket.on('user:typing', onTyping);
    socket.on('user:stopTyping', onStopTyping);
    socket.on('error:message', onError);
    socket.on('error:login', onLoginError);
    socket.on('message:reaction', onReaction);
    socket.on('message:updated', onMessageUpdated);
    socket.on('message:deleted', onMessageDeleted);

    return () => {
      socket.off('message:new', onMessage);
      socket.off('system:message', onSystem);
      socket.off('users:online', onUsers);
      socket.off('channels:update', onChannelsUpdate);
      socket.off('channel:changed', onChannelChanged);
      socket.off('user:typing', onTyping);
      socket.off('user:stopTyping', onStopTyping);
      socket.off('error:message', onError);
      socket.off('error:login', onLoginError);
      socket.off('message:reaction', onReaction);
      socket.off('message:updated', onMessageUpdated);
      socket.off('message:deleted', onMessageDeleted);
    };
  }, [socket]);

  const fetchChannels = useCallback(async () => {
    try { setChannels(await (await fetch(`${API_URL}/api/channels`)).json()); } catch {}
  }, []);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const joinChannel = useCallback((channel) => {
    if (!socket || !username) return;
    socket.emit('channel:join', channel);
    setCurrentChannel(channel);
    setMessages([]);
    setSearchResults(null);
    fetch(`${API_URL}/api/messages?channel=${channel}`)
      .then(r => r.json())
      .then(setMessages)
      .catch(() => {});
  }, [socket, username]);

  const handleLogin = (user) => {
    setUsername(user);
    setLoginError('');
    socket.emit('user:login', user);
    fetch(`${API_URL}/api/messages?channel=general`)
      .then(r => r.json())
      .then(setMessages)
      .catch(() => {});
  };

  const sendMessage = (content, type = 'text', targetUser = null, fileData = null) => {
    if (!socket) return;
    if (type === 'file' && fileData) {
      socket.emit('message:send', {
        content: content || '',
        type: 'file',
        targetUser,
        channel: currentChannel,
        fileUrl: fileData.url,
        fileName: fileData.name,
        fileSize: fileData.size
      });
    } else if (content?.trim()) {
      socket.emit('message:send', { content, type, targetUser, channel: currentChannel });
    }
  };

  const editMessage = async (msgId, newContent) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/${msgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, username })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('编辑失败');
      setTimeout(() => setError(''), 4000);
    }
  };

  const deleteMessage = async (msgId) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/${msgId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('删除失败');
      setTimeout(() => setError(''), 4000);
    }
  };

  const addReaction = (messageId, emoji) => {
    if (!socket) return;
    socket.emit('message:react', { messageId, emoji, channel: currentChannel });
  };

  const createChannel = (name) => {
    if (!socket) return;
    socket.emit('channel:create', name);
  };

  const searchMessages = async (query) => {
    if (!query.trim()) { setSearchResults(null); return; }
    try {
      const res = await fetch(`${API_URL}/api/messages/search?q=${encodeURIComponent(query)}&channel=${currentChannel}&username=${encodeURIComponent(username)}`);
      const results = await res.json();
      setSearchResults(results);
    } catch {}
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        setTimeout(() => setError(''), 4000);
        return null;
      }
      return await res.json();
    } catch {
      setError('文件上传失败');
      setTimeout(() => setError(''), 4000);
      return null;
    }
  };

  const handleLogout = () => {
    socket?.disconnect();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-body">正在连接...</p>
        </div>
      </div>
    );
  }

  if (!username) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <Chat
      socket={socket}
      username={username}
      messages={messages}
      onlineUsers={onlineUsers}
      channels={channels}
      currentChannel={currentChannel}
      typingUsers={typingUsers}
      error={error}
      searchResults={searchResults}
      onSendMessage={sendMessage}
      onJoinChannel={joinChannel}
      onCreateChannel={createChannel}
      onAddReaction={addReaction}
      onEditMessage={editMessage}
      onDeleteMessage={deleteMessage}
      onSearchMessages={searchMessages}
      onUploadFile={uploadFile}
      onLogout={handleLogout}
      messagesEndRef={messagesEndRef}
    />
  );
}