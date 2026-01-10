import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type (only images and PDFs)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images, PDFs, and videos are allowed.' },
        { status: 400 }
      );
    }

    // Check if BLOB_READ_WRITE_TOKEN is configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Vercel Blob storage is not configured. Please add BLOB_READ_WRITE_TOKEN to environment variables.' },
        { status: 500 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file.stream(), {
      access: 'public',
      token: blobToken,
    });

    return NextResponse.json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Make sure Vercel Blob is configured.' },
      { status: 500 }
    );
  }
}

// GET endpoint to list blobs (optional, for admin use)
export async function GET(request: NextRequest) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Vercel Blob storage is not configured' },
        { status: 500 }
      );
    }

    // Note: Listing blobs requires the @vercel/blob SDK with list functionality
    // This is a placeholder for future implementation
    return NextResponse.json({
      message: 'Blob listing not yet implemented',
      docs: 'https://vercel.com/docs/storage/vercel-blob',
    });
  } catch (error) {
    console.error('List blobs error:', error);
    return NextResponse.json(
      { error: 'Failed to list blobs' },
      { status: 500 }
    );
  }
}
