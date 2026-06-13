<div align="center">
  <h1>Chat App</h1>
  <p>
    <strong>Real-time chat application with private messaging and file sharing</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io" alt="Socket.IO" />
    <img src="https://img.shields.io/badge/SQLite-3-003b57?style=flat-square&logo=sqlite" alt="SQLite" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-3-06b6d4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  </p>
</div>

## Overview

Chat App is a real-time messaging platform that supports public channels, private conversations, file sharing, message search, and more. Built with a modern stack featuring WebSocket-powered instant communication.

**Live Demo**: [Deploy to Zeabur](#deployment)

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React 18 + Vite 5 | Component-based UI with fast HMR |
| **Backend** | Express 4 + Socket.IO 4 | REST API + WebSocket real-time communication |
| **Database** | SQLite 3 (better-sqlite3) | Persistent message storage with FTS5 full-text search |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design with dark theme |
| **File Upload** | Multer | Server-side file handling with type/size validation |

## Features

- **Real-time Messaging** — Instant message delivery via WebSocket with typing indicators
- **Public Channels** — Create and join topic-based channels
- **Private Messaging** — One-on-one conversations, only visible to participants
- **File Sharing** — Upload images, PDFs, documents (10MB limit, drag-and-drop support)
- **Message Search** — Full-text search across messages with privacy-aware filtering
- **Message Management** — Edit and delete your own messages, add emoji reactions
- **User Presence** — See who's online and their current channel
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Rate Limiting** — API and upload rate limits to prevent abuse

## Project Architecture

```
Chat-App/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx           # Main chat interface
│   │   │   ├── ChannelSidebar.jsx # Channel list & navigation
│   │   │   ├── Login.jsx          # Username login screen
│   │   │   ├── MessageInput.jsx   # Message composer + emoji picker
│   │   │   ├── MessageList.jsx    # Message display with reactions
│   │   │   └── UserList.jsx       # Online users panel
│   │   ├── App.jsx            # App root with socket & state management
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                    # Express backend
│   ├── index.js               # Server entry (API + Socket.IO)
│   ├── db.js                  # SQLite schema & initialization
│   ├── uploads/               # Uploaded files directory
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vibecraft-by-zhs.git
cd vibecraft-by-zhs/Chat-App

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Development

Run both server and client in separate terminals:

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client dev server
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build client and start server (single command)
cd server
npm run build   # Builds the client
npm start       # Serves both API and client on port 3001
```

## API

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages?channel=general` | Get chat history |
| `GET` | `/api/messages/search?q=keyword&channel=general&username=user` | Search messages |
| `POST` | `/api/upload` | Upload a file (multipart/form-data) |
| `PUT` | `/api/messages/:id` | Edit a message |
| `DELETE` | `/api/messages/:id` | Delete a message |
| `GET` | `/api/channels` | List all channels |
| `GET` | `/api/users/online` | List online users |

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user:login` | Client → Server | User login with username |
| `message:send` | Client → Server | Send a message (text/file) |
| `message:new` | Server → Client | New message received |
| `message:updated` | Server → Client | Message was edited |
| `message:deleted` | Server → Client | Message was deleted |
| `message:react` | Client → Server | Add emoji reaction |
| `message:reaction` | Server → Client | Reaction update |
| `channel:join` | Client → Server | Switch channel |
| `channel:create` | Client → Server | Create new channel |
| `user:typing` | Bidirectional | Typing indicator |
| `users:online` | Server → Client | Online user list update |

## Deployment

### Deploy to Zeabur

1. Push this repo to GitHub
2. Go to [Zeabur](https://zeabur.com) and create a new project
3. Import your GitHub repository
4. Set **Root Directory** to `Chat-App/server`
5. Set environment variable `NODE_ENV=production`
6. Zeabur will automatically run `npm run build && npm start`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Set to `production` for deployment |
| `CORS_ORIGIN` | No | Allowed CORS origins (comma-separated) |

## Acknowledgements

- [app-ideas](https://github.com/florinpop17/app-ideas) by [Florin Pop](https://github.com/florinpop17) — Project inspiration and feature specifications

## License

MIT