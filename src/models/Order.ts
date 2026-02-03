import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface สำหรับ Order Document
export interface IOrder extends Document {
  // ข้อมูลลูกค้า
  customerName: string;
  phone: string;
  customer?: Schema.Types.ObjectId; // Link to User model
  lineUserId?: string; // LINE User ID (redundant but useful for direct access)

  // ข้อมูลคำสั่งซื้อ
  orderNumber: string; // เลข Order เช่น ORD-6802-001
  orderDate: Date;
  dressName: string;
  color: string;
  size: string;
  price: number;
  deposit: number;
  balance: number;
  points: 'give' | 'no'; // ให้/ไม่ให้ แต้ม
  status: 'pending' | 'confirmed' | 'producing' | 'qc' | 'packing' | 'ready_to_ship' | 'completed' | 'cancelled';

  // สัดส่วน (Measurements)
  measurements: {
    shoulder: number;      // ไหล่
    chest: number;         // รอบอก
    waist: number;         // เอว
    armhole: number;       // วงแขน
    sleeveLength: number;  // ยาวแขน
    wrist: number;         // รอบข้อมือ
    upperArm: number;      // ต้นแขน
    hips: number;          // สะโพก (วัดพอดี)
    totalLength: number;   // ความยาวชุด
  };

  // ข้อมูลการจัดส่ง
  deliveryAddress: string;
  notes: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// สร้าง Schema สำหรับ Order
const OrderSchema = new Schema<IOrder>(
  {
    // ข้อมูลลูกค้า
    customerName: {
      type: String,
      required: [true, 'กรุณากรอกชื่อลูกค้า'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'กรุณากรอกเบอร์ติดต่อ'],
      trim: true,
    },
    lineUserId: {
      type: String,
      trim: true,
    },

    // ข้อมูลคำสั่งซื้อ
    orderNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    orderDate: {
      type: Date,
      required: [true, 'กรุณาระบุวันที่สั่ง'],
      default: Date.now,
    },
    dressName: {
      type: String,
      required: [true, 'กรุณากรอกชื่อชุด'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'กรุณาระบุสี'],
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'กรุณาระบุราคา'],
      min: [0, 'ราคาต้องไม่ติดลบ'],
    },
    deposit: {
      type: Number,
      required: [true, 'กรุณาระบุเงินมัดจำ'],
      min: [0, 'เงินมัดจำต้องไม่ติดลบ'],
    },
    balance: {
      type: Number,
      required: true,
      min: [0, 'ยอดคงเหลือต้องไม่ติดลบ'],
    },
    points: {
      type: String,
      enum: ['give', 'no'],
      default: 'no',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'producing', 'qc', 'packing', 'ready_to_ship', 'completed', 'cancelled'],
      default: 'pending',
    },

    // สัดส่วน (Measurements) - ค่าเป็นนิ้วหรือเซนติเมตร
    measurements: {
      shoulder: { type: Number, default: 0 },      // ไหล่
      chest: { type: Number, default: 0 },         // รอบอก
      waist: { type: Number, default: 0 },         // เอว
      armhole: { type: Number, default: 0 },       // วงแขน
      sleeveLength: { type: Number, default: 0 },  // ยาวแขน
      wrist: { type: Number, default: 0 },         // รอบข้อมือ
      upperArm: { type: Number, default: 0 },      // ต้นแขน
      hips: { type: Number, default: 0 },          // สะโพก (วัดพอดี)
      totalLength: { type: Number, default: 0 },   // ความยาวชุด
    },

    // ข้อมูลการจัดส่ง
    deliveryAddress: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true, // เพิ่ม createdAt และ updatedAt อัตโนมัติ
  }
);

// สร้าง Index สำหรับการค้นหา
OrderSchema.index({ customerName: 'text', phone: 'text' });
OrderSchema.index({ orderDate: -1 });

// Export Model - ป้องกัน re-compile ใน development mode
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
