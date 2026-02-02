'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MemberSelect from './MemberSelect';

// Interface สำหรับข้อมูลฟอร์ม
interface OrderFormData {
    customerName: string;
    phone: string;
    lineUserId?: string; // Added for LINE notifications
    orderDate: string;
    dressName: string;
    color: string;
    size: string;
    price: number | string;
    deposit: number | string;
    points: 'give' | 'no';
    measurements: {
        shoulder: number | string;
        chest: number | string;
        waist: number | string;
        armhole: number | string;
        sleeveLength: number | string;
        wrist: number | string;
        upperArm: number | string;
        hips: number | string;
        totalLength: number | string;
    };
    deliveryAddress: string;
    notes: string;
}

interface Member {
    _id: string;
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    realName: string;
    phone: string;
    address?: string;
}

interface OrderFormProps {
    initialData?: OrderFormData;
    orderId?: string;
    isEdit?: boolean;
}

const defaultFormData: OrderFormData = {
    customerName: '',
    phone: '',
    orderDate: new Date().toISOString().split('T')[0],
    dressName: '',
    color: '',
    size: '',
    price: '',
    deposit: '',
    points: 'no',
    measurements: {
        shoulder: '',
        chest: '',
        waist: '',
        armhole: '',
        sleeveLength: '',
        wrist: '',
        upperArm: '',
        hips: '',
        totalLength: '',
    },
    deliveryAddress: '',
    notes: '',
};

