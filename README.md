# vibecraft-by-zhs

我的 vibecoding 作品集 – 用自然语言 + AI 快速构建的创意应用，展示我的全栈思维与 AI 工程能力。

---

<div align="center">
  <h1>GitHub Profiles</h1>
  <p>
    <strong>Search and explore GitHub developer profiles</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/React%20Query-5-ff4154?style=flat-square&logo=react-query" alt="React Query" />
    <img src="https://img.shields.io/badge/Vitest-3-6e9f18?style=flat-square&logo=vitest" alt="Vitest" />
  </p>
</div>

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
│   ├── favicon.ico        # App favicon
│   ├── globals.css        # Global styles + Tailwind dark mode
│   ├── layout.tsx         # Root layout with QueryProvider
│   ├── page.tsx           # Home page (state orchestration)
│   ├── providers.tsx      # React Query client provider
│   └── api/
│       └── github/
│           ├── route.ts         # GET /api/github?user=xxx
│           ├── repos/
│           │   └── route.ts     # GET /api/github/repos?user=xxx
│           ├── search/
│           │   ├── repos/
│           │   │   └── route.ts # GET /api/github/search/repos?q=xxx
│           │   └── users/
│           │       └── route.ts # GET /api/github/search/users?q=xxx
│           ├── orgs/
│           │   └── route.ts     # GET /api/github/orgs?name=xxx
│           └── trending/
│               └── route.ts     # GET /api/github/trending
├── components/
│   ├── ui/                 # Reusable primitives
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Skeleton.tsx
│   ├── EmptyState.tsx          # No results placeholder
│   ├── ErrorAlert.tsx          # Error display
│   ├── OrgSearchResults.tsx    # Organization search results
│   ├── ProfileCard.tsx         # User info display
│   ├── RepoList.tsx            # Repository grid
│   ├── RepoSearchResults.tsx   # Repository search results
│   ├── SearchBar.tsx           # Search input + submit
│   ├── SearchHistory.tsx       # Recent searches
│   ├── SearchModeTabs.tsx      # Search mode switcher
│   ├── ThemeToggle.tsx         # Dark/light mode switch
│   ├── TrendingRepos.tsx       # Trending repositories
│   └── UserSearchResults.tsx   # User search results
├── hooks/
│   ├── useGithubOrg.ts         # React Query for org data
│   ├── useGithubProfile.ts     # React Query for user data
│   ├── useGithubRepos.ts       # React Query for repo data
│   ├── useGithubSearchRepos.ts # React Query for repo search
│   ├── useGithubSearchUsers.ts # React Query for user search
│   ├── useGithubTrending.ts    # React Query for trending repos
│   ├── useSearchHistory.ts     # IndexedDB operations
│   └── useTheme.ts             # Dark mode logic + persistence
├── lib/
│   ├── cn.ts               # Class name utility
│   ├── github.ts           # GitHub API client (server-side)
│   └── idb.ts              # IndexedDB helpers
├── types/
│   └── github.ts           # TypeScript interfaces
└── __tests__/
    ├── ProfileCard.test.tsx
    ├── RepoList.test.tsx
    ├── SearchBar.test.tsx
    └── useSearchHistory.test.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/github-profiles.git
cd github-profiles

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local
# Add your GitHub token to .env.local for higher API rate limits
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

### Build

```bash
npm run build
```

## API

The app proxies GitHub API requests through Next.js Route Handlers to hide credentials and unify error handling.

### `GET /api/github?user=<username>`

Fetch a GitHub user's profile:

```bash
curl /api/github?user=vercel
```

**Response**: `GithubProfile` object or error JSON.

### `GET /api/github/repos?user=<username>`

Fetch a GitHub user's repositories (sorted by stars):

```bash
curl /api/github/repos?user=vercel
```

**Response**: `GithubRepo[]` array or error JSON.

### `GET /api/github/search/users?q=<query>`

Search GitHub users:

```bash
curl /api/github/search/users?q=vercel
```

**Response**: `GithubSearchResult<GithubSearchUserItem>` object.

### `GET /api/github/search/repos?q=<query>`

Search GitHub repositories:

```bash
curl /api/github/search/repos?q=nextjs
```

**Response**: `GithubSearchResult<GithubSearchRepoItem>` object.

### `GET /api/github/orgs?name=<name>`

Fetch GitHub organization details:

```bash
curl /api/github/orgs?name=vercel
```

**Response**: `GithubOrganization` object.

### `GET /api/github/trending`

Fetch weekly trending repositories from GitHub:

```bash
curl /api/github/trending
```

**Response**: `{ total_count: number, items: TrendingRepo[] }` object.

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. (Optional) Add `GITHUB_TOKEN` environment variable
4. Click **Deploy**

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (increases rate limit from 60 to 5,000 req/hr) |

## Extending the Project

### Add a New Feature (e.g., User Comparison)

```bash
git checkout -b feat/user-comparison
# 1. Define types in src/types/
# 2. Add API route in src/app/api/
# 3. Create hook in src/hooks/
# 4. Build component in src/components/
# 5. Write tests in src/__tests__/
# 6. Integrate in src/app/page.tsx
```

### Customize the Theme

Edit `src/app/globals.css` to change the color palette:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --background: #030712;
  --foreground: #f3f4f6;
}
```

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

- [app-ideas](https://github.com/florinpop17/app-ideas) by [Florin Pop](https://github.com/florinpop17) — Project inspiration and feature specifications

## License

MIT
