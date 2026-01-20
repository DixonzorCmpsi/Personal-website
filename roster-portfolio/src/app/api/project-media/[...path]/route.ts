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
        const stat = fs.statSync(absolutePath);
        const fileSize = stat.size;

        // Handle range requests for video streaming
        const range = request.headers.get('range');
        
        if (range && (ext === '.mp4' || ext === '.webm' || ext === '.mov')) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            console.log(`[Media API] Range request: ${start}-${end}/${fileSize}`);

            const fileStream = fs.createReadStream(absolutePath, { start, end });
            const chunks: Buffer[] = [];
            
            for await (const chunk of fileStream) {
                chunks.push(chunk as Buffer);
            }
            
            const buffer = Buffer.concat(chunks);

            return new NextResponse(buffer, {
                status: 206,
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': chunkSize.toString(),
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'public, max-age=31536000',
                },
            });
        }

        // For non-range requests or images, return the full file
        console.log(`[Media API] Serving ${filePath} as ${contentType} (${fileSize} bytes)`);
        const file = fs.readFileSync(absolutePath);

        return new NextResponse(file, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileSize.toString(),
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('[Media API] Error:', error);
        return new NextResponse(`Error serving file: ${error}`, { status: 500 });
    }
}
