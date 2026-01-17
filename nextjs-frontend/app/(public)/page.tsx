"use client";

import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-full">

            {/* Hero Section - Dynamic Tricolor Mesh */}
            <section className="relative h-[600px] w-full overflow-hidden bg-white">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#FF9933_0%,_transparent_40%),radial-gradient(circle_at_bottom_left,_#138808_0%,_transparent_40%),radial-gradient(circle_at_center,_#FFFFFF_0%,_transparent_100%)] opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="relative z-20 h-full max-w-7xl mx-auto px-4 md:px-16 flex flex-col justify-center items-start text-slate-800">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="h-1 w-12 bg-[#FF9933] rounded-full"></span>
                        <span className="text-sm font-bold tracking-widest text-slate-500 uppercase">Government of India</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight text-slate-900">
                        Aadhaar <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-blue-700 to-[#138808]">Analytics & Insights</span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-norma border-l-4 border-blue-600 pl-6">
                        Unlocking societal trends through identification data.
                        Secure, Scalable, and Empowering the Digital Nation.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        {/* Primary Action - Saffron */}
                        <Link href="/dashboard" className="relative overflow-hidden group bg-gradient-to-r from-[#FF9933] to-orange-600 text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1">
                            <span className="relative z-10 flex items-center gap-2">
                                Launch Dashboard <span>➜</span>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </Link>

                        {/* Secondary Action - White/Blue */}
                        <Link href="/admin" className="px-8 py-4 rounded-lg font-bold border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2">
                            <span>🔐</span> Admin Portal
                        </Link>
                    </div>
                </div>

                {/* Decorative Emblem Watermark */}
                <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-contain bg-no-repeat opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg')" }}></div>
            </section>

            {/* Services Section - Colorful Cards */}
            <section className="py-20 bg-slate-50 relative z-30 px-4 md:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-800">Digital Services</h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] mx-auto mt-4 rounded-full border border-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ServiceCard
                            title="Analytics Engine"
                            desc="Comprehensive demographic insights and real-time visualization."
                            icon="📊"
                            href="/dashboard"
                            color="blue"
                            fill="bg-blue-50"
                        />
                        <ServiceCard
                            title="Admin Console"
                            desc="Datasets management and system configuration portal."
                            icon="⚙️"
                            href="/admin"
                            color="orange"
                            fill="bg-orange-50"
                        />
                        <ServiceCard
                            title="Check Status"
                            desc="Verify enrolment status safely using EID or URN."
                            icon="✅"
                            href="/check-status"
                            color="green"
                            fill="bg-green-50"
                        />
                    </div>
                </div>
            </section>

            {/* Info Strip - Tricolor */}
            <section className="py-12 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-x divide-gray-100">
                    <div className="p-4">
                        <p className="text-4xl font-bold text-[#FF9933] mb-2">1.3B+</p>
                        <p className="text-slate-500 font-medium">Aadhaars Generated</p>
                    </div>
                    <div className="p-4">
                        <p className="text-4xl font-bold text-blue-600 mb-2">99.9%</p>
                        <p className="text-slate-500 font-medium">Uptime Guarantee</p>
                    </div>
                    <div className="p-4">
                        <p className="text-4xl font-bold text-[#138808] mb-2">100%</p>
                        <p className="text-slate-500 font-medium">Secure & Private</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ServiceCard({ title, desc, icon, href, color, fill }: any) {
    const borders: any = {
        blue: "border-blue-500",
        orange: "border-orange-500",
        green: "border-[#138808]",
    };
    const texts: any = {
        blue: "text-blue-600",
        orange: "text-orange-600",
        green: "text-[#138808]",
    };

    return (
        <Link href={href} className={`block bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-t-4 ${borders[color]} border-x border-b border-gray-100 group relative overflow-hidden`}>
            <div className={`absolute inset-0 ${fill} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform border border-gray-100">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-black">{title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm mb-8">{desc}</p>

                <span className={`inline-flex items-center gap-2 font-bold text-sm ${texts[color]} uppercase tracking-widest`}>
                    Access <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </div>
        </Link>
    );
}
