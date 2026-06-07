import { NextResponse } from 'next/server';
import { fetchTrendingRepos, GithubAPIError } from '@/lib/github';

export async function GET() {
  try {
    const data = await fetchTrendingRepos();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GithubAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error('Unexpected error fetching trending repos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}