import type { GithubProfile } from '@/types/github';
import { Card } from './ui/Card';

interface ProfileCardProps {
  profile: GithubProfile;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="mt-8 overflow-hidden">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <img
            src={profile.avatar_url}
            alt={`${profile.login}'s avatar`}
            className="h-24 w-24 rounded-2xl border-2 border-emerald-400/30 object-cover shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md">
            ✓
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.name ?? profile.login}
              </h2>
              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 transition-colors hover:text-emerald-500 dark:text-gray-400"
              >
                @{profile.login}
              </a>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">
              {profile.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-5">
            <div className="text-center">
              <div className="stat-value">{formatNumber(profile.followers)}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="text-center">
              <div className="stat-value">{profile.public_repos}</div>
              <div className="stat-label">Repos</div>
            </div>
            {profile.location && (
              <div className="text-center">
                <svg className="mx-auto h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div className="stat-label">{profile.location}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}