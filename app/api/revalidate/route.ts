import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// Token used by the dashboard / triggers to authorise cache invalidation.
// Set REVALIDATE_TOKEN in the Vercel project's environment variables.
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;

interface RevalidateBody {
  // Either a single tag or a list of tags to invalidate.
  tag?: string;
  tags?: string[];
}

function authorised(req: NextRequest): boolean {
  if (!REVALIDATE_TOKEN) {
    // Fail closed if not configured – never want this open by default.
    return false;
  }
  const header = req.headers.get('authorization');
  if (header && header.replace(/^Bearer\s+/i, '') === REVALIDATE_TOKEN) {
    return true;
  }
  const url = new URL(req.url);
  return url.searchParams.get('token') === REVALIDATE_TOKEN;
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = (await req.json()) as RevalidateBody;
  } catch {
    // ignore – tag may be in the query string instead
  }

  const url = new URL(req.url);
  const tags = new Set<string>();
  if (body.tag) tags.add(body.tag);
  if (Array.isArray(body.tags)) body.tags.forEach((t) => t && tags.add(t));
  const qsTag = url.searchParams.get('tag');
  if (qsTag) tags.add(qsTag);

  if (tags.size === 0) {
    return NextResponse.json({ ok: false, error: 'no tags supplied' }, { status: 400 });
  }

  const tagList = Array.from(tags);
  tagList.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ ok: true, revalidated: tagList });
}

// Allow GET for one-off manual invalidations: /api/revalidate?token=…&tag=minisite:abc
export async function GET(req: NextRequest) {
  return POST(req);
}
