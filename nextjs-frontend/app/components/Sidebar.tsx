"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'State Geography', path: '/analytics/state-wise', icon: '🗺️' },
    { name: 'Analytics Chat', path: '/analytics', icon: '🤖' },
    { name: 'Check Status', path: '/check-status', icon: '🔍' },
    { name: 'Admin Settings', path: '/admin', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
            {/* UIDAI Logo & Branding */}
            <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex flex-col items-center text-center gap-2">
                    <img
                        src="https://uidai.gov.in/images/logo-base.png"
                        alt="Aadhaar Logo"
                        className="w-16 h-auto mb-1"
                    />
                    <div>
                        <h1 className="text-sm font-bold text-[#020D51] leading-tight">
                            भारतीय विशिष्ट पहचान प्राधिकरण
                        </h1>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                            Unique Identification Authority of India
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Main Menu
                </p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link key={item.path} href={item.path}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${isActive
                                    ? 'bg-gradient-to-r from-[#020D51] to-[#19B0DC] text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <span className={`text-lg ${isActive ? 'brightness-200' : ''}`}>{item.icon}</span>
                                <span className="font-semibold text-sm">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                        A
                    </div>
                    <div className="text-[11px]">
                        <p className="font-bold text-slate-800">Admin User</p>
                        <p className="text-slate-500">Security Clearance: L3</p>
                    </div>
                </div>
                <div className="text-[9px] text-slate-400 font-medium text-center border-t border-slate-200 pt-3">
                    Copyright © 2024 UIDAI. <br />All Rights Reserved.
                </div>
            </div>
        </div>
    );
}
