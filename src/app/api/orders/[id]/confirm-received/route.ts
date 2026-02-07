import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]/confirm-received
 * ลูกค้ากดยืนยันว่ารับของแล้ว
 */
export async function GET(request: NextRequest, { params }: Props) {
    try {
        await connectDB();
        const { id } = await params;

        const order = await Order.findById(id);
        if (!order) {
            return new NextResponse(
                generateHTML('❌ ไม่พบออเดอร์', 'ออเดอร์นี้ไม่มีอยู่ในระบบ', 'error'),
                { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
        }

        if (order.customerConfirmedAt) {
            return new NextResponse(
                generateHTML('✅ ยืนยันเรียบร้อยแล้ว', `คุณได้ยืนยันรับของเมื่อ ${new Date(order.customerConfirmedAt).toLocaleDateString('th-TH')}`, 'success'),
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
        }

        // อัปเดต order
        order.customerConfirmedAt = new Date();
        order.status = 'completed';
        await order.save();

        return new NextResponse(
            generateHTML(
                '🎉 ขอบคุณค่ะ!',
                `ยืนยันการรับออเดอร์ ${order.orderNumber} เรียบร้อยแล้ว<br><br>ขอบคุณที่ใช้บริการ Razaan 💚`,
                'success'
            ),
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    } catch (error) {
        console.error('Error confirming order:', error);
        return new NextResponse(
            generateHTML('❌ เกิดข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง', 'error'),
            { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }
}

function generateHTML(title: string, message: string, type: 'success' | 'error') {
    const bgColor = type === 'success' ? '#10B981' : '#EF4444';
    const bgGradient = type === 'success'
        ? 'linear-gradient(135deg, #10B981, #059669)'
        : 'linear-gradient(135deg, #EF4444, #DC2626)';

    return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Razaan</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${bgGradient};
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 24px;
            padding: 40px 30px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 24px;
            color: #1F2937;
            margin-bottom: 16px;
        }
        p {
            color: #6B7280;
            line-height: 1.6;
            font-size: 16px;
        }
        .logo {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
        }
        .logo-text {
            font-size: 18px;
            font-weight: bold;
            color: ${bgColor};
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">${type === 'success' ? '✅' : '❌'}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <div class="logo">
            <span class="logo-text">💚 Razaan</span>
        </div>
    </div>
</body>
</html>
    `;
}
