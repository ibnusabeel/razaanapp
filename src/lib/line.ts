import { IOrder } from '@/models/Order';
import QRCode from 'qrcode';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Helper to push message
async function pushMessage(to: string, messages: any[]) {
    if (!LINE_CHANNEL_ACCESS_TOKEN) return;

    try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({ to, messages }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ LINE API Error:', error);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// 1. Template: Welcome / Registration Success (Flex Message)
export async function sendWelcomeMessage(to: string, customerName: string) {
    console.log(`📤 Sending welcome message to: ${to}`);

    const flexMessage = {
        type: 'flex',
        altText: `ยินดีต้อนรับ ${customerName} สู่ Razaan`,
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://placehold.co/800x400/6B21A8/ffffff/png?text=Welcome+to+RAZAAN',
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
                        text: '🎉 ยินดีต้อนรับ!',
                        weight: 'bold',
                        size: 'xl',
                        color: '#6B21A8',
                    },
                    {
                        type: 'text',
                        text: `สวัสดีคุณ ${customerName}`,
                        size: 'md',
                        margin: 'md',
                        color: '#333333',
                    },
                    {
                        type: 'text',
                        text: 'ขอบคุณที่ลงทะเบียนสมาชิก Razaan\nต่อจากนี้คุณจะได้รับแจ้งเตือนสถานะการสั่งตัดชุดผ่านทางนี้ได้ทันที',
                        size: 'sm',
                        color: '#666666',
                        wrap: true,
                        margin: 'md',
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: 'Razaan - Dignity Among Women',
                        size: 'xs',
                        color: '#aaaaaa',
                        align: 'center',
                    },
                ],
            },
        },
    };

    await pushMessage(to, [flexMessage]);
    console.log(`✅ Welcome message sent to: ${to}`);
}

// 2. Template: New Order Confirmation (Flex Message)
export async function sendOrderConfirmation(to: string, order: IOrder) {
    const trackingUrl = `${APP_URL}/tracking/${order._id}`;

    // Status color mapping
    const statusText = 'รอยืนยัน';
    const statusColor = '#EAB308'; // Yellow

    const flexMessage = {
        type: 'flex',
        altText: `บิลใบเสร็จ: ${order.dressName}`,
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://placehold.co/800x400/6B21A8/ffffff/png?text=RAZAAN+Order', // Placeholder branding
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
                        text: 'RAZAAN - Verified Order',
                        weight: 'bold',
                        color: '#6B21A8',
                        size: 'sm',
                    },
                    {
                        type: 'text',
                        text: order.dressName,
                        weight: 'bold',
                        size: 'xl',
                        margin: 'md',
                    },
                    {
                        type: 'text',
                        text: `${order.price.toLocaleString()} THB`,
                        size: 'xs',
                        color: '#aaaaaa',
                        wrap: true,
                    },
                    {
                        type: 'separator',
                        margin: 'xxl',
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'xxl',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box',
                                layout: 'baseline',
                                contents: [
                                    { type: 'text', text: 'มัดจำ', color: '#aaaaaa', size: 'sm', flex: 1 },
                                    { type: 'text', text: `${order.deposit.toLocaleString()} THB`, wrap: true, color: '#666666', size: 'sm', flex: 5 },
                                ],
                            },
                            {
                                type: 'box',
                                layout: 'baseline',
                                contents: [
                                    { type: 'text', text: 'คงเหลือ', color: '#aaaaaa', size: 'sm', flex: 1 },
                                    { type: 'text', text: `${order.balance.toLocaleString()} THB`, wrap: true, color: '#666666', size: 'sm', flex: 5 },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'separator',
                        margin: 'xxl',
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        height: 'sm',
                        action: {
                            type: 'uri',
                            label: 'ดูรายละเอียด & สถานะ',
                            uri: trackingUrl,
                        },
                        color: '#6B21A8',
                    },
                ],
            },
        },
    };

    await pushMessage(to, [flexMessage]);
}

// 3. Template: Status Update
export async function sendStatusUpdate(to: string, order: IOrder, status: string) {
    const trackingUrl = `${APP_URL}/tracking/${order._id}`;

    // Map status to Thai message
    const statusMap: Record<string, { label: string; color: string; desc: string }> = {
        confirmed: { label: 'ยืนยันออเดอร์', color: '#10B981', desc: 'ร้านค้าได้รับออเดอร์แล้ว กำลังเตรียมการผลิต' },
        producing: { label: 'กำลังตัดเย็บ', color: '#3B82F6', desc: 'ช่างกำลังดำเนินการตัดเย็บชุดของคุณอย่างประณีต' },
        qc: { label: 'ตรวจสอบคุณภาพ', color: '#8B5CF6', desc: 'ชุดตัดเสร็จแล้ว กำลังตรวจสอบความเรียบร้อย' },
        packing: { label: 'กำลังแพ็ค', color: '#EC4899', desc: 'กำลังรีดและแพ็คสินค้า' },
        ready_to_ship: { label: 'รอส่งมอบ/จัดส่ง', color: '#F59E0B', desc: 'สินค้าพร้อมแล้ว รอการจัดส่งหรือมารับ' },
        completed: { label: 'เสร็จสิ้น', color: '#6B7280', desc: 'ขอบคุณที่ใช้บริการครับ' },
        cancelled: { label: 'ยกเลิก', color: '#EF4444', desc: 'รายการถูกยกเลิก' },
    };

    const info = statusMap[status] || { label: status, color: '#666666', desc: 'มีการอัปเดตสถานะ' };

    const flexMessage = {
        type: 'flex',
        altText: `อัปเดตสถานะ: ${info.label}`,
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: 'UPDATE STATUS',
                        weight: 'bold',
                        color: info.color,
                        size: 'xs',
                    },
                    {
                        type: 'text',
                        text: info.label,
                        weight: 'bold',
                        size: 'xl',
                        margin: 'md',
                    },
                    {
                        type: 'text',
                        text: info.desc,
                        size: 'sm',
                        color: '#666666',
                        wrap: true,
                        margin: 'md',
                    },
                    {
                        type: 'separator',
                        margin: 'lg',
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        contents: [
                            {
                                type: 'text',
                                text: `Order: ${order.dressName}`,
                                size: 'xs',
                                color: '#aaaaaa',
                            },
                        ],
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'button',
                        style: 'link',
                        height: 'sm',
                        action: {
                            type: 'uri',
                            label: 'เปิดดูสถานะ',
                            uri: trackingUrl,
                        },
                    },
                ],
            },
        },
    };

    await pushMessage(to, [flexMessage]);
}
