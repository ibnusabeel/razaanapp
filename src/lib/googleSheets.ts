import { google } from 'googleapis';
import { IOrder } from '@/models/Order';

// กำหนดค่า Google Sheets API
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID!;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')!;

/**
 * สร้าง Google Sheets client
 * ใช้ Service Account สำหรับ authentication
 */
async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
}

/**
 * เพิ่มข้อมูล Order ลง Google Sheets
 * @param order - ข้อมูล Order ที่ต้องการบันทึก
 */
export async function appendOrderToSheet(order: IOrder): Promise<void> {
    try {
        const sheets = await getGoogleSheetsClient();

        // จัดรูปแบบวันที่
        const orderDate = new Date(order.orderDate).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // เตรียมข้อมูลสำหรับ append (เรียงตามคอลัมน์ใน Sheet)
        const values = [
            [
                order._id?.toString() || '',
                orderDate,
                order.customerName,
                order.phone,
                order.dressName,
                order.color,
                order.size,
                order.price,
                order.deposit,
                order.balance,
                order.points === 'give' ? 'ให้' : 'ไม่ให้',
                order.measurements?.shoulder || 0,
                order.measurements?.chest || 0,
                order.measurements?.waist || 0,
                order.measurements?.armhole || 0,
                order.measurements?.sleeveLength || 0,
                order.measurements?.wrist || 0,
                order.measurements?.upperArm || 0,
                order.measurements?.hips || 0,
                order.measurements?.totalLength || 0,
                order.deliveryAddress,
                order.notes,
                new Date().toLocaleString('th-TH'),
            ],
        ];

        // Append ข้อมูลไปยัง Sheet แรก
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEETS_ID,
            range: 'ชีต1!A:W', // คอลัมน์ A ถึง W
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        console.log('✅ บันทึกข้อมูลลง Google Sheets สำเร็จ');
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการบันทึกลง Google Sheets:', error);
        // ไม่ throw error เพื่อให้ flow หลักทำงานต่อได้
    }
}

/**
 * สร้าง Header Row สำหรับ Google Sheets (ใช้ครั้งแรก)
 */
export async function initializeSheetHeaders(): Promise<void> {
    try {
        const sheets = await getGoogleSheetsClient();

        const headers = [
            [
                'Order ID',
                'วันที่สั่ง',
                'ชื่อลูกค้า',
                'เบอร์ติดต่อ',
                'ชื่อชุด',
                'สี',
                'ไซส์',
                'ราคา',
                'มัดจำ',
                'คงเหลือ',
                'แต้ม',
                'ไหล่',
                'รอบอก',
                'เอว',
                'วงแขน',
                'ยาวแขน',
                'รอบข้อมือ',
                'ต้นแขน',
                'สะโพก',
                'ความยาวชุด',
                'ที่อยู่จัดส่ง',
                'หมายเหตุ',
                'บันทึกเมื่อ',
            ],
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SHEETS_ID,
            range: 'ชีต1!A1:W1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: headers,
            },
        });

        console.log('✅ สร้าง Header Row สำเร็จ');
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้าง Header:', error);
    }
}
