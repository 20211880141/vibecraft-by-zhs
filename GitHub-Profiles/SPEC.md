# GitHub Profiles — 项目设计文档

> 基于 GitHub API 的开发者档案搜索与展示应用
>
> **技术栈**：Next.js 16 (App Router) + TypeScript 5 + Tailwind CSS 4 + React Query 5 + Vitest
>
> **目标**：上传至 GitHub 展示全栈开发能力，丰富个人简历

---

## 目录

1. [需求分析](#1-需求分析)
2. [项目架构](#2-项目架构)
3. [技术栈详解](#3-技术栈详解)
4. [目录结构](#4-目录结构)
5. [组件设计](#5-组件设计)
6. [数据流与状态管理](#6-数据流与状态管理)
7. [API 设计](#7-api-设计)
8. [类型定义](#8-类型定义)
9. [开发流程](#9-开发流程)
10. [测试策略](#10-测试策略)
11. [部署方案](#11-部署方案)
12. [扩展与二次开发指南](#12-扩展与二次开发指南)

---

## 1. 需求分析

### 1.1 核心功能

| 编号 | 功能 | 描述 | 优先级 |
|------|------|------|--------|
| F1 | 用户搜索 | 输入 GitHub 用户名，点击搜索获取用户信息 | P0 |
| F2 | 信息展示 | 展示头像、用户名、Followers 数、仓库总数 | P0 |
| F3 | 仓库列表 | 展示 Star + Fork 最多的 Top 4 仓库 | P0 |
| F4 | 错误处理 | 无效用户名弹出友好提示 | P0 |
| F5 | 暗色/亮色模式 | 一键切换，偏好持久化到 localStorage | P1 |
| F6 | 搜索历史 | 记录最近的搜索（浏览器 IndexedDB） | P2 |
| F7 | 响应式适配 | 移动端 / 平板 / 桌面端自适应 | P1 |

### 1.2 用户故事

```
作为 开发者
我想 输入一个 GitHub 用户名并查看其详细档案
以便 快速了解一个开发者的开源活跃度与技术方向
```

```
作为 面试官
我想 看到候选人的 GitHub 项目展示了 API 集成、前后端分离、TypeScript 等能力
以便 评估其技术深度与工程素养
```

### 1.3 非功能性需求

- **性能**：首页加载 < 2s（Lighthouse ≥ 90）
- **可访问性**：支持键盘导航、语义化 HTML
- **代码质量**：TypeScript 严格模式，ESLint + Prettier
- **测试覆盖**：核心逻辑 ≥ 80%

---

## 2. 项目架构

### 2.1 整体架构

```
┌──────────────────────────────────────────────────┐
│                   Browser (Client)                │
│  ┌──────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ SearchBar │ │ ProfileCard│ │   RepoList     │  │
│  └─────┬─────┘ └─────┬──────┘ └───────┬────────┘  │
│        │             │               │            │
│  ┌─────┴─────────────┴───────────────┴────────┐   │
│  │           TanStack Query (缓存层)           │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │ fetch(/api/github?user=xxx)   │
├─────────────────────┼──────────────────────────────┤
│            Next.js Server (API Routes)              │
│  ┌──────────────────┴──────────────────────────┐   │
│  │        /api/github?user=xxx                  │   │
│  │        ├─ GET  /api/github?user=xxx          │   │
│  │        │   └─ 代理请求 GitHub REST API       │   │
│  │        └─ GET  /api/github/repos?user=xxx    │   │
│  │            └─ 代理请求 GitHub Repos API      │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │                               │
├─────────────────────┼──────────────────────────────┤
│               GitHub REST API (外部)                │
│  api.github.com/users/{username}                    │
│  api.github.com/users/{username}/repos?sort=stars   │
└─────────────────────────────────────────────────────┘
```

### 2.2 架构决策记录（ADR）

| 决策 | 选择 | 理由 |
|------|------|------|
| 路由方案 | Next.js App Router | 支持 RSC、流式渲染、文件系统路由，2026 年标准方案 |
| 数据获取 | React Query | 声明式缓存、自动 loading/error 状态、去重请求 |
| API 代理 | Next.js Route Handlers | 隐藏 GitHub Token、统一错误处理、可加缓存 |
| 搜索历史 | IndexedDB (idb-keyval) | 比 localStorage 容量大、支持复杂查询、比 SQLite 轻量 |
| 测试工具 | Vitest + Testing Library | Vite 原生支持、速度最快、与 Jest API 兼容 |

---

## 3. 技术栈详解

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 14+ | 全栈框架，提供路由、SSR、API Routes |
| 语言 | TypeScript | 5.x | 静态类型检查，strict 模式 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS，暗色模式开箱即用 |
| 数据获取 | @tanstack/react-query | 5.x | 声明式服务端状态管理 |
| 搜索历史 | idb-keyval | 3.x | IndexedDB 键值封装，持久化搜索记录 |
| 测试 | Vitest | 2.x | 单元测试 + 组件测试 |
| 测试工具 | @testing-library/react | 16.x | DOM 交互测试 |
| 代码质量 | ESLint + Prettier | - | 代码风格统一 |
| 部署 | Vercel | - | 零配置部署，自动 HTTPS |

### 3.1 为什么不选 X？

| 替代方案 | 弃用理由 |
|----------|----------|
| **Vite + React** | 需要手动配路由、没有内置 API Routes，Next.js 更完整 |
| **useState + useEffect** | 需要手写 loading/error 逻辑，React Query 一行搞定 |
| **Redux / Zustand** | 本项目没有复杂客户端状态，React Query 管理服务端状态已足够 |
| **Prisma + PostgreSQL** | 过度设计，IndexedDB 足够，且免费 |
| **直接前端 fetch GitHub** | 暴露 Token、CORS 问题、无法统一错误处理 |

---

## 4. 目录结构

```
github-profiles/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI
├── public/
│   ├── favicon.ico
│   └── og-image.png               # Open Graph 预览图
├── src/
│   ├── app/
│   │   ├── layout.tsx             # 根布局（暗色模式 Provider）
│   │   ├── page.tsx               # 首页（组合各组件）
│   │   ├── loading.tsx            # 加载骨架屏
│   │   ├── error.tsx              # 全局错误边界
│   │   ├── globals.css            # 全局样式 + Tailwind
│   │   └── api/
│   │       └── github/
│   │           ├── route.ts       # GET /api/github?user=xxx
│   │           └── repos/
│   │               └── route.ts   # GET /api/github/repos?user=xxx
│   ├── components/
│   │   ├── ui/                    # 通用 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Badge.tsx
│   │   ├── SearchBar.tsx         # 搜索输入框
│   │   ├── ProfileCard.tsx       # 用户档案卡片
│   │   ├── RepoList.tsx          # 仓库列表
│   │   ├── RepoItem.tsx          # 单个仓库项
│   │   ├── SearchHistory.tsx     # 搜索历史
│   │   ├── ThemeToggle.tsx       # 暗色/亮色切换按钮
│   │   ├── EmptyState.tsx        # 空状态占位
│   │   └── ErrorAlert.tsx        # 错误提示
│   ├── hooks/
│   │   ├── useGithubProfile.ts   # 用户档案查询 Hook
│   │   ├── useGithubRepos.ts     # 仓库列表查询 Hook
│   │   ├── useSearchHistory.ts   # 搜索历史 Hook (IndexedDB)
│   │   └── useTheme.ts           # 暗色模式 Hook
│   ├── lib/
│   │   ├── github.ts             # GitHub API 调用工具函数
│   │   ├── api-client.ts         # 前端 API 请求封装
│   │   ├── idb.ts                # IndexedDB 工具
│   │   └── cn.ts                 # className 合并工具 (clsx + twMerge)
│   ├── types/
│   │   └── github.ts             # GitHub API 响应类型定义
│   └── __tests__/
│       ├── SearchBar.test.tsx
│       ├── ProfileCard.test.tsx
│       ├── RepoList.test.tsx
│       ├── github-route.test.ts
│       └── useSearchHistory.test.ts
├── .env.local.example             # 环境变量模板
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
├── package.json
├── README.md
└── SPEC.md                        # 本文档
```

---

## 5. 组件设计

### 5.1 组件层级

```
<RootLayout>                          ← 暗色模式 Provider
  <ThemeProvider>
    <Header>
      <ThemeToggle />                 ← 暗色/亮色切换
    </Header>
    <main>
      <HomePage>
        <SearchBar />                 ← 搜索框 + 搜索按钮
        <SearchHistory />             ← 最近搜索（可选）
        {isLoading && <Skeleton />}   ← 加载状态
        {error && <ErrorAlert />}     ← 错误状态
        {data && (
          <>
            <ProfileCard />           ← 头像 + 用户名 + 统计数据
            <RepoList>
              <RepoItem />            ← 单个仓库（×4）
              <RepoItem />
              <RepoItem />
              <RepoItem />
            </RepoList>
          </>
        )}
        {!data && !isLoading && <EmptyState />}  ← 空状态
      </HomePage>
    </main>
    <Footer />
  </ThemeProvider>
</RootLayout>
```

### 5.2 核心组件 Props 设计

```typescript
// SearchBar
interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
}

// ProfileCard
interface ProfileCardProps {
  profile: GithubProfile;
}

// RepoList
interface RepoListProps {
  repos: GithubRepo[];
}

// RepoItem
interface RepoItemProps {
  repo: GithubRepo;
}
```

---

## 6. 数据流与状态管理

### 6.1 状态分类

| 状态类型 | 管理方式 | 示例 |
|----------|----------|------|
| **服务端状态** | React Query | 用户档案、仓库列表 |
| **UI 状态** | useState | 输入框值 |
| **主题状态** | useTheme (Context + localStorage) | 暗色/亮色模式 |
| **持久化状态** | IndexedDB (idb-keyval) | 搜索历史 |

### 6.2 React Query 配置

```typescript
// hooks/useGithubProfile.ts
export function useGithubProfile(username: string) {
  return useQuery({
    queryKey: ['github', 'profile', username],
    queryFn: () => fetchProfile(username),
    enabled: username.length > 0,
    staleTime: 5 * 60 * 1000,     // 5 分钟内不重复请求
    retry: 1,                      // 失败重试 1 次
    refetchOnWindowFocus: false,   // 不回切窗口时重新请求
  });
}
```

### 6.3 数据流图

```
用户输入用户名 → SearchBar (onSearch)
                          │
                          ▼
                  useGithubProfile(username)       useGithubRepos(username)
                    ┌─────┴─────┐                    ┌─────┴─────┐
                    │ React Query│                    │ React Query│
                    │ 缓存命中?  │                    │ 缓存命中?  │
                    └─────┬─────┘                    └─────┬─────┘
                          │ 未命中                        │ 未命中
                          ▼                               ▼
              fetch('/api/github?user=xxx')    fetch('/api/github/repos?user=xxx')
                          │                               │
                          ▼                               ▼
              GitHub REST API                  GitHub REST API
                          │                               │
                          ▼                               ▼
                    ProfileCard                      RepoList
```

---

## 7. API 设计

### 7.1 GET /api/github

查询用户档案。

| 属性 | 值 |
|------|-----|
| **Method** | GET |
| **Query** | `user: string` — GitHub 用户名 |
| **Success (200)** | `GithubProfile` |
| **404** | `{ error: "User not found" }` |
| **429** | `{ error: "Rate limit exceeded" }` |
| **500** | `{ error: "Internal server error" }` |

**请求示例**：
```
GET /api/github?user=vercel
```

**响应示例**：
```json
{
  "login": "vercel",
  "avatar_url": "https://avatars.githubusercontent.com/u/14985020?v=4",
  "name": "Vercel",
  "bio": "Develop. Preview. Ship.",
  "followers": 12000,
  "public_repos": 450
}
```

### 7.2 GET /api/github/repos

查询用户仓库列表（按 Stars 降序）。

| 属性 | 值 |
|------|-----|
| **Method** | GET |
| **Query** | `user: string` — GitHub 用户名 |
| **Success (200)** | `GithubRepo[]`（前端取前 4） |
| **404** | `{ error: "User not found" }` |

**请求示例**：
```
GET /api/github/repos?user=vercel
```

### 7.3 错误处理策略

```typescript
// src/lib/github.ts — 服务端
export async function fetchGithubUser(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }),
    },
    next: { revalidate: 60 }, // ISR 缓存 60 秒
  });

  if (res.status === 404) {
    throw new GithubAPIError('User not found', 404);
  }
  if (res.status === 403) {
    throw new GithubAPIError('Rate limit exceeded', 429);
  }
  if (!res.ok) {
    throw new GithubAPIError('Failed to fetch user data', res.status);
  }

  return res.json();
}
```

---

## 8. 类型定义

```typescript
// src/types/github.ts

/** GitHub 用户档案 */
export interface GithubProfile {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
  html_url: string;
  company: string | null;
  location: string | null;
  blog: string;
  twitter_username: string | null;
}

/** GitHub 仓库 */
export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
}

/** API 统一响应 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/** 搜索历史记录项 */
export interface SearchRecord {
  username: string;
  timestamp: number;
}
```

---

## 9. 开发流程

### 阶段一：环境搭建

```bash
# Step 1.1 — 创建 Next.js 项目
npx create-next-app@latest github-profiles \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias

cd github-profiles

# Step 1.2 — 安装核心依赖
npm install @tanstack/react-query idb-keyval clsx tailwind-merge

# Step 1.3 — 安装开发依赖
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event happy-dom @vitejs/plugin-react

# Step 1.4 — 初始化 Git
git init
git add .
git commit -m "chore: scaffold Next.js project"
```

### 阶段二：基础配置

**Step 2.1** — 配置 Tailwind 暗色模式 (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2.2** — 配置 `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

**Step 2.3** — 配置 `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom/vitest';
```

### 阶段三：工具函数

**Step 3.1** — `src/lib/cn.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3.2** — `src/lib/idb.ts`

```typescript
import { get, set, del, keys } from 'idb-keyval';
import type { SearchRecord } from '@/types/github';

const HISTORY_KEY = 'search-history';
const MAX_HISTORY = 10;

export async function addSearchHistory(username: string) {
  const history = await getSearchHistory();
  const filtered = history.filter((r) => r.username !== username);
  const record: SearchRecord = { username, timestamp: Date.now() };
  const updated = [record, ...filtered].slice(0, MAX_HISTORY);
  await set(HISTORY_KEY, updated);
  return updated;
}

export async function getSearchHistory(): Promise<SearchRecord[]> {
  return (await get(HISTORY_KEY)) ?? [];
}

export async function clearSearchHistory() {
  await del(HISTORY_KEY);
}
```

### 阶段四：API Routes

**Step 4.1** — `src/lib/github.ts`

```typescript
export class GithubAPIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'GithubAPIError';
  }
}

export async function fetchGithubUser(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }),
    },
    next: { revalidate: 60 },
  });

  if (res.status === 404) throw new GithubAPIError('User not found', 404);
  if (res.status === 403) throw new GithubAPIError('Rate limit exceeded', 429);
  if (!res.ok) throw new GithubAPIError('Failed to fetch user', res.status);

  return res.json();
}

export async function fetchGithubRepos(username: string) {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&per_page=10`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) throw new GithubAPIError('Failed to fetch repos', res.status);

  return res.json();
}
```

**Step 4.2** — `src/app/api/github/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchGithubUser, GithubAPIError } from '@/lib/github';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('user');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const data = await fetchGithubUser(username);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GithubAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 4.3** — `src/app/api/github/repos/route.ts` (同理)

### 阶段五：自定义 Hooks

**Step 5.1** — `src/hooks/useGithubProfile.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import type { GithubProfile } from '@/types/github';

async function fetchProfile(username: string): Promise<GithubProfile> {
  const res = await fetch(`/api/github?user=${username}`);
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }
  return res.json();
}

export function useGithubProfile(username: string) {
  return useQuery({
    queryKey: ['github', 'profile', username],
    queryFn: () => fetchProfile(username),
    enabled: username.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
```

**Step 5.2** — `src/hooks/useTheme.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
```

### 阶段六：UI 组件

**Step 6.1** — `src/components/SearchBar.tsx`

- 受控输入框 + 搜索图标 + 加载时禁用 + Enter 键提交
- 空值校验（空用户名不发送请求）

**Step 6.2** — `src/components/ProfileCard.tsx`

- 头像圆形 + 用户名 + Bio + Followers/Repos 统计
- GitHub 个人主页外链
- 加载骨架屏状态
- 404 空状态

**Step 6.3** — `src/components/RepoList.tsx`

- 4 个 RepoItem，网格布局（桌面 2×2，移动 1×1）
- 每个 RepoItem 展示：仓库名、描述、Stars、Forks、语言色标

**Step 6.4** — `src/components/SearchHistory.tsx`

- 最近 10 条搜索记录，点击可快速搜索
- 清空历史按钮

**Step 6.5** — `src/components/ThemeToggle.tsx`

- 太阳/月亮图标切换

### 阶段七：组装主页面

**Step 7.1** — `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { QueryProvider } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitHub Profiles',
  description: 'Search and explore GitHub developer profiles',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

**Step 7.2** — `src/app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**Step 7.3** — `src/app/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ProfileCard } from '@/components/ProfileCard';
import { RepoList } from '@/components/RepoList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchHistory } from '@/components/SearchHistory';
import { useGithubProfile } from '@/hooks/useGithubProfile';
import { useGithubRepos } from '@/hooks/useGithubRepos';
import { addSearchHistory } from '@/lib/idb';

export default function Home() {
  const [username, setUsername] = useState('');
  const [searchedUser, setSearchedUser] = useState('');

  const profile = useGithubProfile(searchedUser);
  const repos = useGithubRepos(searchedUser);

  const handleSearch = (user: string) => {
    const trimmed = user.trim();
    if (!trimmed) return;
    setSearchedUser(trimmed);
    addSearchHistory(trimmed);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">GitHub Profiles</h1>
        <ThemeToggle />
      </header>

      <SearchBar
        value={username}
        onChange={setUsername}
        onSearch={handleSearch}
        isLoading={profile.isLoading || repos.isLoading}
      />

      {!searchedUser && <SearchHistory onSelect={setSearchedUser} />}

      {profile.data && <ProfileCard profile={profile.data} />}
      {repos.data && <RepoList repos={repos.data} />}
    </div>
  );
}
```

### 阶段八：代码优化

**Step 8.1** — 添加骨架屏 `loading.tsx`

**Step 8.2** — 添加错误边界 `error.tsx`

**Step 8.3** — ESLint + Prettier 检查，修复所有 warning

```bash
npm run lint
npx prettier --write .
```

**Step 8.4** — TypeScript 严格模式下的类型收窄，确保无 `any`

### 阶段九：测试

```bash
npm run test
```

测试清单：
- SearchBar：空值不提交、Enter 键提交、加载中禁用
- ProfileCard：正确渲染用户信息、无数据时不报错
- RepoList：最多显示 4 个仓库、空数组无报错
- API Route：空 username 返回 400、有效用户返回 200
- useSearchHistory：增删查功能正常

### 阶段十：README 编写

```bash
# 详见 README.md
```

### 阶段十一：部署

```bash
# 推送到 GitHub
git add .
git commit -m "feat: complete GitHub Profiles app"
git push origin main

# 去 vercel.com → Import → 选择仓库 → 部署
```

---

## 10. 测试策略

### 10.1 测试金字塔

```
         ┌───────┐
         │  E2E  │  ← 暂不涉及
         ├───────┤
         │ 组件测试│  ← ProfileCard, SearchBar, RepoList
         ├───────┤
         │ 单元测试│  ← github.ts, idb.ts, Hooks
         └───────┘
```

### 10.2 测试矩阵

| 测试目标 | 测试内容 | 期望 |
|----------|----------|------|
| `SearchBar` | 空用户名点击搜索 | 不触发 onSearch |
| `SearchBar` | 有效用户名点击搜索 | 调用 onSearch 并传入用户名 |
| `SearchBar` | 加载中状态 | 按钮 disabled |
| `SearchBar` | 按 Enter 键 | 触发搜索 |
| `ProfileCard` | 正常数据渲染 | 展示头像、名称、统计数据 |
| `ProfileCard` | name 为 null | 显示 login 作为回退 |
| `RepoList` | 4 个仓库 | 渲染 4 个 RepoItem |
| `RepoList` | 空数组 | 不报错、无内容 |
| `GET /api/github` | user=空 | 400 + 错误信息 |
| `GET /api/github` | user=有效用户 | 200 + 正确 JSON |
| `useSearchHistory` | 添加记录 | 保存到 IndexedDB |
| `useSearchHistory` | 清空历史 | 删除所有记录 |

---

## 11. 部署方案

### 11.1 Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel

# 3. 生产部署
vercel --prod
```

### 11.2 环境变量

| 变量名 | 是否必须 | 说明 |
|--------|----------|------|
| `GITHUB_TOKEN` | 否 | GitHub Personal Access Token，提升 API 频率限制（无 Token: 60次/h，有 Token: 5000次/h）|

### 11.3 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test
```

---

## 12. 扩展与二次开发指南

### 12.1 可扩展方向

| 扩展 | 难度 | 说明 |
|------|------|------|
| **仓库详情页** | 中 | 点击仓库跳转详情，展示提交记录、贡献者 |
| **用户对比** | 中 | 同时输入两个用户名，并排对比 |
| **数据可视化** | 中 | 用 Chart.js 展示语言分布饼图、贡献热力图 |
| **PWA 支持** | 低 | 添加 `manifest.json` + Service Worker |
| **i18n 国际化** | 低 | 用 `next-intl` 支持多语言 |
| **OAuth 登录** | 高 | 集成 NextAuth.js，登录后可查看私有仓库 |

### 12.2 二次开发流程

```bash
# 1. Fork + Clone
git clone https://github.com/你的用户名/github-profiles.git
cd github-profiles

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 创建新分支
git checkout -b feat/your-feature

# 5. 开发 → 测试 → 提交
npm run test
git commit -m "feat: your feature description"

# 6. 部署预览
vercel
```

### 12.3 组件扩展模式

新增功能模块时，遵循以下模式：

```typescript
// 1. 定义类型 (src/types/)
// 2. 创建 API Route (src/app/api/)
// 3. 创建 Hook (src/hooks/)
// 4. 创建组件 (src/components/)
// 5. 编写测试 (src/__tests__/)
// 6. 集成到 page.tsx
```

---

> **下一步**：按本文档 Phase 顺序开始编码实现。
