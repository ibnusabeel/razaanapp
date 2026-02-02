import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendWelcomeMessage } from '@/lib/line';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        // Validate required fields
        if (!body.lineUserId || !body.realName || !body.phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Upsert User (Create or Update if exists)
        const user = await User.findOneAndUpdate(
            { lineUserId: body.lineUserId },
            {
                displayName: body.displayName,
                pictureUrl: body.pictureUrl,
                realName: body.realName,
                phone: body.phone,
                address: body.address,
                $setOnInsert: { role: 'customer' },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Send Welcome Message
        try {
            await sendWelcomeMessage(body.lineUserId, body.realName);
            console.log('✅ Welcome message sent successfully');
        } catch (lineError) {
            console.error('❌ Failed to send welcome message:', lineError);
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 }
        );
    }
}
