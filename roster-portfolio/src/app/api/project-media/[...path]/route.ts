import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        // Await params in Next.js 14+
        const resolvedParams = await params;

        // Decode each segment to handle spaces and special characters properly
        const filePath = resolvedParams.path.map(p => decodeURIComponent(p)).join('/');
        
        // Try multiple possible base paths (for local dev and Docker)
        const possiblePaths = [
            path.join(process.cwd(), '..', filePath),  // Local dev: /app/../Football AI/...
            path.join(process.cwd(), filePath),         // Docker with volume mount: /app/Football AI/...
            path.join('/', filePath),                   // Absolute path fallback
        ];

        console.log(`[Media API] Requested path: ${filePath}`);
        console.log(`[Media API] CWD: ${process.cwd()}`);
        console.log(`[Media API] Trying paths:`, possiblePaths);

        let absolutePath: string | null = null;
        for (const tryPath of possiblePaths) {
            console.log(`[Media API] Checking: ${tryPath} - exists: ${fs.existsSync(tryPath)}`);
            if (fs.existsSync(tryPath)) {
                absolutePath = tryPath;
                break;
            }
        }

        if (!absolutePath) {
            console.log(`[Media API] File not found in any path`);
            return new NextResponse('File not found', { status: 404 });
        }

        console.log(`[Media API] Found at: ${absolutePath}`);
        const file = fs.readFileSync(absolutePath);
        const ext = path.extname(absolutePath).toLowerCase();

        // Determine content type
        const contentTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime',
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';
        console.log(`[Media API] Serving ${filePath} as ${contentType}`);

        return new NextResponse(file, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('[Media API] Error:', error);
        return new NextResponse(`Error serving file: ${error}`, { status: 500 });
    }
}
