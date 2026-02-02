import { IOrder } from '@/models/Order';
import QRCode from 'qrcode';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_USER_ID = process.env.LINE_USER_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * ส่งข้อความแจ้งเตือน Order ใหม่ไปยัง LINE OA
 * @param order - ข้อมูล Order ที่ต้องการส่ง
 */
export async function sendLineNotification(order: IOrder): Promise<void> {
    try {
        if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_USER_ID) {
            console.log('⚠️ ยังไม่ได้ตั้งค่า LINE credentials');
            return;
        }

        // สร้าง URL สำหรับหน้า Order Summary (Redirect ไปหน้า Tracking)
        const orderSummaryUrl = `${APP_URL}/tracking/${order._id}`;

        // สร้าง QR Code เป็น Base64 (สำหรับ Flex Message)
        const qrCodeDataUrl = await QRCode.toDataURL(orderSummaryUrl, {
            width: 200,
            margin: 2,
        });

        // จัดรูปแบบวันที่
        const orderDate = new Date(order.orderDate).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // สร้างข้อความ
        const message = `🎀 คำสั่งซื้อใหม่ - Razaan

👤 ลูกค้า: ${order.customerName}
📞 เบอร์: ${order.phone}
📅 วันที่: ${orderDate}

👗 ชุด: ${order.dressName}
🎨 สี: ${order.color}
📏 ไซส์: ${order.size || '-'}

💰 ราคา: ${order.price?.toLocaleString()} บาท
💵 มัดจำ: ${order.deposit?.toLocaleString()} บาท
📊 คงเหลือ: ${order.balance?.toLocaleString()} บาท

📦 ที่อยู่จัดส่ง: ${order.deliveryAddress || '-'}
📝 หมายเหตุ: ${order.notes || '-'}

🔗 ดูรายละเอียด: ${orderSummaryUrl}`;

        // ส่งข้อความผ่าน LINE Push Message API
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: LINE_USER_ID,
                messages: [
                    {
                        type: 'text',
                        text: message,
                    },
                    {
                        type: 'image',
                        originalContentUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(orderSummaryUrl)}&size=200x200`,
                        previewImageUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(orderSummaryUrl)}&size=200x200`,
                    },
                ],
            }),
        });

        if (response.ok) {
            console.log('✅ ส่งแจ้งเตือน LINE สำเร็จ');
        } else {
            const errorData = await response.json();
            console.error('❌ LINE API Error:', errorData);
        }
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการส่ง LINE notification:', error);
        // ไม่ throw error เพื่อให้ flow หลักทำงานต่อได้
    }
}

/**
 * สร้าง QR Code สำหรับ Order Summary
 * @param orderId - ID ของ Order
 * @returns QR Code เป็น Data URL
 */
export async function generateOrderQRCode(orderId: string): Promise<string> {
    const orderSummaryUrl = `${APP_URL}/tracking/${orderId}`;

    const qrCodeDataUrl = await QRCode.toDataURL(orderSummaryUrl, {
        width: 300,
        margin: 2,
        color: {
            dark: '#6B21A8', // สีม่วง Razaan
            light: '#FFFFFF',
        },
    });

    return qrCodeDataUrl;
}
