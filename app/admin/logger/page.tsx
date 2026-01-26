"use client";

import { useState, useEffect } from "react";
import {
    collection,
    getCountFromServer,
    getDocs,
    query,
    orderBy,
    limit,
    getFirestore,
    Timestamp
} from 'firebase/firestore';
import {
    signInAnonymously,
    onAuthStateChanged
} from 'firebase/auth';
import { app, auth } from '@/lib/firebase';

interface VisitorData {
    id: string;
    timestamp: Timestamp;
    referrer?: string;
    path?: string;
    deviceType?: string;
    language?: string;
    userAgent?: string;
    // V2 Fields
    geo?: {
        ip?: string;
        city?: string;
        country?: string;
        countryCode?: string;
        isp?: string;
        flag?: string;
    };
    hardware?: {
        screen?: string;
        cores?: number | string;
        memory?: number | string;
    };
    v?: number;
}
// ... [Retain imports and comp definition from previous step] ...

// [Inside the Table Row mapping]


export default function TestAdminStatsPage() {
    const [counts, setCounts] = useState({
        totalVisitors: 0,
        creditsVisitors: 0,
        loading: true
    });

    const [recentVisits, setRecentVisits] = useState<VisitorData[]>([]);
    const [topRef, setTopRef] = useState<[string, number][]>([]);
    const [topPaths, setTopPaths] = useState<[string, number][]>([]);

    const [error, setError] = useState<string | null>(null);
    const [authState, setAuthState] = useState<string>("initializing");
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<'prod' | 'dev'>('prod');

    // Run fetch whenever viewMode changes (and initially)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthState(`Authenticated as ${user.isAnonymous ? 'Anonymous' : 'User'} (${user.uid})`);
                fetchStats();
            } else {
                setAuthState("Signing in anonymously...");
                signInAnonymously(auth).catch((err) => {
                    console.error("Auth failed:", err);
                    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/admin-restricted-operation') {
                        setError("Enable 'Anonymous' sign-in provider in Firebase Console -> Authentication -> Sign-in method.");
                    } else {
                        setError(`Auth failed: ${err.message}`);
                    }
                });
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authState.startsWith("Authenticated")) {
            fetchStats();
        }
    }, [viewMode]);

    const getCollectionNames = () => {
        const suffix = viewMode === 'dev' ? '_dev' : '';
        return {
            visitors: `visitors${suffix}`,
            credits: `credits_visitors${suffix}`
        };
    };

    const fetchStats = async () => {
        try {
            setCounts(prev => ({ ...prev, loading: true }));
            setError(null);

            const db = getFirestore(app);
            const { visitors, credits } = getCollectionNames();

            const visitorsColl = collection(db, visitors);
            const creditsColl = collection(db, credits);

            // 1. Get Totals
            const [visitorsSnapshot, creditsSnapshot] = await Promise.all([
                getCountFromServer(visitorsColl),
                getCountFromServer(creditsColl)
            ]);

            setCounts({
                totalVisitors: visitorsSnapshot.data().count,
                creditsVisitors: creditsSnapshot.data().count,
                loading: false
            });

            // 2. Get Recent & Detailed Data (Limit 50 to save reads)
            const q = query(visitorsColl, orderBy('timestamp', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);

            const visits: VisitorData[] = [];
            const referrers: Record<string, number> = {};
            const paths: Record<string, number> = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data() as any;
                visits.push({ id: doc.id, ...data });

                // Aggregate Referrers
                const ref = data.referrer || 'Direct/Unknown';
                referrers[ref] = (referrers[ref] || 0) + 1;

                // Aggregate Paths
                const p = data.path || '/';
                paths[p] = (paths[p] || 0) + 1;
            });

            setRecentVisits(visits);
            setTopRef(Object.entries(referrers).sort((a, b) => b[1] - a[1]));
            setTopPaths(Object.entries(paths).sort((a, b) => b[1] - a[1]));

        } catch (e: any) {
            console.error("Error fetching stats:", e);
            let msg = e.message || "Failed to fetch stats";
            if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
                msg = `Permission Denied for ${viewMode.toUpperCase()} collections. Check Firestore Rules.`;
            }
            setError(msg);
            setCounts(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteAll = async () => {
        const { visitors, credits } = getCollectionNames();
        const modeLabel = viewMode === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION';

        if (!confirm(`Are you sure you want to DELETE ALL ${modeLabel} visitor data?`)) return;

        setIsDeleting(true);
        try {
            const { writeBatch, getDocs } = await import('firebase/firestore');
            const db = getFirestore(app);
            const visitorsColl = collection(db, visitors);
            const creditsColl = collection(db, credits);

            const [vSnap, cSnap] = await Promise.all([getDocs(visitorsColl), getDocs(creditsColl)]);

            const batch = writeBatch(db);
            let count = 0;
            vSnap.forEach(d => { batch.delete(d.ref); count++; });
            cSnap.forEach(d => { batch.delete(d.ref); count++; });

            if (count > 0) {
                await batch.commit();
                alert(`Deleted ${count} records.`);
            } else {
                alert("Nothing to delete.");
            }
            fetchStats();
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white flex flex-col items-center">
            <div className="max-w-5xl w-full space-y-8">
                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Visitor Analytics</h1>

                    <div className="flex justify-center gap-4 my-4">
                        <button
                            onClick={() => setViewMode('prod')}
                            className={`px-4 py-2 rounded-lg font-bold transition ${viewMode === 'prod' ? 'bg-blue-600' : 'bg-gray-800 text-gray-400'}`}
                        >
                            Production
                        </button>
                        <button
                            onClick={() => setViewMode('dev')}
                            className={`px-4 py-2 rounded-lg font-bold transition ${viewMode === 'dev' ? 'bg-orange-600' : 'bg-gray-800 text-gray-400'}`}
                        >
                            Dev / Test
                        </button>
                    </div>

                    <div className="text-xs font-mono bg-gray-800 inline-block px-2 py-1 rounded text-cyan-400">
                        Auth: {authState}
                    </div>
                </div>

                {error && <div className="bg-red-900/50 p-4 border border-red-500 rounded text-center">{error}</div>}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`bg-gray-800 rounded-xl p-6 border ${viewMode === 'prod' ? 'border-blue-500/30' : 'border-orange-500/30'} text-center`}>
                        <h3 className="text-gray-400">Total Visits</h3>
                        <p className={`text-4xl font-bold ${viewMode === 'prod' ? 'text-blue-400' : 'text-orange-400'}`}>
                            {counts.loading ? '...' : counts.totalVisitors}
                        </p>
                    </div>
                    <div className={`bg-gray-800 rounded-xl p-6 border ${viewMode === 'prod' ? 'border-green-500/30' : 'border-orange-500/30'} text-center`}>
                        <h3 className="text-gray-400">Credits Page</h3>
                        <p className={`text-4xl font-bold ${viewMode === 'prod' ? 'text-green-400' : 'text-orange-400'}`}>
                            {counts.loading ? '...' : counts.creditsVisitors}
                        </p>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Referrers */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Top Referrers</h3>
                        <ul className="space-y-2">
                            {topRef.length === 0 ? <p className="text-gray-500 text-sm">No data</p> :
                                topRef.map(([ref, count], i) => (
                                    <li key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-300 truncate max-w-[200px]" title={ref}>{ref}</span>
                                        <span className="font-mono text-blue-400">{count}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* Top Paths */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Top Pages</h3>
                        <ul className="space-y-2">
                            {topPaths.length === 0 ? <p className="text-gray-500 text-sm">No data</p> :
                                topPaths.map(([path, count], i) => (
                                    <li key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-300">{path}</span>
                                        <span className="font-mono text-green-400">{count}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>

                {/* Recent Visits Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                        <h3 className="text-lg font-bold text-white">Recent Activity (Last 50)</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-gray-900 text-gray-200 sticky top-0">
                                <tr>
                                    <th className="p-3">Time / Ver</th>
                                    <th className="p-3">Location</th>
                                    <th className="p-3">Network</th>
                                    <th className="p-3">Device / HW</th>
                                    <th className="p-3">Context</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {recentVisits.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-700/50 transition-colors border-b border-gray-800 last:border-0 text-left">
                                        <td className="p-3 align-top">
                                            <div className="text-xs text-white font-mono leading-tight">
                                                {v.timestamp?.toDate().toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-gray-600 mt-1">{v.v ? `v${v.v}` : 'Legacy'}</div>
                                        </td>

                                        <td className="p-3 align-top">
                                            <div className="flex items-center gap-2 mb-1">
                                                {v.geo?.flag && <img src={v.geo.flag} alt="flag" className="w-4 h-3 rounded-[1px] shadow-sm" />}
                                                <span className="text-sm font-medium text-gray-200">{v.geo?.city || 'Unknown'}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{v.geo?.country || '-'}</div>
                                        </td>

                                        <td className="p-3 align-top">
                                            <div className="text-sm text-cyan-400 font-mono mb-1">{v.geo?.ip || 'N/A'}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[120px]" title={v.geo?.isp}>{v.geo?.isp || '-'}</div>
                                        </td>

                                        <td className="p-3 align-top">
                                            <div className="text-sm text-white capitalize mb-1">{v.deviceType || 'Desktop'}</div>
                                            <div className="text-xs text-gray-500" title={v.userAgent}>
                                                {v.hardware?.screen || 'Res: N/A'}
                                                {v.hardware?.memory && <span className="ml-1">• {v.hardware.memory}GB</span>}
                                            </div>
                                        </td>

                                        <td className="p-3 align-top">
                                            <div className="text-sm text-gray-300 truncate max-w-[150px] mb-1" title={v.path}>{v.path}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[150px]" title={v.referrer}>
                                                <span className="opacity-50">Ref:</span> {v.referrer}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recentVisits.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No recent visits found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-center pt-8 pb-4">
                    <button
                        onClick={handleDeleteAll}
                        disabled={isDeleting}
                        className="bg-red-900/20 hover:bg-red-900/40 border border-red-800 text-red-400 px-6 py-2 rounded transition flex items-center gap-2 text-sm"
                    >
                        {isDeleting ? 'Deleting...' : `Delete All ${viewMode === 'dev' ? 'Dev' : 'Prod'} Data`}
                    </button>
                </div>
            </div>
        </div>
    );
}
