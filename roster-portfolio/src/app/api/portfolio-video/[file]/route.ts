import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";

const VIDEO_EXTENSIONS = new Set([".mov", ".mp4", ".webm", ".m4v"]);
const CONTENT_TYPES: Record<string, string> = {
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".m4v": "video/mp4",
};

function videoRoots() {
  return [
    process.env.PORTFOLIO_VIDEO_DIR,
    path.join(process.cwd(), "portfolio-videos"),
    path.join(process.cwd(), "..", "portfolio-videos"),
    "/Users/dixon/portfolio videos",
  ].filter(Boolean) as string[];
}

function resolveVideo(file: string) {
  const decoded = decodeURIComponent(file);
  const baseName = path.basename(decoded);
  const ext = path.extname(baseName).toLowerCase();

  if (baseName !== decoded || !VIDEO_EXTENSIONS.has(ext)) return null;

  for (const root of videoRoots()) {
    const candidate = path.join(root, baseName);
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const absolutePath = resolveVideo(file);

  if (!absolutePath) {
    return new NextResponse("Video not found", { status: 404 });
  }

  const stat = fs.statSync(absolutePath);
  const fileSize = stat.size;
  const ext = path.extname(absolutePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const range = request.headers.get("range");
  const cacheHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": contentType,
    "Content-Disposition": `inline; filename="${path.basename(absolutePath).replaceAll('"', "")}"`,
    "Last-Modified": stat.mtime.toUTCString(),
    "Vary": "Range",
  };

  if (range) {
    const [startText, endText] = range.replace("bytes=", "").split("-");
    const start = Number.parseInt(startText, 10);
    const requestedEnd = endText ? Number.parseInt(endText, 10) : fileSize - 1;
    const end = Math.min(requestedEnd, fileSize - 1);

    if (Number.isNaN(start) || start >= fileSize || Number.isNaN(end) || start > end) {
      return new NextResponse("Invalid range", {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const stream = fs.createReadStream(absolutePath, { start, end });

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...cacheHeaders,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      },
    });
  }

  const stream = fs.createReadStream(absolutePath);

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      ...cacheHeaders,
      "Content-Length": String(fileSize),
    },
  });
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  const { file } = await context.params;
  const absolutePath = resolveVideo(file);

  if (!absolutePath) {
    return new NextResponse(null, { status: 404 });
  }

  const stat = fs.statSync(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  return new NextResponse(null, {
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${path.basename(absolutePath).replaceAll('"', "")}"`,
      "Content-Length": String(stat.size),
      "Last-Modified": stat.mtime.toUTCString(),
      "Vary": "Range",
    },
  });
}
