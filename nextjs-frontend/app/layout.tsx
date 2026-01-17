import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "UIDAI Analytics Ecosystem",
    description: "Next-Gen Analytics & Public Services",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
            </head>
            <body className={inter.className} suppressHydrationWarning={true}>
                {/* Government of India Banner */}
                <div className="bg-[#020D51] text-white py-1.5 px-4 text-[10px] md:text-xs flex items-center justify-between border-b border-white/10 uppercase tracking-widest font-medium">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <img src="https://uidai.gov.in/images/flag.png" alt="India Flag" className="w-4 h-2.5" />
                            Government of India
                        </span>
                        <span className="hidden md:inline opacity-60">|</span>
                        <span className="hidden md:inline opacity-60">Ministry of Electronics & Information Technology</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="cursor-pointer hover:underline">Sitemap</span>
                        <span className="cursor-pointer hover:underline">Contact Us</span>
                    </div>
                </div>
                {children}
            </body>
        </html>
    );
}
