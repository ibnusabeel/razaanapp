import mongoose from 'mongoose';
import dns from 'dns';

// Fix DNS resolution issue for MongoDB Atlas on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('กรุณาตั้งค่า MONGODB_URI ใน environment variables');
}

/**
 * ฟังก์ชันเชื่อมต่อ MongoDB
 * ใช้ caching เพื่อป้องกันการสร้าง connection ซ้ำใน serverless environment
 */

// กำหนด type สำหรับ cache
interface MongooseCache {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForMongoose = globalThis as any;

let cached: MongooseCache = globalForMongoose.mongoose || { conn: null, promise: null };

if (!globalForMongoose.mongoose) {
    globalForMongoose.mongoose = cached;
}

async function connectDB(): Promise<mongoose.Mongoose> {
    // ถ้ามี connection อยู่แล้ว ให้ใช้ connection เดิม
    if (cached.conn) {
        return cached.conn;
    }

    // ถ้ายังไม่มี promise สำหรับ connection ให้สร้างใหม่
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
