import type { GithubRepo } from '@/types/github';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface RepoItemProps {
  repo: GithubRepo;
}

function RepoItem({ repo }: RepoItemProps) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card hover className="h-full p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
            {repo.name}
          </h3>
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>

        {repo.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {repo.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {repo.language}
            </span>
          )}

          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {repo.stargazers_count}
          </span>

          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            {repo.forks_count}
          </span>

          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {repo.topics.slice(0, 3).map((topic) => (
                <Badge key={topic}>{topic}</Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </a>
  );
}

interface RepoListProps {
  repos: GithubRepo[];
}

export function RepoList({ repos }: RepoListProps) {
  const topRepos = repos.slice(0, 4);

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-1 w-8 rounded-full bg-emerald-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Repositories
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {topRepos.map((repo) => (
          <RepoItem key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
}