export default function OrderForm({ initialData, orderId, isEdit = false }: OrderFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<OrderFormData>(initialData || defaultFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // คำนวณยอดคงเหลือ
    const balance = (Number(formData.price) || 0) - (Number(formData.deposit) || 0);

    // Handle member selection - auto-fill customer info
    const handleMemberSelect = (member: Member | null) => {
        setSelectedMember(member);
        if (member) {
            setFormData(prev => ({
                ...prev,
                customerName: member.realName,
                phone: member.phone,
                deliveryAddress: member.address || prev.deliveryAddress,
                lineUserId: member.lineUserId,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                lineUserId: undefined,
            }));
        }
    };

    // Handle input change สำหรับ field ปกติ
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle input change สำหรับ measurements
    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            measurements: { ...prev.measurements, [name]: value },
        }));
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // แปลงค่าเป็นตัวเลข
            const submitData = {
                ...formData,
                price: Number(formData.price) || 0,
                deposit: Number(formData.deposit) || 0,
                measurements: {
                    shoulder: Number(formData.measurements.shoulder) || 0,
                    chest: Number(formData.measurements.chest) || 0,
                    waist: Number(formData.measurements.waist) || 0,
                    armhole: Number(formData.measurements.armhole) || 0,
                    sleeveLength: Number(formData.measurements.sleeveLength) || 0,
                    wrist: Number(formData.measurements.wrist) || 0,
                    upperArm: Number(formData.measurements.upperArm) || 0,
                    hips: Number(formData.measurements.hips) || 0,
                    totalLength: Number(formData.measurements.totalLength) || 0,
                },
            };

            const url = isEdit ? `/api/orders/${orderId}` : '/api/orders';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'เกิดข้อผิดพลาด');
            }

            // Redirect ไปหน้ารายละเอียด (เพื่อให้แสดง QR Code ได้ทันที)
            // ถ้าเป็น Edit ให้ไปหน้าเดิม ถ้าเป็น New ให้ไปหน้าที่เพิ่งสร้าง
            const targetId = isEdit ? orderId : result.data._id;
            router.push(`/orders/${targetId}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-purple-700">
                            {isEdit ? 'แก้ไขคำสั่งซื้อ' : 'Order ชุด'}
                        </h1>
                        <p className="text-sm text-gray-500">Razaan - Dignity Among Women</p>
                    </div>
                </div>
                {/* วันที่ */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">วันที่:</span>
                    <input
                        type="date"
                        name="orderDate"
                        value={formData.orderDate}
                        onChange={handleChange}
                        className="text-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Member Selection - เลือกลูกค้าสมาชิก LINE */}
            {!isEdit && (
                <div className="mb-6 animate-fade-in">
                    <label className="form-label mb-2 block">เชื่อมต่อลูกค้า LINE (สำหรับส่งแจ้งเตือนอัตโนมัติ)</label>
                    <MemberSelect
                        onSelect={handleMemberSelect}
                        selectedMember={selectedMember}
                    />
                </div>
            )}

            {/* ข้อมูลลูกค้าและชุด */}
            <div className="card mb-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="form-label">ชื่อลูกค้า *</label>
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            placeholder="ชื่อลูกค้า"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">ชื่อชุด *</label>
                        <input
                            type="text"
                            name="dressName"
                            value={formData.dressName}
                            onChange={handleChange}
                            placeholder="ชื่อชุด"
                            required
                        />
                    </div>
                </div>

                {/* สี, ไซส์, ราคา */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="form-label">สี *</label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="สี"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">ไซส์</label>
                        <input
                            type="text"
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            placeholder="ไซส์"
                        />
                    </div>
                    <div>
                        <label className="form-label">ราคา *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="ราคา"
                            min="0"
                            required
                        />
                    </div>
                </div>

                {/* มัดจำ, คงเหลือ, แต้ม */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="form-label">มัดจำ *</label>
                        <input
                            type="number"
                            name="deposit"
                            value={formData.deposit}
                            onChange={handleChange}
                            placeholder="มัดจำ"
                            min="0"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">คงเหลือ</label>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                            {balance.toLocaleString()} บาท
                        </div>
                    </div>
                    <div>
                        <label className="form-label">แต้ม</label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="points"
                                    value="give"
                                    checked={formData.points === 'give'}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span>ให้</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="points"
                                    value="no"
                                    checked={formData.points === 'no'}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span>ไม่ให้</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* สัดส่วน */}
            <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-lg font-bold text-purple-700 mb-4 text-center border-b pb-2">
                    สัดส่วน
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label className="form-label">ไหล่</label>
                        <input
                            type="number"
                            name="shoulder"
                            value={formData.measurements.shoulder}
                            onChange={handleMeasurementChange}
                            placeholder="ไหล่"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">รอบข้อมือ</label>
                        <input
                            type="number"
                            name="wrist"
                            value={formData.measurements.wrist}
                            onChange={handleMeasurementChange}
                            placeholder="รอบข้อมือ"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">รอบอก</label>
                        <input
                            type="number"
                            name="chest"
                            value={formData.measurements.chest}
                            onChange={handleMeasurementChange}
                            placeholder="รอบอก"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">ต้นแขน</label>
                        <input
                            type="number"
                            name="upperArm"
                            value={formData.measurements.upperArm}
                            onChange={handleMeasurementChange}
                            placeholder="ต้นแขน"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">เอว</label>
                        <input
                            type="number"
                            name="waist"
                            value={formData.measurements.waist}
                            onChange={handleMeasurementChange}
                            placeholder="เอว"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">สะโพก (วัดพอดี)</label>
                        <input
                            type="number"
                            name="hips"
                            value={formData.measurements.hips}
                            onChange={handleMeasurementChange}
                            placeholder="สะโพก"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">วงแขน</label>
                        <input
                            type="number"
                            name="armhole"
                            value={formData.measurements.armhole}
                            onChange={handleMeasurementChange}
                            placeholder="วงแขน"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">ยาวแขน</label>
                        <input
                            type="number"
                            name="sleeveLength"
                            value={formData.measurements.sleeveLength}
                            onChange={handleMeasurementChange}
                            placeholder="ยาวแขน"
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div>
                        <label className="form-label">ความยาวชุด</label>
                        <input
                            type="number"
                            name="totalLength"
                            value={formData.measurements.totalLength}
                            onChange={handleMeasurementChange}
                            placeholder="ความยาวชุด"
                            min="0"
                            step="0.5"
                        />
                    </div>
                </div>
            </div>

            {/* หมายเหตุ และ ที่อยู่จัดส่ง */}
            <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="mb-4">
                    <label className="form-label">หมายเหตุ</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="หมายเหตุเพิ่มเติม..."
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">เบอร์ติดต่อ *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="เบอร์ติดต่อ"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">ที่อยู่จัดส่ง</label>
                        <input
                            type="text"
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={handleChange}
                            placeholder="ที่อยู่จัดส่ง"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center gap-4">
                <Link href="/orders" className="btn-outline">
                    ยกเลิก
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {isLoading ? 'กำลังบันทึก...' : 'บันทึกคำสั่งซื้อ'}
                </button>
            </div>
        </form>
    );
}
