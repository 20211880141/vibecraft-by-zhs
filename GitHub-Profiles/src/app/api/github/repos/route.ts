import { NextRequest, NextResponse } from 'next/server';
import { fetchGithubRepos, GithubAPIError } from '@/lib/github';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('user');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 },
    );
  }

  try {
    const data = await fetchGithubRepos(username);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GithubAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error('Unexpected error fetching GitHub repos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}