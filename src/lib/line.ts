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

// 2. Order Confirmation (ใบเสร็จออนไลน์ - สวยๆ หลากสี)
export async function sendOrderConfirmation(to: string, order: IOrder) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';
    const orderUrl = `${appUrl}/receipt/${order._id}`; // Public receipt page
    const orderDate = new Date(order.orderDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    const flexMessage = {
        type: 'flex',
        altText: `📄 ใบเสร็จ ${order.orderNumber}: ${order.dressName}`,
        contents: {
            type: 'bubble',
            size: 'giga',
            styles: {
                header: { backgroundColor: '#7C3AED' }, // Purple header
                body: { backgroundColor: '#FAFAFA' },
                footer: { backgroundColor: '#FAFAFA' },
            },
            header: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                contents: [
                    { type: 'text', text: '✨ RAZAAN ✨', weight: 'bold', size: 'xl', color: '#ffffff', align: 'center' },
                    { type: 'text', text: 'ใบเสร็จรับเงิน', size: 'sm', color: '#ffffffcc', align: 'center', margin: 'xs' },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                contents: [
                    // Order Number Badge
                    {
                        type: 'box', layout: 'horizontal', justifyContent: 'center', margin: 'none',
                        contents: [
                            {
                                type: 'box', layout: 'vertical', backgroundColor: '#10B981', cornerRadius: 'lg', paddingAll: 'sm',
                                contents: [
                                    { type: 'text', text: order.orderNumber || 'N/A', weight: 'bold', size: 'lg', color: '#ffffff', align: 'center' },
                                ]
                            }
                        ]
                    },

                    { type: 'separator', margin: 'lg' },

                    // Customer Info
                    {
                        type: 'box', layout: 'vertical', margin: 'lg',
                        contents: [
                            { type: 'text', text: '👤 ลูกค้า', size: 'xs', color: '#8B5CF6', weight: 'bold' },
                            { type: 'text', text: order.customerName, size: 'md', weight: 'bold', color: '#1F2937', margin: 'xs' },
                        ]
                    },

                    // Product Info
                    {
                        type: 'box', layout: 'vertical', margin: 'lg', backgroundColor: '#F3E8FF', cornerRadius: 'md', paddingAll: 'md',
                        contents: [
                            { type: 'text', text: '👗 รายละเอียดชุด', size: 'xs', color: '#7C3AED', weight: 'bold' },
                            { type: 'text', text: order.dressName, size: 'lg', weight: 'bold', color: '#1F2937', margin: 'sm' },
                            {
                                type: 'box', layout: 'horizontal', margin: 'sm', spacing: 'lg',
                                contents: [
                                    { type: 'text', text: `🎨 สี: ${order.color || '-'}`, size: 'sm', color: '#4B5563', flex: 1 },
                                    { type: 'text', text: `📏 ไซส์: ${order.size || '-'}`, size: 'sm', color: '#4B5563', flex: 1 },
                                ]
                            },
                        ]
                    },

                    { type: 'separator', margin: 'lg' },

                    // Payment Summary
                    {
                        type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm',
                        contents: [
                            { type: 'text', text: '💰 สรุปยอดชำระ', size: 'xs', color: '#F59E0B', weight: 'bold' },
                            {
                                type: 'box', layout: 'horizontal', margin: 'sm',
                                contents: [
                                    { type: 'text', text: 'ราคาเต็ม', size: 'sm', color: '#6B7280', flex: 1 },
                                    { type: 'text', text: `${order.price?.toLocaleString()} ฿`, size: 'sm', color: '#1F2937', align: 'end', flex: 1 },
                                ]
                            },
                            {
                                type: 'box', layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: 'มัดจำแล้ว', size: 'sm', color: '#10B981', flex: 1, weight: 'bold' },
                                    { type: 'text', text: `-${order.deposit?.toLocaleString()} ฿`, size: 'sm', color: '#10B981', align: 'end', flex: 1, weight: 'bold' },
                                ]
                            },
                            { type: 'separator' },
                            {
                                type: 'box', layout: 'horizontal', margin: 'sm',
                                contents: [
                                    { type: 'text', text: 'ยอดคงเหลือ', size: 'md', color: '#1F2937', flex: 1, weight: 'bold' },
                                    { type: 'text', text: `${order.balance?.toLocaleString()} ฿`, size: 'xl', color: '#EF4444', align: 'end', flex: 1, weight: 'bold' },
                                ]
                            },
                        ],
                    },

                    // Order Date
                    { type: 'text', text: `📅 วันที่: ${orderDate}`, size: 'xs', color: '#9CA3AF', align: 'center', margin: 'lg' },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                spacing: 'sm',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        color: '#7C3AED',
                        action: { type: 'uri', label: '🧾 ดูใบเสร็จ / สถานะ', uri: orderUrl },
                    },
                    { type: 'text', text: 'ขอบคุณที่ใช้บริการ Razaan ค่ะ 💜', size: 'xs', color: '#9CA3AF', align: 'center', margin: 'sm' },
                ],
            },
        },
    };
    await pushMessage(to, [flexMessage]);
}

