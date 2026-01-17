"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const IndiaMap = dynamic(() => import('../../../components/IndiaMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[500px] flex items-center justify-center text-slate-400 animate-pulse bg-slate-800/50 rounded-2xl">Loading Geographic Data...</div>
});

export default function StateAnalyticsPage() {
    const [period, setPeriod] = useState('monthly');
    const [data, setData] = useState([]);
    const [maxVal, setMaxVal] = useState(1);
    const [metric, setMetric] = useState('enrolments');

    /* Fetch Data Effect */
    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        axios.get(`${API_URL}/api/analytics/states?period=${period}`)
            .then(res => {
                setData(res.data);
                if (res.data.length > 0) {
                    const max = Math.max(...res.data.map((d: any) => metric === 'enrolments' ? d.total_enrolments : d.total_updates), 1);
                    setMaxVal(max);
                }
            })
            .catch(err => console.error("Error fetching state data:", err));
    }, [period, metric]);

    return (
        <div className="space-y-8">
            {/* Header with Toggles */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400 text-center md:text-left">State-wise Enrolment Geography</h1>

                <div className="flex gap-4">
                    {/* Metric Selection */}
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setMetric('enrolments')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${metric === 'enrolments' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Enrolments
                        </button>
                        <button
                            onClick={() => setMetric('updates')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${metric === 'updates' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Updates
                        </button>
                    </div>

                    {/* Period Selection */}
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        {['daily', 'monthly', 'yearly'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-md capitalize text-sm font-medium transition-all ${period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left: The "Real Map" */}
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm min-h-[600px] flex flex-col relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-300">Geographic Heatmap</h3>
                        <p className="text-sm text-slate-500">Visualizing {metric} across Indian States.</p>
                    </div>
                    <div className="flex-1 w-full bg-slate-900/40 rounded-2xl overflow-hidden border border-slate-800/50">
                        <IndiaMap data={data} metric={metric} />
                    </div>
                </div>

                {/* Right: The Leaderboard (Horizontal Bars) */}
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm flex flex-col h-[600px]">
                    <h3 className="text-xl font-bold text-slate-300 mb-6">State Rankings</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                        {data.sort((a: any, b: any) => (metric === 'enrolments' ? b.total_enrolments - a.total_enrolments : b.total_updates - a.total_updates)).map((state: any, i) => (
                            <div key={state.state} className="group cursor-pointer">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
                                        {i + 1}. {state.state}
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                        {(metric === 'enrolments' ? state.total_enrolments : state.total_updates).toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-1000 ${metric === 'enrolments' ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-orange-600 to-orange-400'}`}
                                        style={{ width: `${((metric === 'enrolments' ? state.total_enrolments : state.total_updates) / maxVal) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: Trend Chart for Top 10 States */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 h-[400px]">
                <h3 className="text-xl font-bold text-slate-300 mb-4">Top 10 States Growth Breakdown</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.sort((a: any, b: any) => (metric === 'enrolments' ? b.total_enrolments - a.total_enrolments : b.total_updates - a.total_updates)).slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="state" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                            itemStyle={{ color: '#3b82f6' }}
                        />
                        <Bar
                            dataKey={metric === 'enrolments' ? "total_enrolments" : "total_updates"}
                            fill={metric === 'enrolments' ? "#2563eb" : "#ea580c"}
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

