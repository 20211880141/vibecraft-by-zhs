import { NextRequest, NextResponse } from 'next/server';
import { fetchGithubOrg, searchGithubUsers, GithubAPIError } from '@/lib/github';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const q = searchParams.get('q');

  try {
    // If a specific org name is given, fetch its details
    if (name) {
      const data = await fetchGithubOrg(name);
      return NextResponse.json(data);
    }

    // If a search query is given, search for organizations
    if (q) {
      const data = await searchGithubUsers(`${q} type:org`);
      // Filter results to only include organizations
      return NextResponse.json({
        ...data,
        items: data.items.filter((item) => item.type === 'Organization'),
      });
    }

    return NextResponse.json(
      { error: 'Either "name" or "q" parameter is required' },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof GithubAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error('Unexpected error fetching GitHub org:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}