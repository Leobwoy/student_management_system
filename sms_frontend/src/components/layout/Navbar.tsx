"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { User, Bell } from "lucide-react";

interface DecodedToken {
    email: string;
    role: string;
}

export default function Navbar() {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === '/dashboard') return "Dashboard Overview";
        if (pathname.includes('/students')) return "Student Roster";
        if (pathname.includes('/courses')) return "Course Registry";
        if (pathname.includes('/attendance')) return "Attendance Tracking";
        if (pathname.includes('/grades')) return "Gradebook Management";
        if (pathname.includes('/documents')) return "Document Vault";
        if (pathname.includes('/analytics')) return "Analytics Engine";
        if (pathname.includes('/notifications')) return "Notification Hub";
        if (pathname.includes('/health')) return "System Health";
        return "Oxford Admin Tools";
    };

    useEffect(() => {
        const token = Cookies.get("access_token");
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUser(decoded);
            } catch (e) {
                console.error("Invalid token");
            }
        }
    }, []);

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
            <div className="flex items-center md:hidden">
                {/* Placeholder for hamburger menu spacing on mobile */}
            </div>

            <div className="flex-1 md:flex-none">
                <h2 className="text-xl font-semibold text-oxford-dark hidden md:block">
                    {getPageTitle()}
                </h2>
            </div>

            <div className="flex items-center space-x-6">
                <button className="text-gray-400 hover:text-oxford-accent transition-colors relative">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center space-x-3">
                    <div className="hidden md:block text-right">
                        <div className="text-sm font-medium text-oxford-dark">
                            {user?.email || "User"}
                        </div>
                        <div className="text-xs font-semibold text-oxford-accent uppercase tracking-wider">
                            {user?.role || "GUEST"}
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-oxford-light text-white flex items-center justify-center shadow-inner">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
