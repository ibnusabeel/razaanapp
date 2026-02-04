import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json();
        const adminKey = process.env.ADMIN_SECRET_KEY;

        if (!adminKey) {
            console.error('ADMIN_SECRET_KEY is not set!');
            return NextResponse.json({ valid: false, error: 'Server configuration error' }, { status: 500 });
        }

        const valid = key === adminKey;

        return NextResponse.json({ valid });
    } catch (error) {
        console.error('Auth verify error:', error);
        return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 });
    }
}
