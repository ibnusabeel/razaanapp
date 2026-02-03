import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';

// Verify Signature
const verifySignature = (body: string, signature: string) => {
    if (!LINE_CHANNEL_SECRET) return true;
    const hash = crypto.createHmac('sha256', LINE_CHANNEL_SECRET).update(body).digest('base64');
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
        const body = JSON.parse(bodyText);
        const events = body.events || [];

        for (const event of events) {
            const text = event.message?.text?.toLowerCase() || '';
            const userId = event.source?.userId;

            // Trigger: follow / "สมัคร" / "ตัดชุด"
            if (event.type === 'follow' || text.includes('สมัคร') || text.includes('ตัดชุด')) {
                const profile = await getProfile(userId);
                const params = new URLSearchParams({
                    lineUserId: userId,
                    displayName: profile.displayName || '',
                    pictureUrl: profile.pictureUrl || ''
                });
                const registerUrl = `${APP_URL}/register?${params.toString()}`;

                await replyMessage(event.replyToken, [
                    {
                        type: 'flex',
                        altText: 'ลงทะเบียนตัดชุด Razaan',
                        contents: {
                            type: 'bubble',
                            body: {
                                type: 'box',
                                layout: 'vertical',
                                contents: [
                                    { type: 'text', text: '✂️ ตัดชุด Razaan', weight: 'bold', size: 'xl', color: '#6B21A8' },
                                    { type: 'text', text: 'กรุณากรอกข้อมูลเพื่อเริ่มต้นตัดชุดค่ะ', margin: 'md', wrap: true, color: '#666666' }
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
                                        action: { type: 'uri', label: 'ลงทะเบียน', uri: registerUrl }
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
