'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Ruler, User, Info, Sparkles } from 'lucide-react';
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
        { id: 'info', icon: User, label: 'ลูกค้า', color: 'from-violet-500 to-purple-600' },
        { id: 'detail', icon: Info, label: 'รายละเอียด', color: 'from-pink-500 to-rose-600' },
        { id: 'measure', icon: Ruler, label: 'สัดส่วน', color: 'from-blue-500 to-indigo-600' }
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

    const inputClass = "w-full px-4 py-3 bg-white border-2 border-purple-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 shadow-sm";
    const labelClass = "block text-xs font-bold text-purple-600 mb-1.5";

    const activeStep = steps.find(s => s.id === activeSection);

    return (
        <form onSubmit={handleSubmit}>
            {/* Steps / Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl mb-6 shadow-lg shadow-purple-100 border border-purple-50">
                {steps.map(step => (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveSection(step.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === step.id
                                ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                                : 'text-slate-500 hover:text-slate-700 hover:bg-purple-50'
                            }`}
                    >
                        <step.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{step.label}</span>
                    </button>
                ))}
            </div>

            {/* Sections */}
            <div className="space-y-6">

                {/* 1. Customer Info */}
                <div className={activeSection === 'info' ? 'block' : 'hidden'}>
                    {!isEdit && (
                        <div className="mb-6">
                            <label className={labelClass}>
                                <Sparkles className="w-3 h-3 inline mr-1" />
                                นำเข้าจากสมาชิก LINE
                            </label>
                            <MemberSelect onSelect={handleMemberSelect} />
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border-2 border-purple-100 p-5 space-y-4 shadow-lg shadow-purple-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>ชื่อลูกค้า *</label>
                                <input name="customerName" required value={formData.customerName} onChange={handleChange} className={inputClass} placeholder="ระบุชื่อ" />
                            </div>
                            <div>
                                <label className={labelClass}>เบอร์โทร *</label>
                                <input name="phone" required type="tel" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="0xx-xxxxxxx" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>ที่อยู่จัดส่ง</label>
                            <textarea name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} className={inputClass} rows={2} placeholder="ที่อยู่..." />
                        </div>
                        <div>
                            <label className={labelClass}>วันที่สั่ง</label>
                            <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button type="button" onClick={() => setActiveSection('detail')} className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg">
                            ถัดไป: รายละเอียดชุด →
                        </button>
                    </div>
                </div>

                {/* 2. Order Details */}
                <div className={activeSection === 'detail' ? 'block' : 'hidden'}>
                    <div className="bg-white rounded-2xl border-2 border-pink-100 p-5 space-y-4 shadow-lg shadow-pink-100">
                        <div>
                            <label className="block text-xs font-bold text-pink-600 mb-1.5">ชื่อชุด *</label>
                            <input name="dressName" required value={formData.dressName} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 shadow-sm" placeholder="เช่น ชุดเดรสยาว..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-pink-600 mb-1.5">สี *</label>
                                <input name="color" required value={formData.color} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 shadow-sm" placeholder="ระบุสี" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-pink-600 mb-1.5">ไซส์</label>
                                <input name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 shadow-sm" placeholder="S, M, L..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-emerald-600 mb-1.5">ราคาเต็ม * (บาท)</label>
                                <input name="price" required type="number" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 shadow-sm" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-emerald-600 mb-1.5">มัดจำ (บาท)</label>
                                <input name="deposit" type="number" value={formData.deposit} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 shadow-sm" placeholder="0" />
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl flex justify-between items-center border border-rose-100">
                            <span className="text-rose-600 font-medium">ยอดคงเหลือที่ต้องชำระ</span>
                            <span className="text-rose-600 text-2xl font-bold">฿{((Number(formData.price) || 0) - (Number(formData.deposit) || 0)).toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-amber-600 mb-1.5">หมายเหตุ</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 shadow-sm" rows={2} placeholder="หมายเหตุพิเศษ..." />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button type="button" onClick={() => setActiveSection('info')} className="flex-1 py-4 bg-white text-slate-600 border-2 border-purple-100 rounded-xl text-sm font-bold hover:bg-purple-50 transition-all">
                            ← ย้อนกลับ
                        </button>
                        <button type="button" onClick={() => setActiveSection('measure')} className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl text-sm font-bold hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg">
                            ถัดไป: สัดส่วน →
                        </button>
                    </div>
                </div>

                {/* 3. Measurements */}
                <div className={activeSection === 'measure' ? 'block' : 'hidden'}>
                    <div className="bg-white rounded-2xl border-2 border-blue-100 p-5 shadow-lg shadow-blue-100">
                        <h3 className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-2">
                            <Ruler className="w-4 h-4" /> ระบุสัดส่วน (นิ้ว)
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {[
                                ['shoulder', 'ไหล่'], ['chest', 'อก'], ['waist', 'เอว'],
                                ['hips', 'สะโพก'], ['armhole', 'วงแขน'], ['upperArm', 'ต้นแขน'],
                                ['sleeveLength', 'แขนยาว'], ['wrist', 'ข้อมือ'], ['totalLength', 'ความยาว']
                            ].map(([key, label]) => (
                                <div key={key}>
                                    <label className="text-xs text-blue-500 mb-1 block font-medium">{label}</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        name={`m_${key}`}
                                        value={formData.measurements?.[key] || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                                        placeholder="-"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button type="button" onClick={() => setActiveSection('detail')} className="flex-1 py-4 bg-white text-slate-600 border-2 border-purple-100 rounded-xl text-sm font-bold hover:bg-purple-50 transition-all">
                            ← ย้อนกลับ
                        </button>
                        <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            บันทึกออเดอร์
                        </button>
                    </div>
                </div>

            </div>
        </form>
    );
}
