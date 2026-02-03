'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Ruler, User, Info, FileText } from 'lucide-react';
import Link from 'next/link';
import MemberSelect from './MemberSelect';

interface OrderFormProps {
    initialData?: any;
    orderId?: string;
    isEdit?: boolean;
}

export default function OrderForm({ initialData, orderId, isEdit = false }: OrderFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState(initialData || {
        customerName: '', phone: '', lineUserId: '',
        dressName: '', color: '', size: '', price: '', deposit: '',
        points: 'no', notes: '', deliveryAddress: '',
        orderDate: new Date().toISOString().split('T')[0],
        measurements: {}
    });

    const steps = [
        { id: 'info', icon: User, label: 'ข้อมูลลูกค้า' },
        { id: 'detail', icon: Info, label: 'รายละเอียด' },
        { id: 'measure', icon: Ruler, label: 'สัดส่วน' }
    ];
    const [activeSection, setActiveSection] = useState('info');

    const handleMemberSelect = (member: any) => {
        if (member) {
            setFormData((prev: any) => ({
                ...prev,
                customerName: member.realName,
                phone: member.phone,
                lineUserId: member.lineUserId,
                deliveryAddress: member.address || prev.deliveryAddress,
                // Auto-fill measurements if available
                measurements: member.measurements || prev.measurements
            }));
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        if (name.startsWith('m_')) {
            const field = name.replace('m_', '');
            setFormData((prev: any) => ({
                ...prev,
                measurements: { ...prev.measurements, [field]: value }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const endpoint = isEdit ? `/api/orders/${orderId}` : '/api/orders';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            router.push(`/orders/${isEdit ? orderId : data.data._id}`);
            router.refresh();
        } catch (error) {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pb-24 px-4 sm:px-0">
            {/* Header */}
            <div className="flex items-center gap-3 py-4 mb-2">
                <Link href="/orders" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold text-slate-800">{isEdit ? 'แก้ไขออเดอร์' : 'สร้างออเดอร์ใหม่'}</h1>
            </div>

            {/* Steps / Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                {steps.map(step => (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveSection(step.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === step.id ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <step.icon className="w-4 h-4" />
                        {step.label}
                    </button>
                ))}
            </div>

            {/* Sections */}
            <div className="space-y-6">

                {/* 1. Customer Info */}
                <div className={activeSection === 'info' ? 'block animate-fade-in' : 'hidden'}>
                    {!isEdit && (
                        <div className="mb-6">
                            <label className="text-label">นำเข้าจากสมาชิก (LINE)</label>
                            <MemberSelect onSelect={handleMemberSelect} />
                        </div>
                    )}

                    <div className="card space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-label">ชื่อลูกค้า *</label>
                                <input name="customerName" required value={formData.customerName} onChange={handleChange} className="input-field" placeholder="ระบุชื่อ" />
                            </div>
                            <div>
                                <label className="text-label">เบอร์โทร *</label>
                                <input name="phone" required type="tel" value={formData.phone} onChange={handleChange} className="input-field" placeholder="0xx-xxxxxxx" />
                            </div>
                        </div>
                        <div>
                            <label className="text-label">ที่อยู่จัดส่ง</label>
                            <textarea name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} className="input-field" rows={3} placeholder="ที่อยู่..." />
                        </div>
                        <div>
                            <label className="text-label">วันที่สั่ง</label>
                            <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={() => setActiveSection('detail')} className="btn-primary w-full">
                            ถัดไป: รายละเอียดชุด
                        </button>
                    </div>
                </div>

                {/* 2. Order Details */}
                <div className={activeSection === 'detail' ? 'block animate-fade-in' : 'hidden'}>
                    <div className="card space-y-4">
                        <div>
                            <label className="text-label">ชื่อชุด *</label>
                            <input name="dressName" required value={formData.dressName} onChange={handleChange} className="input-field" placeholder="เช่น ชุดเดรสยาว..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-label">สี *</label>
                                <input name="color" required value={formData.color} onChange={handleChange} className="input-field" placeholder="ระบุสี" />
                            </div>
                            <div>
                                <label className="text-label">ไซส์</label>
                                <input name="size" value={formData.size} onChange={handleChange} className="input-field" placeholder="S, M, L..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-label">ราคาเต็ม *</label>
                                <input name="price" required type="number" value={formData.price} onChange={handleChange} className="input-field" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-label">มัดจำ</label>
                                <input name="deposit" type="number" value={formData.deposit} onChange={handleChange} className="input-field" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-500">คงเหลือที่ต้องชำระ</span>
                            <span className="text-violet-600 text-lg">฿{((Number(formData.price) || 0) - (Number(formData.deposit) || 0)).toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="text-label">หมายเหตุ</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field" rows={2} />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button type="button" onClick={() => setActiveSection('info')} className="btn-ghost flex-1">ย้อนกลับ</button>
                        <button type="button" onClick={() => setActiveSection('measure')} className="btn-primary flex-1">ถัดไป: สัดส่วน</button>
                    </div>
                </div>

                {/* 3. Measurements */}
                <div className={activeSection === 'measure' ? 'block animate-fade-in' : 'hidden'}>
                    <div className="card">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-violet-500" /> ระบุสัดส่วน (นิ้ว)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {['shoulder:ไหล่', 'chest:อก', 'waist:เอว', 'hips:สะโพก', 'armhole:วงแขน', 'upperArm:ต้นแขน', 'sleeveLength:แขนยาว', 'wrist:ข้อมือ', 'totalLength:ชุดยาว'].map(item => {
                                const [key, label] = item.split(':');
                                return (
                                    <div key={key}>
                                        <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            name={`m_${key}`}
                                            value={formData.measurements?.[key] || ''}
                                            onChange={handleChange}
                                            className="input-field py-2 text-center"
                                            placeholder="-"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button type="button" onClick={() => setActiveSection('detail')} className="btn-ghost flex-1">ย้อนกลับ</button>
                        <button type="submit" disabled={isLoading} className="btn-primary flex-[2] bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            บันทึกออเดอร์
                        </button>
                    </div>
                </div>

            </div>
        </form>
    );
}
