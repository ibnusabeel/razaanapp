'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'ค้นหาชื่อลูกค้าหรือเบอร์โทร...' }: SearchBarProps) {
    const [query, setQuery] = useState('');

    // Debounce การค้นหา
    const debouncedSearch = useCallback(
        (value: string) => {
            const timer = setTimeout(() => {
                onSearch(value);
            }, 300); // รอ 300ms หลังจากหยุดพิมพ์

            return () => clearTimeout(timer);
        },
        [onSearch]
    );

    useEffect(() => {
        const cleanup = debouncedSearch(query);
        return cleanup;
    }, [query, debouncedSearch]);

    // Handle clear
    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
            )}
        </div>
    );
}
