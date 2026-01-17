"use client";

import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    color?: string;
    icon?: string;
}

export default function StatCard({ title, value, trend, color = "blue", icon }: StatCardProps) {
    const iconStyles: any = {
        blue: 'bg-blue-50 text-blue-600',
        orange: 'bg-orange-50 text-orange-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="uidai-card relative overflow-hidden group"
        >
            {/* Subtle Gradient Accent */}
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color === 'blue' ? 'from-[#020D51] to-[#19B0DC]' :
                    color === 'orange' ? 'from-orange-400 to-orange-600' :
                        color === 'green' ? 'from-green-400 to-green-600' :
                            'from-purple-400 to-purple-600'
                }`} />

            <div className="flex justify-between items-start pl-2">
                <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-[#020D51]">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-2 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                            <span className="text-[10px] font-bold text-green-600">▲ {trend}</span>
                            <span className="text-[9px] text-slate-400 font-medium">Growth</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl text-2xl transition-transform group-hover:scale-110 ${iconStyles[color] || iconStyles.blue}`}>
                        {icon}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
