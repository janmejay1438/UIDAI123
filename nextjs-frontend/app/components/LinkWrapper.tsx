"use client";

import React from 'react';

interface LinkWrapperProps {
    href: string;
    color: string;
    title: string;
    desc: string;
    icon: string;
}

export default function LinkWrapper({ href, color, title, desc, icon }: LinkWrapperProps) {
    const styles: any = {
        emerald: "bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 border-emerald-500/30 hover:from-emerald-600 hover:to-emerald-500 hover:border-emerald-400 text-emerald-100",
        violet: "bg-gradient-to-r from-violet-900/40 to-violet-800/40 border-violet-500/30 hover:from-violet-600 hover:to-violet-500 hover:border-violet-400 text-violet-100",
        blue: "bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-blue-500/30 hover:from-blue-600 hover:to-blue-500 hover:border-blue-400 text-blue-100",
        orange: "bg-gradient-to-r from-orange-900/40 to-orange-800/40 border-orange-500/30 hover:from-orange-600 hover:to-orange-500 hover:border-orange-400 text-orange-100",
    };
    const iconBg: any = {
        emerald: "bg-emerald-500/20 text-emerald-400 group-hover:bg-white/20 group-hover:text-white",
        violet: "bg-violet-500/20 text-violet-400 group-hover:bg-white/20 group-hover:text-white",
        blue: "bg-blue-500/20 text-blue-400 group-hover:bg-white/20 group-hover:text-white",
        orange: "bg-orange-500/20 text-orange-400 group-hover:bg-white/20 group-hover:text-white",
    };
    const activeStyle = styles[color] || styles.blue;
    const activeIcon = iconBg[color] || iconBg.blue;
    return (
        <a href={href} className={`block p-5 rounded-2xl border transition-all duration-300 group ${activeStyle} shadow-lg hover:shadow-2xl hover:-translate-y-1`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${activeIcon}`}>{icon}</div>
                <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="text-xs opacity-70 mt-1 uppercase tracking-wide font-medium">{desc}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">→</div>
            </div>
        </a>
    );
}
