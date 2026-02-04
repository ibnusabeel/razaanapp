import { IOrder } from '@/models/Order';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_TAILOR_USER_ID = process.env.LINE_TAILOR_USER_ID; // LINE ID ของช่างตัด
const LINE_ADMIN_USER_IDS = process.env.LINE_ADMIN_USER_IDS?.split(',').filter(Boolean) || []; // LINE IDs ของ Admin ทั้งหมด

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

// 3. Status Update (แจ้งเตือนสถานะ - สวยๆ หลากสี)
export async function sendStatusUpdate(to: string, order: IOrder, status: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';
    const orderUrl = `${appUrl}/receipt/${order._id}`;

    // สีสันชัดเจนสำหรับแต่ละสถานะ
    const statusMap: Record<string, {
        label: string;
        headerColor: string;
        accentColor: string;
        icon: string;
        desc: string;
        emoji: string;
    }> = {
        confirmed: {
            label: 'ยืนยันแล้ว!',
            headerColor: '#10B981', // Emerald
            accentColor: '#059669',
            icon: '✅',
            desc: 'ร้านค้ายืนยันออเดอร์แล้วค่ะ\nกำลังเตรียมเข้าสู่กระบวนการตัดเย็บ',
            emoji: '💚'
        },
        producing: {
            label: 'กำลังตัดเย็บ',
            headerColor: '#3B82F6', // Blue
            accentColor: '#2563EB',
            icon: '✂️',
            desc: 'ช่างกำลังตัดเย็บชุดของคุณ\nด้วยความประณีตทุกฝีเข็มค่ะ',
            emoji: '💙'
        },
        qc: {
            label: 'ตรวจสอบคุณภาพ',
            headerColor: '#8B5CF6', // Violet
            accentColor: '#7C3AED',
            icon: '🔍',
            desc: 'กำลังตรวจสอบความเรียบร้อย\nเพื่อให้มั่นใจในคุณภาพก่อนส่งมอบ',
            emoji: '💜'
        },
        packing: {
            label: 'กำลังแพ็ค',
            headerColor: '#EC4899', // Pink
            accentColor: '#DB2777',
            icon: '📦',
            desc: 'กำลังแพ็คสินค้าอย่างพิถีพิถัน\nเตรียมจัดส่งให้คุณลูกค้าค่ะ',
            emoji: '💗'
        },
        ready_to_ship: {
            label: 'พร้อมส่งแล้ว!',
            headerColor: '#F59E0B', // Amber
            accentColor: '#D97706',
            icon: '🚚',
            desc: 'สินค้าพร้อมจัดส่งแล้วค่ะ\nหรือเข้ามารับที่ร้านได้เลย!',
            emoji: '🧡'
        },
        completed: {
            label: 'ส่งมอบสำเร็จ!',
            headerColor: '#059669', // Teal
            accentColor: '#047857',
            icon: '🎉',
            desc: 'ขอบคุณที่ใช้บริการ Razaan ค่ะ\nหวังว่าจะได้บริการคุณอีกนะคะ',
            emoji: '💚'
        },
        cancelled: {
            label: 'ยกเลิกออเดอร์',
            headerColor: '#EF4444', // Red
            accentColor: '#DC2626',
            icon: '❌',
            desc: 'ออเดอร์นี้ถูกยกเลิกแล้วค่ะ\nหากมีข้อสงสัย ติดต่อร้านได้เลยนะคะ',
            emoji: '❤️'
        },
    };

    const info = statusMap[status] || {
        label: status,
        headerColor: '#6B7280',
        accentColor: '#4B5563',
        icon: '📋',
        desc: 'มีการอัปเดตสถานะออเดอร์ค่ะ',
        emoji: '💬'
    };

    const flexMessage = {
        type: 'flex',
        altText: `${info.icon} ${info.label}: ${order.dressName}`,
        contents: {
            type: 'bubble',
            size: 'giga',
            styles: {
                header: { backgroundColor: info.headerColor },
                body: { backgroundColor: '#FFFFFF' },
                footer: { backgroundColor: '#FAFAFA' }
            },
            header: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'xl',
                contents: [
                    {
                        type: 'text',
                        text: info.icon,
                        size: '4xl',
                        align: 'center'
                    },
                    {
                        type: 'text',
                        text: info.label,
                        weight: 'bold',
                        size: 'xxl',
                        color: '#FFFFFF',
                        align: 'center',
                        margin: 'md'
                    },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                spacing: 'lg',
                contents: [
                    // Description
                    {
                        type: 'text',
                        text: info.desc,
                        size: 'md',
                        color: '#374151',
                        align: 'center',
                        wrap: true,
                        lineSpacing: '8px'
                    },
                    { type: 'separator' },
                    // Order Card
                    {
                        type: 'box',
                        layout: 'vertical',
                        backgroundColor: '#F9FAFB',
                        cornerRadius: 'lg',
                        paddingAll: 'lg',
                        contents: [
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: '👗', size: 'xxl' },
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        paddingStart: 'md',
                                        contents: [
                                            {
                                                type: 'text',
                                                text: order.dressName,
                                                weight: 'bold',
                                                size: 'lg',
                                                color: '#1F2937',
                                                wrap: true
                                            },
                                            {
                                                type: 'text',
                                                text: `${order.color || '-'} • ${order.size || '-'}`,
                                                size: 'sm',
                                                color: '#6B7280',
                                                margin: 'xs'
                                            },
                                        ]
                                    }
                                ]
                            },
                            { type: 'separator', margin: 'md' },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                margin: 'md',
                                contents: [
                                    { type: 'text', text: 'เลขออเดอร์', size: 'sm', color: '#9CA3AF', flex: 1 },
                                    { type: 'text', text: order.orderNumber || 'N/A', size: 'sm', color: '#1F2937', align: 'end', weight: 'bold', flex: 1 },
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                margin: 'sm',
                                contents: [
                                    { type: 'text', text: 'ราคา', size: 'sm', color: '#9CA3AF', flex: 1 },
                                    { type: 'text', text: `฿${order.price?.toLocaleString() || 0}`, size: 'sm', color: '#1F2937', align: 'end', weight: 'bold', flex: 1 },
                                ]
                            },
                            ...(order.balance && order.balance > 0 ? [{
                                type: 'box' as const,
                                layout: 'horizontal' as const,
                                margin: 'sm',
                                contents: [
                                    { type: 'text' as const, text: 'ค้างชำระ', size: 'sm' as const, color: '#EF4444', flex: 1 },
                                    { type: 'text' as const, text: `฿${order.balance?.toLocaleString()}`, size: 'sm' as const, color: '#EF4444', align: 'end' as const, weight: 'bold' as const, flex: 1 },
                                ]
                            }] : []),
                        ]
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'md',
                spacing: 'sm',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        color: info.accentColor,
                        height: 'md',
                        action: { type: 'uri', label: '📋 ดูรายละเอียด / ใบเสร็จ', uri: orderUrl },
                    },
                    {
                        type: 'text',
                        text: `${info.emoji} Razaan - Dignity Among Women`,
                        size: 'xxs',
                        color: '#9CA3AF',
                        align: 'center',
                        margin: 'sm'
                    },
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

// 5. Admin Notification (ส่งรายละเอียดออเดอร์ให้ Admin ทุกคน)
export async function sendAdminNotification(order: IOrder) {
    if (LINE_ADMIN_USER_IDS.length === 0) {
        console.log('⚠️ No LINE_ADMIN_USER_IDS configured');
        return false;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';
    const orderUrl = `${appUrl}/orders/${order._id}`;
    const orderDate = new Date(order.orderDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    const measurements = order.measurements || {};
    const measurementText = [
        measurements.shoulder ? `ไหล่ ${measurements.shoulder}"` : '',
        measurements.chest ? `อก ${measurements.chest}"` : '',
        measurements.waist ? `เอว ${measurements.waist}"` : '',
        measurements.hips ? `สะโพก ${measurements.hips}"` : '',
        measurements.totalLength ? `ยาว ${measurements.totalLength}"` : '',
    ].filter(Boolean).join(' | ') || 'ไม่ระบุ';

    const flexMessage = {
        type: 'flex',
        altText: `🔔 ออเดอร์ใหม่ ${order.orderNumber}: ${order.customerName}`,
        contents: {
            type: 'bubble',
            size: 'giga',
            styles: {
                header: { backgroundColor: '#EC4899' }, // Pink
                body: { backgroundColor: '#FDF2F8' },
            },
            header: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                contents: [
                    { type: 'text', text: '🔔 ออเดอร์ใหม่!', weight: 'bold', size: 'xl', color: '#ffffff', align: 'center' },
                    { type: 'text', text: order.orderNumber || 'N/A', size: 'sm', color: '#ffffffcc', align: 'center', margin: 'xs' },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                spacing: 'md',
                contents: [
                    // Customer Info
                    {
                        type: 'box', layout: 'vertical', spacing: 'xs',
                        contents: [
                            { type: 'text', text: '👤 ลูกค้า', size: 'xs', color: '#9B9A97', weight: 'bold' },
                            { type: 'text', text: order.customerName, size: 'lg', weight: 'bold', color: '#1F2937' },
                            { type: 'text', text: `📞 ${order.phone}`, size: 'sm', color: '#6B7280' },
                        ]
                    },
                    { type: 'separator' },
                    // Product Info
                    {
                        type: 'box', layout: 'vertical', spacing: 'xs',
                        contents: [
                            { type: 'text', text: '👗 รายการ', size: 'xs', color: '#9B9A97', weight: 'bold' },
                            { type: 'text', text: order.dressName, size: 'md', weight: 'bold', color: '#1F2937' },
                            {
                                type: 'box', layout: 'horizontal', spacing: 'md',
                                contents: [
                                    { type: 'text', text: `🎨 ${order.color || '-'}`, size: 'sm', color: '#6B7280', flex: 1 },
                                    { type: 'text', text: `📏 ${order.size || '-'}`, size: 'sm', color: '#6B7280', flex: 1 },
                                ]
                            },
                        ]
                    },
                    { type: 'separator' },
                    // Measurements
                    {
                        type: 'box', layout: 'vertical', spacing: 'xs',
                        contents: [
                            { type: 'text', text: '📐 สัดส่วน', size: 'xs', color: '#9B9A97', weight: 'bold' },
                            { type: 'text', text: measurementText, size: 'sm', color: '#374151', wrap: true },
                        ]
                    },
                    { type: 'separator' },
                    // Payment Info
                    {
                        type: 'box', layout: 'vertical', spacing: 'sm',
                        contents: [
                            { type: 'text', text: '💰 การชำระเงิน', size: 'xs', color: '#9B9A97', weight: 'bold' },
                            {
                                type: 'box', layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: 'ราคาเต็ม', size: 'sm', color: '#6B7280', flex: 1 },
                                    { type: 'text', text: `฿${order.price?.toLocaleString() || 0}`, size: 'sm', color: '#1F2937', align: 'end', flex: 1, weight: 'bold' },
                                ]
                            },
                            {
                                type: 'box', layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: 'มัดจำแล้ว', size: 'sm', color: '#10B981', flex: 1 },
                                    { type: 'text', text: `฿${order.deposit?.toLocaleString() || 0}`, size: 'sm', color: '#10B981', align: 'end', flex: 1, weight: 'bold' },
                                ]
                            },
                            {
                                type: 'box', layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: 'ค้างชำระ', size: 'md', color: '#EF4444', flex: 1, weight: 'bold' },
                                    { type: 'text', text: `฿${order.balance?.toLocaleString() || 0}`, size: 'lg', color: '#EF4444', align: 'end', flex: 1, weight: 'bold' },
                                ]
                            },
                        ]
                    },
                    // Notes
                    ...(order.notes ? [
                        { type: 'separator' } as any,
                        {
                            type: 'box', layout: 'vertical',
                            contents: [
                                { type: 'text', text: '📝 หมายเหตุ', size: 'xs', color: '#9B9A97', weight: 'bold' },
                                { type: 'text', text: order.notes, size: 'sm', color: '#DC2626', wrap: true },
                            ]
                        }
                    ] : []),
                    // Delivery Address
                    ...(order.deliveryAddress ? [
                        { type: 'separator' } as any,
                        {
                            type: 'box', layout: 'vertical',
                            contents: [
                                { type: 'text', text: '📦 ที่อยู่จัดส่ง', size: 'xs', color: '#9B9A97', weight: 'bold' },
                                { type: 'text', text: order.deliveryAddress, size: 'sm', color: '#374151', wrap: true },
                            ]
                        }
                    ] : []),
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'md',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        color: '#7C3AED',
                        height: 'sm',
                        action: { type: 'uri', label: 'ดูรายละเอียดเพิ่มเติม', uri: orderUrl },
                    },
                    { type: 'text', text: `📅 ${orderDate}`, size: 'xxs', color: '#9B9A97', align: 'center', margin: 'sm' },
                ],
            },
        },
    };

    console.log(`📤 Sending to ${LINE_ADMIN_USER_IDS.length} admins...`);

    // ส่งให้ Admin ทุกคนพร้อมกัน
    const results = await Promise.all(
        LINE_ADMIN_USER_IDS.map(adminId => pushMessage(adminId.trim(), [flexMessage]))
    );

    const successCount = results.filter(Boolean).length;
    console.log(`✅ Sent to ${successCount}/${LINE_ADMIN_USER_IDS.length} admins`);

    return successCount > 0;
}

