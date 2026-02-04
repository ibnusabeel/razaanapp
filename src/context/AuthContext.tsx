'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (key: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// หน้าที่ไม่ต้องล็อกอิน
const PUBLIC_PATHS = ['/login', '/register', '/receipt'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // ตรวจสอบ session เมื่อโหลดหน้า
    useEffect(() => {
        const savedKey = localStorage.getItem('adminKey');
        if (savedKey) {
            verifyKey(savedKey).then(valid => {
                setIsAuthenticated(valid);
                if (!valid) localStorage.removeItem('adminKey');
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    // Redirect ถ้าไม่ได้ล็อกอิน
    useEffect(() => {
        if (isLoading) return;

        const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));

        if (!isAuthenticated && !isPublicPath) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    const verifyKey = async (key: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });
            const data = await res.json();
            return data.valid === true;
        } catch {
            return false;
        }
    };

    const login = async (key: string): Promise<boolean> => {
        const valid = await verifyKey(key);
        if (valid) {
            localStorage.setItem('adminKey', key);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('adminKey');
        setIsAuthenticated(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
