import "../globals.css";
import Link from "next/link";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
            {/* Top Utility Bar */}
            <div className="bg-slate-100 text-xs py-1 px-4 md:px-16 flex justify-between border-b border-gray-200 text-slate-600">
                <div className="flex gap-4">
                    <span>Government of India</span>
                    <span>Unique Identification Authority of India</span>
                </div>
                <div className="flex gap-4">
                    <span className="cursor-pointer hover:text-blue-700">English</span>
                    <span className="cursor-pointer hover:text-blue-700">Skip to Main Content</span>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white py-4 px-4 md:px-16 shadow-sm sticky top-0 z-50">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    {/* Logo Area */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-16 md:w-16 md:h-20 bg-contain bg-no-repeat bg-center opacity-90" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg')" }}></div>
                        <div className="h-12 w-[1px] bg-gray-300"></div>
                        <div className="w-24 md:w-32">
                            <div className="text-2xl font-bold text-blue-900 leading-none">Aadhaar</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Mera Aadhaar, Meri Pehchan</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-700">
                        <Link href="/" className="hover:text-blue-700 border-b-2 border-transparent hover:border-blue-700 py-1">My Aadhaar</Link>
                        <Link href="/dashboard" className="hover:text-blue-700 border-b-2 border-transparent hover:border-blue-700 py-1 text-blue-800">Analytics Dashboard</Link>
                        <Link href="/about" className="hover:text-blue-700 border-b-2 border-transparent hover:border-blue-700 py-1">About UIDAI</Link>
                        <div className="w-6 h-6">🔍</div>
                    </nav>

                    {/* Mobile Menu Button (Placeholder) */}
                    <div className="md:hidden text-2xl">☰</div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 bg-slate-50">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-4 md:px-16 text-sm">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase">Contact Us</h4>
                        <p>Toll Free: 1947</p>
                        <p>help@uidai.gov.in</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase">Website Policy</h4>
                        <p>Terms of Use</p>
                        <p>Privacy Policy</p>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs">
                    Copyright © 2024 Unique Identification Authority of India. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
