# GitHub Profiles

Search and explore GitHub developer profiles

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?style=flat-square&logo=tailwindcss)
![React Query](https://img.shields.io/badge/React%20Query-5-ff4154?style=flat-square&logo=react-query)
![Vitest](https://img.shields.io/badge/Vitest-3-6e9f18?style=flat-square&logo=vitest)

## Overview

GitHub Profiles is a full-stack web application that lets you search for GitHub users, repositories, and organizations, view trending repos, and explore developer profiles. Built with modern web technologies and best practices.

**Live Demo**: [Deploy to Vercel](#deployment)

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with file-based routing |
| **Language** | TypeScript 5 (strict mode) | Type safety and developer experience |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with class-based dark mode |
| **Data Fetching** | TanStack React Query 5 | Server-state management with caching |
| **Persistence** | idb-keyval (IndexedDB) | Search history storage |
| **Testing** | Vitest + Testing Library | Component and unit testing |
| **CI/CD** | GitHub Actions | Automated testing on push/PR |
| **Deployment** | Vercel | Zero-config serverless deployment |

## Features

- **Multi-mode Search** — Search by GitHub username, repository, or organization name
- **Profile Cards** — Display avatar, name, bio, followers count, repo count, and location
- **Top Repositories** — Show the top 10 most-starred repos with stars, forks, language, and topics
- **Trending Repos** — Browse weekly trending repositories from GitHub
- **Dark Mode** — Toggle between light/dark themes with persistence to localStorage
- **Search History** — Persistent history using IndexedDB (last 10 searches)
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Loading States** — Skeleton screens for profile and repo cards
- **Error Handling** — Friendly error messages with retry capability

## Project Architecture

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── api/github/
│       ├── route.ts
│       ├── repos/route.ts
│       ├── search/{repos,users}/route.ts
│       ├── orgs/route.ts
│       └── trending/route.ts
├── components/
│   ├── ui/{Badge,Button,Card,Input,Skeleton}.tsx
│   ├── EmptyState.tsx
│   ├── ErrorAlert.tsx
│   ├── OrgSearchResults.tsx
│   ├── ProfileCard.tsx
│   ├── RepoList.tsx
│   ├── RepoSearchResults.tsx
│   ├── SearchBar.tsx
│   ├── SearchHistory.tsx
│   ├── SearchModeTabs.tsx
│   ├── ThemeToggle.tsx
│   ├── TrendingRepos.tsx
│   └── UserSearchResults.tsx
├── hooks/
│   ├── useGithub{Org,Profile,Repos,SearchRepos,SearchUsers,Trending}.ts
│   ├── useSearchHistory.ts
│   └── useTheme.ts
├── lib/{cn,github,idb}.ts
├── types/github.ts
└── __tests__/ ... (20 tests, 4 files)
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
cd GitHub-Profiles
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
npm test         # Run once
npm run test:watch  # Watch mode
```

## API

All endpoints are proxied through Next.js Route Handlers:

| Endpoint | Description |
|----------|-------------|
| `GET /api/github?user=<username>` | Fetch user profile |
| `GET /api/github/repos?user=<username>` | Fetch user repos (sorted by stars) |
| `GET /api/github/search/users?q=<query>` | Search users |
| `GET /api/github/search/repos?q=<query>` | Search repos |
| `GET /api/github/orgs?name=<name>` | Fetch organization details |
| `GET /api/github/trending` | Weekly trending repos |

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. (Optional) Add `GITHUB_TOKEN` env var
4. Deploy

## Test Results

```
✓ src/__tests__/useSearchHistory.test.ts (4 tests)
✓ src/__tests__/ProfileCard.test.tsx (6 tests)
✓ src/__tests__/RepoList.test.tsx (5 tests)
✓ src/__tests__/SearchBar.test.tsx (5 tests)

Test Files  4 passed (4)
     Tests  20 passed (20)
```

## Acknowledgements

- [app-ideas](https://github.com/florinpop17/app-ideas) by Florin Pop — Project inspiration and feature specifications

## License

MIT