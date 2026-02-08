'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Clock,
    CheckCircle,
    Scissors,
    Search,
    Package,
    Truck,
    Gift,
    XCircle,
    Loader2,
    X,
    ChevronRight
} from 'lucide-react';

interface StatusSelectorProps {
    orderId: string;
    currentStatus: string;
}

const statusOptions = [
    {
        value: 'pending',
        label: 'รอรับชุด',
        icon: Clock,
        color: 'bg-amber-500',
        bgLight: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        description: 'รอลูกค้าส่งชุดมา'
    },
    {
        value: 'confirmed',
        label: 'ยืนยันแล้ว',
        icon: CheckCircle,
        color: 'bg-emerald-500',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        description: 'รับออเดอร์แล้ว พร้อมผลิต'
    },
    {
        value: 'producing',
        label: 'กำลังตัด',
        icon: Scissors,
        color: 'bg-blue-500',
        bgLight: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        description: 'อยู่ระหว่างการตัดเย็บ'
    },
    {
        value: 'qc',
        label: 'ตรวจสอบ QC',
        icon: Search,
        color: 'bg-purple-500',
        bgLight: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        description: 'ตรวจสอบคุณภาพ'
    },
    {
        value: 'packing',
        label: 'แพ็คของ',
        icon: Package,
        color: 'bg-pink-500',
        bgLight: 'bg-pink-50',
        textColor: 'text-pink-700',
        borderColor: 'border-pink-200',
        description: 'เตรียมบรรจุ'
    },
    {
        value: 'ready_to_ship',
        label: 'พร้อมส่ง',
        icon: Truck,
        color: 'bg-cyan-500',
        bgLight: 'bg-cyan-50',
        textColor: 'text-cyan-700',
        borderColor: 'border-cyan-200',
        description: 'รอจัดส่งให้ลูกค้า'
    },
    {
        value: 'completed',
        label: 'เสร็จสิ้น',
        icon: Gift,
        color: 'bg-green-600',
        bgLight: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        description: 'ส่งมอบลูกค้าแล้ว'
    },
    {
        value: 'cancelled',
        label: 'ยกเลิก',
        icon: XCircle,
        color: 'bg-red-500',
        bgLight: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        description: 'ยกเลิกออเดอร์นี้'
    },
];

export default function StatusSelector({ orderId, currentStatus }: StatusSelectorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const currentIndex = statusOptions.findIndex(opt => opt.value === currentStatus);
    const currentOption = statusOptions[currentIndex] || statusOptions[0];
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
        <>
            {/* Current Status Button */}
            <button
                onClick={() => setIsOpen(true)}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${currentOption.color} text-white`}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                <span>{currentOption.label}</span>
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Modal - Bottom sheet on mobile, centered on desktop */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-slide-up sm:animate-none">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            {/* Mobile handle */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 rounded-full sm:hidden" />

                            <h3 className="text-lg font-bold text-slate-800 mt-2 sm:mt-0">เปลี่ยนสถานะ</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-4 py-3 bg-slate-50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500">ความคืบหน้า</span>
                                <span className="text-xs font-bold text-slate-700">
                                    {currentIndex + 1} / {statusOptions.length - 1}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${currentOption.color} transition-all duration-500`}
                                    style={{ width: `${((currentIndex + 1) / (statusOptions.length - 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Status List */}
                        <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
                            <div className="space-y-2">
                                {statusOptions.map((option, index) => {
                                    const OptionIcon = option.icon;
                                    const isActive = currentStatus === option.value;
                                    const isPassed = index < currentIndex;

                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleStatusChange(option.value)}
                                            disabled={isLoading}
                                            className={`w-full text-left p-4 sm:p-3 rounded-xl flex items-center gap-3 transition-all border-2 active:scale-[0.98] ${isActive
                                                ? `${option.bgLight} ${option.borderColor} ${option.textColor}`
                                                : isPassed
                                                    ? 'bg-slate-50 border-slate-100 text-slate-400'
                                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {/* Status Icon */}
                                            <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? option.color : isPassed ? 'bg-slate-200' : 'bg-slate-100'
                                                }`}>
                                                <OptionIcon className={`w-6 h-6 sm:w-5 sm:h-5 ${isActive || isPassed ? 'text-white' : 'text-slate-400'
                                                    }`} />
                                            </div>

                                            {/* Label & Description */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-base sm:text-sm ${isActive ? option.textColor : isPassed ? 'text-slate-400' : 'text-slate-700'
                                                    }`}>
                                                    {option.label}
                                                </p>
                                                <p className="text-sm sm:text-xs text-slate-400 truncate">
                                                    {option.description}
                                                </p>
                                            </div>

                                            {/* Active Indicator */}
                                            {isActive && (
                                                <div className={`w-8 h-8 sm:w-6 sm:h-6 rounded-full ${option.color} flex items-center justify-center`}>
                                                    <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                                                </div>
                                            )}

                                            {/* Step Number */}
                                            {!isActive && (
                                                <span className="text-sm sm:text-xs font-bold text-slate-300 w-6 text-center">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 pb-safe">
                            <p className="text-xs text-slate-500 text-center">
                                กดเลือกสถานะเพื่ออัปเดตทันที
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                .pb-safe {
                    padding-bottom: max(1rem, env(safe-area-inset-bottom));
                }
            `}</style>
        </>
    );
}
