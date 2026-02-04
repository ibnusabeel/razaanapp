import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface สำหรับ Order Document
export interface IOrder extends Document {
  // ข้อมูลลูกค้า
  customerName: string;
  phone: string;
  customer?: Schema.Types.ObjectId;
  lineUserId?: string;

  // ข้อมูลคำสั่งซื้อ
  orderNumber: string;
  orderDate: Date;
  dressName: string;
  color: string;
  size: string;
  price: number;
  deposit: number;
  balance: number;
  points: 'give' | 'no';
  status: 'pending' | 'confirmed' | 'producing' | 'qc' | 'packing' | 'ready_to_ship' | 'completed' | 'cancelled';

  // ข้อมูลช่างตัด
  tailorId?: Schema.Types.ObjectId; // ช่างที่รับงาน
  tailorStatus?: 'pending' | 'cutting' | 'sewing' | 'finishing' | 'done' | 'delivered'; // สถานะงานของช่าง
  tailorAssignedAt?: Date; // วันที่มอบหมายงาน
  tailorCompletedAt?: Date; // วันที่ช่างทำเสร็จ
  tailorNotes?: string; // หมายเหตุจากช่าง

  // สัดส่วน (Measurements)
  measurements: {
    shoulder: number;
    chest: number;
    waist: number;
    armhole: number;
    sleeveLength: number;
    wrist: number;
    upperArm: number;
    hips: number;
    totalLength: number;
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

    // ข้อมูลช่างตัด
    tailorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    tailorStatus: {
      type: String,
      enum: ['pending', 'cutting', 'sewing', 'finishing', 'done', 'delivered'],
      default: 'pending',
    },
    tailorAssignedAt: {
      type: Date,
    },
    tailorCompletedAt: {
      type: Date,
    },
    tailorNotes: {
      type: String,
      default: '',
    },

    // สัดส่วน (Measurements)
    measurements: {
      shoulder: { type: Number, default: 0 },
      chest: { type: Number, default: 0 },
      waist: { type: Number, default: 0 },
      armhole: { type: Number, default: 0 },
      sleeveLength: { type: Number, default: 0 },
      wrist: { type: Number, default: 0 },
      upperArm: { type: Number, default: 0 },
      hips: { type: Number, default: 0 },
      totalLength: { type: Number, default: 0 },
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
    timestamps: true,
  }
);

// สร้าง Index
OrderSchema.index({ customerName: 'text', phone: 'text' });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ tailorId: 1, tailorStatus: 1 }); // Index สำหรับค้นหางานของช่าง

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