// 6. Tailor Job Notification (แจ้งงานใหม่ให้ช่าง)
export async function sendTailorJobNotification(to: string, order: IOrder) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.razaan.co';
    const orderUrl = `${appUrl}/tailor/orders/${order._id}`;

    const measurements = order.measurements || {};
    const measurementText = [
        measurements.shoulder ? `ไหล่ ${measurements.shoulder}"` : '',
        measurements.chest ? `อก ${measurements.chest}"` : '',
        measurements.waist ? `เอว ${measurements.waist}"` : '',
        measurements.hips ? `สะโพก ${measurements.hips}"` : '',
        measurements.totalLength ? `ยาว ${measurements.totalLength}"` : '',
    ].filter(Boolean).join(' | ') || 'ไม่ระบุ';

    const flexMessage = {
        type: 'flex',
        altText: `✂️ งานใหม่: ${order.dressName}`,
        contents: {
            type: 'bubble',
            size: 'giga',
            styles: {
                header: { backgroundColor: '#3B82F6' },
                body: { backgroundColor: '#EFF6FF' },
            },
            header: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'xl',
                contents: [
                    { type: 'text', text: '✂️', size: '4xl', align: 'center' },
                    { type: 'text', text: 'งานตัดชุดใหม่!', weight: 'bold', size: 'xxl', color: '#FFFFFF', align: 'center', margin: 'md' },
                    { type: 'text', text: order.orderNumber || 'N/A', size: 'sm', color: '#ffffffcc', align: 'center', margin: 'xs' },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                spacing: 'lg',
                contents: [
                    // Product Info
                    {
                        type: 'box', layout: 'vertical',
                        backgroundColor: '#FFFFFF',
                        cornerRadius: 'lg',
                        paddingAll: 'lg',
                        contents: [
                            { type: 'text', text: '👗 รายละเอียดชุด', size: 'xs', color: '#9CA3AF', weight: 'bold' },
                            { type: 'text', text: order.dressName, size: 'xl', weight: 'bold', color: '#1F2937', margin: 'xs' },
                            {
                                type: 'box', layout: 'horizontal', margin: 'md',
                                contents: [
                                    { type: 'text', text: `🎨 ${order.color || '-'}`, size: 'sm', color: '#6B7280', flex: 1 },
                                    { type: 'text', text: `📏 ${order.size || '-'}`, size: 'sm', color: '#6B7280', flex: 1 },
                                ]
                            },
                        ]
                    },
                    // Measurements
                    {
                        type: 'box', layout: 'vertical',
                        backgroundColor: '#FFFFFF',
                        cornerRadius: 'lg',
                        paddingAll: 'lg',
                        contents: [
                            { type: 'text', text: '📐 สัดส่วน', size: 'xs', color: '#9CA3AF', weight: 'bold' },
                            { type: 'text', text: measurementText, size: 'md', color: '#1F2937', wrap: true, margin: 'xs' },
                        ]
                    },
                    // Notes
                    ...(order.notes ? [{
                        type: 'box' as const, layout: 'vertical' as const,
                        backgroundColor: '#FEF2F2',
                        cornerRadius: 'lg',
                        paddingAll: 'lg',
                        contents: [
                            { type: 'text' as const, text: '⚠️ หมายเหตุสำคัญ', size: 'xs' as const, color: '#DC2626', weight: 'bold' as const },
                            { type: 'text' as const, text: order.notes, size: 'md' as const, color: '#DC2626', wrap: true, margin: 'xs' },
                        ]
                    }] : []),
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'md',
                spacing: 'sm',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        color: '#2563EB',
                        height: 'md',
                        action: { type: 'uri', label: '📋 ดูรายละเอียด / อัปเดตสถานะ', uri: orderUrl },
                    },
                    { type: 'text', text: '💙 Razaan - ขอบคุณที่ร่วมงานค่ะ', size: 'xxs', color: '#9CA3AF', align: 'center', margin: 'sm' },
                ],
            },
        },
    };

    return await pushMessage(to, [flexMessage]);
}

