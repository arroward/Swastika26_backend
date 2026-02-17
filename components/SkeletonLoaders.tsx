import React from 'react';

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
    return (
        <div className="animate-pulse w-full">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-6 py-4 text-left">
                                    <div className="h-4 bg-zinc-800 rounded w-24"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <div className="h-4 bg-zinc-800/50 rounded w-full"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-zinc-800/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-zinc-800/50 rounded w-5/6"></div>
                </div>
            ))}
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-6 border border-white/10">
                    <div className="h-3 bg-zinc-800 rounded w-24 mb-3"></div>
                    <div className="h-8 w-16 bg-zinc-800 rounded"></div>
                </div>
            ))}
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                    <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-700 rounded w-full"></div>
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <div className="h-10 bg-gray-700 rounded flex-1"></div>
                <div className="h-10 bg-gray-700 rounded flex-1"></div>
            </div>
        </div>
    );
}
