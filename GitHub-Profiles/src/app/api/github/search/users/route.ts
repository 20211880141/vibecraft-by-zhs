import { NextRequest, NextResponse } from 'next/server';
import { searchGithubUsers, GithubAPIError } from '@/lib/github';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 },
    );
  }

  try {
    const data = await searchGithubUsers(q);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GithubAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error('Unexpected error searching GitHub users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}