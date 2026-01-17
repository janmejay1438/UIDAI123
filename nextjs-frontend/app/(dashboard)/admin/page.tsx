"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [config, setConfig] = useState({
        gemini_key: '',
        govt_key: '',
        govt_url: ''
    });
    const [systemStatus, setSystemStatus] = useState<any>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            const res = await axios.get(`${API_URL}/api/status`);
            setSystemStatus(res.data);
        } catch (e) {
            console.error("Backend offline");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploadStatus('Uploading...');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            await axios.post(`${API_URL}/api/upload`, formData);
            setUploadStatus('Success! Data reloaded.');
            fetchStatus();
        } catch (e: any) {
            console.error("Upload Error Details:", e);
            setUploadStatus(`Upload Failed: ${e.response?.data?.error || e.message}`);
        }
    };

    const handleConfigUpdate = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            await axios.post(`${API_URL}/api/config`, config);
            alert('Configuration Saved!');
            fetchStatus();
        } catch (e) {
            alert('Failed to save config');
        }
    };

    return (
        <main className="min-h-screen p-8 text-white max-w-4xl mx-auto">
            <header className="mb-10 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                    Admin Dashboard
                </h1>
                <p className="text-gray-400">Manage Data Sources & Real-time Configurations</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">

                {/* File Upload Section */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">📂 Data Upload</h2>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                            <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={!file}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            Upload dataset
                        </button>
                        {uploadStatus && <p className="text-sm text-center text-green-400">{uploadStatus}</p>}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Current System State</h3>
                        <div className="bg-black/30 p-4 rounded-lg font-mono text-sm">
                            <p>Status: <span className="text-green-400">{systemStatus?.status || 'Offline'}</span></p>
                            <p>Records: {systemStatus?.records || 0}</p>
                            <p>Files: {systemStatus?.files_loaded?.length || 0}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Configuration Section */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 text-purple-300">🔑 API Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Gemini API Key</label>
                            <input
                                type="password"
                                className="w-full bg-black/30 border border-gray-600 rounded-lg p-2 focus:border-purple-500 outline-none"
                                placeholder="AIza..."
                                value={config.gemini_key}
                                onChange={e => setConfig({ ...config, gemini_key: e.target.value })}
                            />
                            <p className="text-xs text-green-500 mt-1">
                                {systemStatus?.keys_configured?.gemini ? "✓ Key Configured" : "⚠ Not Configured"}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Government Data API Key</label>
                            <input
                                type="password"
                                className="w-full bg-black/30 border border-gray-600 rounded-lg p-2 focus:border-purple-500 outline-none"
                                placeholder="API Key..."
                                value={config.govt_key}
                                onChange={e => setConfig({ ...config, govt_key: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Resource URL (Optional)</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-gray-600 rounded-lg p-2 focus:border-purple-500 outline-none"
                                placeholder="https://api.data.gov.in/..."
                                value={config.govt_url}
                                onChange={e => setConfig({ ...config, govt_url: e.target.value })}
                            />
                        </div>

                        <button
                            onClick={handleConfigUpdate}
                            className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-medium transition-all"
                        >
                            Save Configuration
                        </button>
                    </div>
                </motion.div>

            </div>

            <div className="mt-12 text-center">
                <a href="/" className="text-blue-400 hover:text-blue-300 underline">← Back to Analytics Chat</a>
            </div>
        </main>
    );
}
