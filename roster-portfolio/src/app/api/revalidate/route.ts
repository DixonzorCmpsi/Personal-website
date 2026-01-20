import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Secret token to protect the revalidation endpoint
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || 'your-secret-token';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');

    // Check for valid token
    if (token !== REVALIDATE_TOKEN) {
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }

    try {
        // Revalidate the home page (which fetches GitHub data)
        revalidatePath('/');
        
        return NextResponse.json({
            success: true,
            message: 'Cache cleared! Page will fetch fresh GitHub data on next visit.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to revalidate', details: String(error) },
            { status: 500 }
        );
    }
}

// Also support POST for webhook integrations (e.g., GitHub webhooks)
export async function POST(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    
    // For webhooks, also check header
    const headerToken = request.headers.get('x-revalidate-token');

    if (token !== REVALIDATE_TOKEN && headerToken !== REVALIDATE_TOKEN) {
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }

    try {
        revalidatePath('/');
        
        return NextResponse.json({
            success: true,
            message: 'Cache cleared via webhook!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to revalidate', details: String(error) },
            { status: 500 }
        );
    }
}
