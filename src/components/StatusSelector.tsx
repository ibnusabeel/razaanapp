'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Truck, CheckCircle, Package, XCircle, ChevronDown, Loader2 } from 'lucide-react';

interface StatusSelectorProps {
    orderId: string;
    currentStatus: string;
}

const statusOptions = [
    { value: 'pending', label: 'รอรับชุด', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'ยืนยันแล้ว', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'producing', label: 'กำลังตัด', icon: Truck, color: 'bg-blue-100 text-blue-700' },
    { value: 'qc', label: 'QC', icon: CheckCircle, color: 'bg-purple-100 text-purple-700' },
    { value: 'packing', label: 'แพ็คของ', icon: Package, color: 'bg-pink-100 text-pink-700' },
    { value: 'ready_to_ship', label: 'พร้อมส่ง', icon: Package, color: 'bg-orange-100 text-orange-700' },
    { value: 'completed', label: 'เสร็จสิ้น', icon: Package, color: 'bg-gray-100 text-gray-700' },
    { value: 'cancelled', label: 'ยกเลิก', icon: XCircle, color: 'bg-red-100 text-red-700' },
];

export default function StatusSelector({ orderId, currentStatus }: StatusSelectorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];
    const Icon = currentOption.icon;

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) {
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            router.refresh();
            setIsOpen(false);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('ไม่สามารถอัปเดตสถานะได้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all ${currentOption.color} hover:opacity-80 disabled:opacity-50`}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                {currentOption.label}
                <ChevronDown className="w-3 h-3 ml-1" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden text-sm">
                        {statusOptions.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors ${currentStatus === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                                        }`}
                                >
                                    <OptionIcon className={`w-4 h-4 ${currentStatus === option.value ? 'text-purple-600' : 'text-gray-400'}`} />
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
