"use client";

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function CheckStatus() {
    const [eid, setEid] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eid) return;
        setLoading(true);
        setResult(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            const res = await axios.post(`${API_URL}/api/check-status`, { eid });
            // Simulate delay for realism
            setTimeout(() => {
                setResult(res.data);
                setLoading(false);
            }, 1500);
        } catch (e) {
            setLoading(false);
            alert("Failed to check status");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                    Check Aadhaar Status
                </h1>
                <p className="text-gray-400 mt-2">Enter your 14/28 digit Enrolment ID (EID) to track status.</p>
            </header>

            <div className="glass p-8 rounded-2xl shadow-xl">
                <form onSubmit={handleCheck} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Enrolment ID / SRN</label>
                        <input
                            type="text"
                            placeholder="1234/12345/12345"
                            className="w-full bg-black/30 border border-gray-600 rounded-lg p-4 text-lg tracking-widest text-center focus:border-blue-500 outline-none text-white placeholder-gray-600 font-mono"
                            value={eid}
                            onChange={(e) => setEid(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !eid}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? 'Checking...' : 'Check Status'}
                    </button>
                </form>

                {loading && (
                    <div className="mt-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 border-t border-gray-700 pt-8">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400">Current Status:</span>
                            <span className={`px-4 py-1 rounded-full text-sm font-bold ${result.status === 'Generated' ? 'bg-green-500/20 text-green-400' :
                                result.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {result.status}
                            </span>
                        </div>

                        {/* Stepper */}
                        <div className="relative flex items-center justify-between z-10">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -z-10 transform -translate-y-1/2 rounded-full"></div>
                            <div className={`absolute top-1/2 left-0 h-1 bg-green-500 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-1000`} style={{ width: `${(result.step / 3) * 100}%` }}></div>

                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-800 border-4 border-gray-900 ${s <= result.step ? 'bg-green-500 text-white' : 'text-gray-500'
                                    }`}>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Request</span>
                            <span>Validation</span>
                            <span>Completed</span>
                        </div>

                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-200 text-sm">
                            {result.details}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