// 7. Tailor Status Update (แจ้ง Admin เมื่อช่างอัปเดตสถานะ)
export async function sendTailorStatusUpdate(order: IOrder, tailorStatus: string) {
    if (LINE_ADMIN_USER_IDS.length === 0) {
        console.log('⚠️ No LINE_ADMIN_USER_IDS configured');
        return false;
    }

    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
        pending: { label: 'รอดำเนินการ', color: '#9CA3AF', icon: '⏳' },
        cutting: { label: 'กำลังตัดผ้า', color: '#3B82F6', icon: '✂️' },
        sewing: { label: 'กำลังเย็บ', color: '#8B5CF6', icon: '🧵' },
        finishing: { label: 'ตกแต่ง/เก็บงาน', color: '#EC4899', icon: '✨' },
        done: { label: 'เสร็จแล้ว!', color: '#10B981', icon: '✅' },
        delivered: { label: 'ส่งมอบแล้ว', color: '#059669', icon: '📦' },
    };

    const info = statusMap[tailorStatus] || { label: tailorStatus, color: '#6B7280', icon: '📋' };

    const flexMessage = {
        type: 'flex',
        altText: `${info.icon} ช่างอัปเดต: ${info.label}`,
        contents: {
            type: 'bubble',
            size: 'kilo',
            styles: {
                header: { backgroundColor: info.color },
            },
            header: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                contents: [
                    { type: 'text', text: `${info.icon} ${info.label}`, weight: 'bold', size: 'lg', color: '#FFFFFF', align: 'center' },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: 'lg',
                spacing: 'sm',
                contents: [
                    { type: 'text', text: order.dressName, weight: 'bold', size: 'md', color: '#1F2937' },
                    { type: 'text', text: `ลูกค้า: ${order.customerName}`, size: 'sm', color: '#6B7280' },
                    { type: 'text', text: `ออเดอร์: ${order.orderNumber || 'N/A'}`, size: 'sm', color: '#6B7280' },
                    ...(order.tailorNotes ? [{ type: 'text' as const, text: `📝 ${order.tailorNotes}`, size: 'sm' as const, color: '#DC2626', wrap: true, margin: 'md' }] : []),
                ],
            },
        },
    };

    const results = await Promise.all(
        LINE_ADMIN_USER_IDS.map(adminId => pushMessage(adminId.trim(), [flexMessage]))
    );

    return results.some(Boolean);
}
