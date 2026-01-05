import { handleCheckResumePOST, handleGenerateCoverLetterPOST, handleGenerateSummaryPOST, handleResumeGET, handleResumePOST, handleResumePUT, handleResumeDELETE } from '@/lib/apiHandlers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  console.log('[api catch-all] POST', pathname);

  if (pathname.startsWith('/api/check-resume')) {
    return handleCheckResumePOST(req);
  }

  if (pathname.startsWith('/api/generate-cover-letter')) {
    return handleGenerateCoverLetterPOST(req);
  }

  if (pathname.startsWith('/api/generate-summary')) {
    return handleGenerateSummaryPOST(req);
  }

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumePOST(req);
  }

  return NextResponse.json({ error: 'POST route not found', path: pathname }, { status: 404 });
}

export async function GET(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumeGET(req);
  }

  return NextResponse.json({ error: 'GET route not found' }, { status: 404 });
}

export async function PUT(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumePUT(req);
  }

  return NextResponse.json({ error: 'PUT route not found' }, { status: 404 });
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === '/api/resume' || pathname.startsWith('/api/resume')) {
    return handleResumeDELETE(req);
  }

  return NextResponse.json({ error: 'DELETE route not found' }, { status: 404 });
}