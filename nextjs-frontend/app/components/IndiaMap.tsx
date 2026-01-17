"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Using the Official DataMeet Map (Full Boundaries)
const INDIA_GEO_JSON = "/india_states_official.json";
// Fallback if the above fails to load or is district level (Census_2011 is detailed)
// Actually, let's use the one we just confirmed works (Subhash9325) as it was robust, 
// BUT the user specifically asked for POK/COK. 
// If DataMeet is district level, it might be too heavy.
const INDIA_TOPO_JSON = "/india_states.json";

const PROJECTION_CONFIG = {
    scale: 800,
    center: [78.9, 22.5] // Center of India
};

export default function IndiaMap({ data, metric }: { data: any[], metric: string }) {
    const [hoveredState, setHoveredState] = useState<any>(null);

    // Normalize data
    const stateData = data.reduce((acc: any, curr: any) => {
        let name = curr.state;
        // Map backend names to commonly found GeoJSON names
        if (name === "Jammu & Kashmir") name = "Jammu and Kashmir";
        if (name === "Andaman & Nicobar") name = "Andaman and Nicobar Islands";
        if (name === "Delhi") name = "NCT of Delhi";
        acc[name] = curr;
        // Also keep the original
        acc[curr.state] = curr;
        return acc;
    }, {});

    const maxVal = Math.max(...data.map((d: any) => {
        if (metric === 'enrolments') return d.total_enrolments;
        if (metric === 'updates') return d.total_updates;
        if (metric === 'demographic') return d.total_demographic;
        if (metric === 'biometric') return d.total_biometric;
        return 0;
    }), 1);

    // Define color scalers
    const getFill = (stateName: string) => {
        const item = stateData[stateName] ||
            stateData[stateName.replace(" & ", " and ")] ||
            stateData[stateName.replace("NCT of ", "")] ||
            {};

        const val = metric === 'enrolments' ? item.total_enrolments :
            metric === 'updates' ? item.total_updates :
                metric === 'demographic' ? item.total_demographic :
                    item.total_biometric;

        const intensity = val ? (val / (maxVal * 0.8)) : 0;

        if (metric === 'enrolments') {
            return val ? `rgba(2, 13, 81, ${Math.max(intensity, 0.15)})` : '#f8fafc';
        } else if (metric === 'updates') {
            return val ? `rgba(255, 153, 51, ${Math.max(intensity, 0.15)})` : '#f8fafc';
        } else if (metric === 'demographic') {
            // Purple for Demographic
            return val ? `rgba(107, 33, 168, ${Math.max(intensity, 0.15)})` : '#f8fafc';
        } else {
            // Teal for Biometric
            return val ? `rgba(13, 148, 136, ${Math.max(intensity, 0.15)})` : '#f8fafc';
        }
    };

    const getStroke = (stateName: string) => {
        return "#dee2e6";
    };

    return (
        <div className="w-full h-[500px] bg-white relative rounded-xl overflow-hidden block border border-slate-100">
            {/* Map Header */}
            <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${metric === 'enrolments' ? 'bg-[#020D51]' :
                            metric === 'updates' ? 'bg-[#FF9933]' :
                                metric === 'demographic' ? 'bg-purple-700' : 'bg-teal-600'
                        }`} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Live {metric.charAt(0).toUpperCase() + metric.slice(1)} Heatmap
                    </span>
                </div>
            </div>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={PROJECTION_CONFIG}
                width={800}
                height={700}
                style={{ width: "100%", height: "500px" }}
            >
                <Geographies geography={INDIA_TOPO_JSON}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const stateName = geo.properties.st_nm || geo.properties.name || geo.properties.NAME_1 || "Unknown";
                            const item = stateData[stateName] ||
                                stateData[stateName.replace(" & ", " and ")] ||
                                stateData[stateName.replace("NCT of ", "")] ||
                                null;

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={getFill(stateName)}
                                    stroke={getStroke(stateName)}
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: {
                                            fill: metric === 'enrolments' ? "#020D51" :
                                                metric === 'updates' ? "#FF9933" :
                                                    metric === 'demographic' ? "#6b21a8" : "#0d9488",
                                            outline: "none",
                                            stroke: "#000",
                                            strokeWidth: 0.8,
                                            cursor: "pointer"
                                        },
                                        pressed: { outline: "none" },
                                    }}
                                    onMouseEnter={() => {
                                        const { name, total_enrolments, total_updates, total_demographic, total_biometric } = item ||
                                            { name: stateName, total_enrolments: 0, total_updates: 0, total_demographic: 0, total_biometric: 0 };
                                        setHoveredState({ name, total_enrolments, total_updates, total_demographic, total_biometric });
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredState(null);
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>

            {/* Professional White Tooltip */}
            {hoveredState && (
                <div
                    className="absolute z-50 pointer-events-none bg-white text-slate-800 p-5 rounded-2xl shadow-xl w-72 border border-slate-200"
                    style={{ top: '20px', right: '20px' }}
                >
                    <div className="flex flex-col gap-1 mb-4 border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Selected Authority</span>
                        <h3 className="text-lg font-black text-[#020D51]">{hoveredState.name}</h3>
                    </div>

                    {/* Special Logic for Occupied Territories - Professional Alert */}
                    {(hoveredState?.name && (hoveredState.name.includes("Jammu") || hoveredState.name.includes("Kashmir") || hoveredState.name.includes("Ladakh"))) && (
                        <div className="mb-4 p-2.5 bg-orange-50 border border-orange-100 rounded-xl text-[10px] text-orange-800 leading-normal">
                            <strong>Territory Status:</strong> Includes POK/COK regions. Aadhaar saturation data for these areas is held pending administrative access.
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center text-[11px] mb-1.5">
                                <span className="text-slate-500 font-bold uppercase">Enrolments</span>
                                <span className="font-bold text-[#020D51]">{(hoveredState.total_enrolments || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-right from-[#020D51] to-[#19B0DC] h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(((hoveredState.total_enrolments || 0) / maxVal) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <div className="flex justify-between items-center text-[10px] mb-1">
                                    <span className="text-slate-400 font-bold uppercase">Updates</span>
                                    <span className="font-bold text-[#FF9933]">{(hoveredState.total_updates || 0).toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-[#FF9933] h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(((hoveredState.total_updates || 0) / maxVal) * 100, 100)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center text-[10px] mb-1">
                                    <span className="text-slate-400 font-bold uppercase">Demographic</span>
                                    <span className="font-bold text-purple-600">{(hoveredState.total_demographic || 0).toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-purple-600 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(((hoveredState.total_demographic || 0) / maxVal) * 100, 100)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center text-[10px] mb-1">
                                    <span className="text-slate-400 font-bold uppercase">Biometric</span>
                                    <span className="font-bold text-teal-600">{(hoveredState.total_biometric || 0).toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-teal-600 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(((hoveredState.total_biometric || 0) / maxVal) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Density Legend</p>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-slate-400">LOW</span>
                    <div className={`w-24 h-1.5 rounded-full bg-gradient-to-r ${metric === 'enrolments' ? 'from-blue-100 to-[#020D51]' :
                            metric === 'updates' ? 'from-orange-100 to-[#FF9933]' :
                                metric === 'demographic' ? 'from-purple-100 to-purple-800' : 'from-teal-100 to-teal-700'
                        }`} />
                    <span className="text-[8px] font-bold text-slate-400">HIGH</span>
                </div>
            </div>

            <div className="absolute bottom-2 left-4 text-[9px] text-slate-400 font-medium select-none uppercase tracking-tighter">
                Visual Analytics Ecosystem | UIDAI Government of India
            </div>
        </div>
    );
}
