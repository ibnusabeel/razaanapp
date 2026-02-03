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

        // 1. Try to find existing user by LINE ID
        let user = await User.findOne({ lineUserId: body.lineUserId });

        // 2. If not found by LINE ID, try to find by Phone
        if (!user) {
            user = await User.findOne({ phone: body.phone });
        }

        if (user) {
            // Update existing user (Merge LINE ID if missing)
            user.lineUserId = body.lineUserId;
            user.displayName = body.displayName || user.displayName;
            user.pictureUrl = body.pictureUrl || user.pictureUrl;
            user.realName = body.realName; // Update name to latest
            user.address = body.address || user.address;
            await user.save();
            console.log('✅ User merged/updated:', user.realName);
        } else {
            // Create new user
            user = await User.create({
                lineUserId: body.lineUserId,
                displayName: body.displayName,
                pictureUrl: body.pictureUrl,
                realName: body.realName,
                phone: body.phone,
                address: body.address,
                role: 'customer',
            });
            console.log('✅ New user created:', user.realName);
        }

        // Send Welcome Message (Only if LINE ID is present)
        if (user.lineUserId) {
            try {
                await sendWelcomeMessage(user.lineUserId, user.realName);
                console.log('✅ Welcome message sent successfully');
            } catch (lineError) {
                console.error('❌ Failed to send welcome message:', lineError);
            }
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
