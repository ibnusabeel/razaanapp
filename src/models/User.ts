import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    lineUserId: string; // LINE User ID (Unique)
    displayName: string; // ชื่อใน LINE
    pictureUrl?: string; // รูปโปรไฟล์ LINE
    realName: string; // ชื่อจริง
    phone: string; // เบอร์โทร
    address: string; // ที่อยู่
    role: 'customer' | 'admin' | 'tailor'; // เพิ่ม role ช่างตัด
    isActive: boolean; // สถานะใช้งาน (สำหรับช่าง)
    specialty?: string; // ความชำนาญ (สำหรับช่าง)
    measurements?: {
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
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        lineUserId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        displayName: {
            type: String,
            default: '',
        },
        pictureUrl: {
            type: String,
            default: '',
        },
        realName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        address: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['customer', 'admin', 'tailor'],
            default: 'customer',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        specialty: {
            type: String,
            default: '',
        },
        // เก็บไซส์ล่าสุดของลูกค้า
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
    },
    {
        timestamps: true,
    }
);

// Index สำหรับค้นหาช่าง
UserSchema.index({ role: 1, isActive: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
