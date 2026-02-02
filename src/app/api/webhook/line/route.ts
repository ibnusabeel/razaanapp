import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET; // Need to add this to .env
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';

// Verify Signature
const verifySignature = (body: string, signature: string) => {
    if (!LINE_CHANNEL_SECRET) return true; // Skip if secret not set (dev mode)
    const hash = crypto
        .createHmac('sha256', LINE_CHANNEL_SECRET)
        .update(body)
        .digest('base64');
    return hash === signature;
};

// Get User Profile
async function getProfile(userId: string) {
    try {
        const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
            headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
        });
        return await res.json();
    } catch (e) {
        console.error('Profile Error:', e);
        return { displayName: 'Customer' };
    }
}

// Reply Message
async function replyMessage(replyToken: string, messages: any[]) {
    await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ replyToken, messages }),
    });
}

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get('x-line-signature') || '';

        // Verify (Optional check for now to make it easy)
        // if (!verifySignature(bodyText, signature)) {
        //     return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        // }

        const body = JSON.parse(bodyText);
        const events = body.events || [];

        for (const event of events) {
            if (event.type === 'follow' || (event.type === 'message' && event.message.text?.includes('สมัคร'))) {
                const userId = event.source.userId;
                const profile = await getProfile(userId);

                // Create unique registration link
                // Encode params to handle special characters properly
                const params = new URLSearchParams({
                    lineUserId: userId,
                    displayName: profile.displayName || '',
                    pictureUrl: profile.pictureUrl || ''
                });

                const registerUrl = `${APP_URL}/register?${params.toString()}`;

                await replyMessage(event.replyToken, [
                    {
                        type: 'flex',
                        altText: 'ลงทะเบียนสมาชิก Razaan',
                        contents: {
                            type: 'bubble',
                            hero: {
                                type: 'image',
                                url: 'https://placehold.co/600x400/6B21A8/ffffff/png?text=RAZAAN+Register',
                                size: 'full',
                                aspectRatio: '20:13',
                                aspectMode: 'cover',
                            },
                            body: {
                                type: 'box',
                                layout: 'vertical',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'ยินดีต้อนรับสู่ Razaan',
                                        weight: 'bold',
                                        size: 'xl',
                                        color: '#6B21A8'
                                    },
                                    {
                                        type: 'text',
                                        text: 'กรุณากดปุ่มด้านล่างเพื่อลงทะเบียนและเชื่อมต่อข้อมูลคำสั่งซื้อ',
                                        margin: 'md',
                                        wrap: true,
                                        color: '#666666'
                                    }
                                ]
                            },
                            footer: {
                                type: 'box',
                                layout: 'vertical',
                                contents: [
                                    {
                                        type: 'button',
                                        style: 'primary',
                                        color: '#6B21A8',
                                        action: {
                                            type: 'uri',
                                            label: 'ลงทะเบียนสมาชิก',
                                            uri: registerUrl
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
