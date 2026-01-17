"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import StatCard from '../../components/StatCard';
// import IndiaMap from '../../components/IndiaMap'; // Replaced with dynamic import
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const IndiaMap = dynamic(() => import('../../components/IndiaMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[500px] flex items-center justify-center text-slate-400 animate-pulse bg-slate-50 rounded-2xl">Loading Map...</div>
});

export default function Dashboard() {
    const [stats, setStats] = useState({
        enrolments: 0,
        updates: 0,
        total_demographic: 0,
        total_biometric: 0
    });
    const [period, setPeriod] = useState('monthly');
    const [metric, setMetric] = useState('enrolments'); // 'enrolments' or 'updates'
    const [mapData, setMapData] = useState([]);

    // Fetch Summary Stats
    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        axios.get(`${API_URL}/api/dashboard/summary`)
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    // Fetch State Data for Map
    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        axios.get(`${API_URL}/api/analytics/states?period=${period}`)
            .then(res => setMapData(res.data))
            .catch(err => console.error(err));
    }, [period]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Title */}
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-[#020D51] tracking-tight">Administrative Dashboard</h1>
                    <p className="text-slate-500 font-medium text-sm">National Identity Analytics & Ecosystem Monitoring</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live System Feed</span>
                </div>
            </div>

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Enrolments" value={stats.enrolments} icon="🆔" trend="+12.4%" color="blue" />
                <StatCard title="Total Updates" value={stats.updates} icon="🔄" trend="+5.2%" color="orange" />
                <StatCard title="Demographic Upd." value={stats.total_demographic} icon="👤" trend="+18.1%" color="purple" />
                <StatCard title="Biometric Upd." value={stats.total_biometric} icon="🧬" trend="+8.5%" color="teal" />
            </div>

            {/* Main Geographic Intelligence Section */}
            <div className="uidai-card p-8 bg-white border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">🗺️</div>
                        <div>
                            <h2 className="text-xl font-black text-[#020D51]">Geographic Intelligence</h2>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">State-wise distribution of {metric}.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {/* Metric Toggle */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setMetric('enrolments')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${metric === 'enrolments' ? 'bg-[#020D51] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                            >
                                Enrolments
                            </button>
                            <button
                                onClick={() => setMetric('updates')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${metric === 'updates' ? 'bg-[#FF9933] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                            >
                                Updates
                            </button>
                            <button
                                onClick={() => setMetric('demographic')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${metric === 'demographic' ? 'bg-purple-700 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                            >
                                Demographic
                            </button>
                            <button
                                onClick={() => setMetric('biometric')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${metric === 'biometric' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                            >
                                Biometric
                            </button>
                        </div>

                        <div className="w-px h-6 bg-slate-200 mx-2" />

                        {/* Period Toggle */}
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-transparent border-none px-4 py-2 text-xs font-bold text-[#020D51] outline-none cursor-pointer"
                        >
                            <option value="daily">📅 Daily View</option>
                            <option value="monthly">📅 Monthly View</option>
                            <option value="yearly">📅 Yearly View</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* The Map */}
                    <div className="lg:col-span-2 h-[550px] relative">
                        <IndiaMap data={mapData} metric={metric} />
                    </div>

                    {/* Leaderboard */}
                    <div className="lg:col-span-1 flex flex-col h-[550px]">
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex-1 overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-extrabold text-[#020D51] text-sm uppercase tracking-widest text-[10px]">Territorial Rankings</h3>
                                <span className="bg-white px-2 py-1 rounded text-[9px] font-bold text-slate-400 border border-slate-100 uppercase">Top Performers</span>
                            </div>
                            <div className="space-y-3">
                                {mapData
                                    .sort((a: any, b: any) => {
                                        if (metric === 'enrolments') return b.total_enrolments - a.total_enrolments;
                                        if (metric === 'updates') return b.total_updates - a.total_updates;
                                        if (metric === 'demographic') return b.total_demographic - a.total_demographic;
                                        return b.total_biometric - a.total_biometric;
                                    })
                                    .map((state: any, i) => (
                                        <div key={state.state} className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:translate-x-1 transition-transform group">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${i < 3 ? 'bg-[#020D51] text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-[#020D51] text-sm">{state.state}</div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verified Authority</div>
                                            </div>
                                            <div className={`font-black text-sm ${metric === 'enrolments' ? 'text-[#020D51]' :
                                                metric === 'updates' ? 'text-[#FF9933]' :
                                                    metric === 'demographic' ? 'text-purple-600' : 'text-teal-600'
                                                }`}>
                                                {metric === 'enrolments' ? state.total_enrolments.toLocaleString() :
                                                    metric === 'updates' ? state.total_updates.toLocaleString() :
                                                        metric === 'demographic' ? state.total_demographic.toLocaleString() :
                                                            state.total_biometric.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trends Chart */}
            <div className="uidai-card p-8 bg-white border border-slate-200">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">📈</div>
                    <div>
                        <h3 className="font-black text-[#020D51] text-lg">National Growth Trend</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aggregated performance across 36 Administrative Units</p>
                    </div>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mapData.slice(0, 15)}>
                            <defs>
                                <linearGradient id="colorU" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#020D51" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#19B0DC" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="state" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip
                                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="total_enrolments" stroke="#020D51" strokeWidth={3} fillOpacity={1} fill="url(#colorU)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
