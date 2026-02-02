'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Phone, Save, Loader2 } from 'lucide-react';

function RegisterForm() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Get data from URL
    const lineUserId = searchParams.get('lineUserId');
    const displayName = searchParams.get('displayName');
    const pictureUrl = searchParams.get('pictureUrl');

    const [formData, setFormData] = useState({
        realName: displayName || '',
        phone: '',
        address: '',
    });

    if (!lineUserId) {
        return (
            <div className="text-center text-red-600 p-8">
                <p>⚠️ ไม่พบข้อมูล LINE User ID</p>
                <p className="text-sm mt-2 text-gray-500">กรุณากดลิงก์จากในไลน์ใหม่อีกครั้ง</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineUserId,
                    displayName,
                    pictureUrl,
                    ...formData,
                }),
            });

            if (!res.ok) throw new Error('Registration failed');

            alert('ลงทะเบียนสำเร็จ! คุณสามารถปิดหน้านี้ได้เลย');
        } catch (err) {
            console.error('Error:', err);
            alert('เกิดข้อผิดพลาดในการลงทะเบียน');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-purple-700 text-white p-6 text-center">
                <h1 className="text-xl font-bold mb-1">สมัครสมาชิก</h1>
                <p className="text-purple-100 text-sm">Razaan Membership</p>
            </div>

            <div className="p-6">
                {pictureUrl && (
                    <div className="flex flex-col items-center mb-6">
                        <img
                            src={pictureUrl}
                            alt={displayName || 'User'}
                            className="w-20 h-20 rounded-full border-4 border-purple-100 mb-2"
                        />
                        <p className="font-medium text-gray-700">{displayName}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อ-นามสกุล (จริง)
                        </label>
                        <div className="relative">
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                required
                                value={formData.realName}
                                onChange={e => setFormData({ ...formData, realName: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="ชื่อ-นามสกุล"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            เบอร์โทรศัพท์
                        </label>
                        <div className="relative">
                            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="08x-xxx-xxxx"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ที่อยู่ (สำหรับจัดส่ง)
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            rows={3}
                            placeholder="ที่อยู่จัดส่ง..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium mt-6 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        บันทึกข้อมูล
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
