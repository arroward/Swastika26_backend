import React from 'react';

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
    return (
        <div className="animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-6 py-3 text-left">
                                    <div className="h-4 bg-gray-600 rounded w-24"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <div className="h-4 bg-gray-700 rounded w-full"></div>
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
                <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
            ))}
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                        <div className="h-8 w-8 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-32"></div>
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
