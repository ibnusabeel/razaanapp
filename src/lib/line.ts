import { IOrder } from '@/models/Order';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_TAILOR_USER_ID = process.env.LINE_TAILOR_USER_ID; // LINE ID ของช่างตัด

// Helper to push message
async function pushMessage(to: string, messages: any[]) {
    if (!LINE_CHANNEL_ACCESS_TOKEN) {
        console.error('❌ LINE_CHANNEL_ACCESS_TOKEN is not set!');
        return false;
    }

    console.log('📤 Pushing message to:', to);

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
            console.error('❌ LINE API Error:', JSON.stringify(error));
            return false;
        }

        console.log('✅ Message pushed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Network Error:', error);
        return false;
    }
}

// 1. Welcome Message (ลงทะเบียนสำเร็จ)
export async function sendWelcomeMessage(to: string, customerName: string) {
    const flexMessage = {
        type: 'flex',
        altText: `ยินดีต้อนรับ ${customerName} สู่ Razaan`,
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    { type: 'text', text: '🎉 ยินดีต้อนรับ!', weight: 'bold', size: 'xl', color: '#6B21A8' },
                    { type: 'text', text: `สวัสดีคุณ ${customerName}`, size: 'md', margin: 'md' },
                    { type: 'text', text: 'คุณพร้อมสำหรับการตัดชุดแล้ว\nพนักงานจะทำการวัดตัวและบันทึกข้อมูลให้ค่ะ', size: 'sm', color: '#666666', wrap: true, margin: 'md' },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [{ type: 'text', text: 'Razaan - Dignity Among Women', size: 'xs', color: '#aaaaaa', align: 'center' }],
            },
        },
    };
    await pushMessage(to, [flexMessage]);
}

// 2. Order Confirmation (สร้าง Order สำเร็จ)
export async function sendOrderConfirmation(to: string, order: IOrder) {
    const flexMessage = {
        type: 'flex',
        altText: `ยืนยันการสั่งตัด: ${order.dressName}`,
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    { type: 'text', text: '✅ รับออเดอร์แล้ว', weight: 'bold', size: 'xl', color: '#10B981' },
                    { type: 'text', text: order.dressName, weight: 'bold', size: 'lg', margin: 'md' },
                    { type: 'separator', margin: 'lg' },
                    {
                        type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm',
                        contents: [
                            {
                                type: 'box', layout: 'baseline', contents: [
                                    { type: 'text', text: 'ราคา', color: '#aaaaaa', size: 'sm', flex: 1 },
                                    { type: 'text', text: `${order.price?.toLocaleString()} ฿`, size: 'sm', flex: 2 },
                                ]
                            },
                            {
                                type: 'box', layout: 'baseline', contents: [
                                    { type: 'text', text: 'มัดจำ', color: '#aaaaaa', size: 'sm', flex: 1 },
                                    { type: 'text', text: `${order.deposit?.toLocaleString()} ฿`, size: 'sm', flex: 2 },
                                ]
                            },
                            {
                                type: 'box', layout: 'baseline', contents: [
                                    { type: 'text', text: 'คงเหลือ', color: '#aaaaaa', size: 'sm', flex: 1 },
                                    { type: 'text', text: `${order.balance?.toLocaleString()} ฿`, size: 'sm', color: '#EF4444', flex: 2 },
                                ]
                            },
                        ],
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [{ type: 'text', text: 'เราจะแจ้งเตือนเมื่อมีการอัปเดตสถานะ', size: 'xs', color: '#aaaaaa', align: 'center' }],
            },
        },
    };
    await pushMessage(to, [flexMessage]);
}

// 3. Status Update (อัปเดตสถานะ)
export async function sendStatusUpdate(to: string, order: IOrder, status: string) {
    const statusMap: Record<string, { label: string; color: string; emoji: string }> = {
        confirmed: { label: 'ยืนยันออเดอร์', color: '#10B981', emoji: '✅' },
        producing: { label: 'กำลังตัดเย็บ', color: '#3B82F6', emoji: '✂️' },
        qc: { label: 'ตรวจสอบคุณภาพ', color: '#8B5CF6', emoji: '🔍' },
        packing: { label: 'กำลังแพ็ค', color: '#EC4899', emoji: '📦' },
        ready_to_ship: { label: 'พร้อมรับชุด', color: '#F59E0B', emoji: '🎉' },
        completed: { label: 'ส่งมอบแล้ว', color: '#6B7280', emoji: '💜' },
        cancelled: { label: 'ยกเลิก', color: '#EF4444', emoji: '❌' },
    };

    const info = statusMap[status] || { label: status, color: '#666666', emoji: '📋' };

    const flexMessage = {
        type: 'flex',
        altText: `${info.emoji} ${info.label}: ${order.dressName}`,
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    { type: 'text', text: `${info.emoji} ${info.label}`, weight: 'bold', size: 'xl', color: info.color },
                    { type: 'text', text: order.dressName, size: 'md', margin: 'md' },
                    { type: 'text', text: `ลูกค้า: ${order.customerName}`, size: 'sm', color: '#666666', margin: 'sm' },
                ],
            },
        },
    };
    await pushMessage(to, [flexMessage]);
}

// 4. Tailor Notification (ส่งงานให้ช่างตัด)
export async function sendTailorNotification(order: IOrder) {
    if (!LINE_TAILOR_USER_ID) {
        console.error('❌ LINE_TAILOR_USER_ID is not set!');
        return false;
    }

    const measurements = order.measurements || {};
    const measurementText = [
        `ไหล่: ${measurements.shoulder || '-'} ซม.`,
        `อก: ${measurements.chest || '-'} ซม.`,
        `เอว: ${measurements.waist || '-'} ซม.`,
        `สะโพก: ${measurements.hips || '-'} ซม.`,
        `ความยาว: ${measurements.totalLength || '-'} ซม.`,
    ].join('\n');

    const flexMessage = {
        type: 'flex',
        altText: `📋 งานใหม่: ${order.dressName}`,
        contents: {
            type: 'bubble',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#6B21A8',
                paddingAll: 'lg',
                contents: [
                    { type: 'text', text: '✂️ งานตัดชุดใหม่', weight: 'bold', size: 'lg', color: '#ffffff' },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    { type: 'text', text: order.dressName, weight: 'bold', size: 'xl' },
                    { type: 'text', text: `ลูกค้า: ${order.customerName}`, size: 'sm', color: '#666666', margin: 'md' },
                    { type: 'text', text: `สี: ${order.color || '-'}`, size: 'sm', color: '#666666' },
                    { type: 'separator', margin: 'lg' },
                    { type: 'text', text: '📐 ไซส์:', weight: 'bold', size: 'sm', margin: 'lg' },
                    { type: 'text', text: measurementText, size: 'sm', color: '#333333', wrap: true },
                    order.notes ? { type: 'text', text: `📝 หมายเหตุ: ${order.notes}`, size: 'sm', color: '#EF4444', wrap: true, margin: 'lg' } : { type: 'filler' },
                ],
            },
        },
    };

    return await pushMessage(LINE_TAILOR_USER_ID, [flexMessage]);
}