// 3. Status Update (แจ้งเตือนสถานะ - สวยๆ)
export async function sendStatusUpdate(to: string, order: IOrder, status: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';
    const orderUrl = `${appUrl}/receipt/${order._id}`; // Public receipt page

    const statusMap: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
        confirmed: { label: 'ยืนยันออเดอร์', color: '#10B981', bg: '#D1FAE5', icon: '✅', desc: 'ร้านค้ายืนยันออเดอร์แล้ว' },
        producing: { label: 'กำลังตัดเย็บ', color: '#3B82F6', bg: '#DBEAFE', icon: '✂️', desc: 'ช่างกำลังดำเนินการตัดเย็บชุดของคุณ' },
        qc: { label: 'ตรวจสอบคุณภาพ', color: '#8B5CF6', bg: '#EDE9FE', icon: '🔍', desc: 'กำลังตรวจสอบความเรียบร้อยก่อนส่ง' },
        packing: { label: 'กำลังแพ็ค', color: '#EC4899', bg: '#FCE7F3', icon: '📦', desc: 'กำลังแพ็คสินค้าเตรียมจัดส่ง' },
        ready_to_ship: { label: 'พร้อมส่ง/รับ', color: '#F59E0B', bg: '#FEF3C7', icon: '🛍️', desc: 'สินค้าพร้อมจัดส่ง หรือเข้ามารับได้เลย' },
        completed: { label: 'ส่งมอบสำเร็จ', color: '#6B7280', bg: '#F3F4F6', icon: '🎉', desc: 'ขอบคุณที่ใช้บริการค่ะ' },
        cancelled: { label: 'ยกเลิก', color: '#EF4444', bg: '#FEE2E2', icon: '❌', desc: 'ออเดอร์นี้ถูกยกเลิก' },
    };

    const info = statusMap[status] || { label: status, color: '#666666', bg: '#f3f4f6', icon: '📋', desc: 'มีการอัปเดตสถานะ' };

    const flexMessage = {
        type: 'flex',
        altText: `${info.icon} อัปเดตสถานะ: ${info.label}`,
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    // Status Badge
                    {
                        type: 'box', layout: 'vertical', backgroundColor: info.bg, cornerRadius: 'md', paddingAll: 'md',
                        contents: [
                            { type: 'text', text: info.icon, size: '3xl', align: 'center' },
                            { type: 'text', text: info.label, weight: 'bold', size: 'lg', color: info.color, align: 'center', margin: 'sm' },
                        ]
                    },
                    { type: 'text', text: info.desc, size: 'sm', color: '#555555', align: 'center', margin: 'md', wrap: true },
                    { type: 'separator', margin: 'lg' },

                    // Order Info
                    {
                        type: 'box', layout: 'vertical', margin: 'lg', spacing: 'xs',
                        contents: [
                            { type: 'text', text: 'รายการสินค้า', size: 'xs', color: '#aaaaaa' },
                            { type: 'text', text: order.dressName, size: 'md', weight: 'bold', color: '#333333' },
                            { type: 'text', text: `ราคา: ${order.price?.toLocaleString()} ฿`, size: 'sm', color: '#666666' },
                        ]
                    },

                    // Button
                    {
                        type: 'button',
                        style: 'secondary',
                        action: { type: 'uri', label: 'ดูสถานะล่าสุด', uri: orderUrl },
                        margin: 'lg'
                    }
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
