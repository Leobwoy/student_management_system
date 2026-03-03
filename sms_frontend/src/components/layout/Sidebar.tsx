"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import {
    Users,
    BookOpen,
    FileText,
    BarChart,
    LogOut,
    Home,
    Menu,
    X,
    CheckCircle,
    GraduationCap,
    Bell,
    Activity
} from "lucide-react";

interface DecodedToken {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export default function Sidebar() {
    const [role, setRole] = useState<string | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const token = Cookies.get("access_token");
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setRole(decoded.role.toUpperCase());
            } catch (e) {
                console.error("Invalid token");
            }
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove("access_token");
        router.push("/login");
    };

    const navLinks = [
        {
            name: "Overview",
            href: "/dashboard",
            icon: <Home className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
        },
        {
            name: "Students",
            href: "/dashboard/students",
            icon: <Users className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
        },
        {
            name: "Courses",
            href: "/dashboard/courses",
            icon: <BookOpen className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
        },
        {
            name: "Attendance",
            href: "/dashboard/attendance",
            icon: <CheckCircle className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
        },
        {
            name: "Grades",
            href: "/dashboard/grades",
            icon: <GraduationCap className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
        },
        {
            name: "Documents",
            href: "/dashboard/documents",
            icon: <FileText className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
        },
        {
            name: "Analytics",
            href: "/dashboard/analytics",
            icon: <BarChart className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN"],
        },
        {
            name: "Notifications",
            href: "/dashboard/notifications",
            icon: <Bell className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER"],
        },
        {
            name: "System Health",
            href: "/dashboard/health",
            icon: <Activity className="w-5 h-5" />,
            roles: ["SUPERUSER", "ADMIN"],
        },
    ];

    const filteredLinks = mounted ? navLinks.filter(link => role && link.roles.includes(role)) : [];

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-oxford-blue text-white rounded-md shadow-md"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X /> : <Menu />}
            </button>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-oxford-blue text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-center h-20 border-b border-oxford-light px-6">
                    <div className="w-10 h-10 bg-oxford-accent rounded-full flex items-center justify-center font-bold text-lg mr-3 shadow-md">
                        OX
                    </div>
                    <span className="text-xl font-bold tracking-wide">Oxford Prep</span>
                </div>

                <div className="px-6 py-4 text-xs font-semibold text-oxford-light uppercase tracking-wider">
                    Main Menu
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {filteredLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${isActive
                                    ? "bg-oxford-accent text-white shadow-md"
                                    : "text-gray-300 hover:bg-oxford-light hover:text-white"
                                    }`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <div className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {link.icon}
                                </div>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-oxford-light">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-900/50 hover:text-red-100 transition-colors group"
                    >
                        <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-200" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
