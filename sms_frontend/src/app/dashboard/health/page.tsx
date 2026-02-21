"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
    Activity, Database, HardDrive, Download, Clock, ShieldCheck, FileSpreadsheet, Lock
} from "lucide-react";

interface HealthStatus {
    status: string;
    info: {
        database?: {
            status: string;
        };
    };
    error: unknown;
    details: Record<string, unknown>;
}

export default function SystemHealthPage() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();

    // Export State
    const [exportingGpa, setExportingGpa] = useState(false);
    const [exportingAttendance, setExportingAttendance] = useState(false);

    useEffect(() => {
        const token = Cookies.get("access_token");
        if (token) {
            try {
                const decoded = jwtDecode<{ role: string }>(token);
                setUserRole(decoded.role);

                // Strictly boot non-admins immediately
                if (decoded.role !== "ADMIN") {
                    router.push("/dashboard");
                }
            } catch (e) {
                console.error("Invalid token decoding.");
            }
        }

        fetchHealthStatus();
    }, [router]);

    const fetchHealthStatus = async () => {
        try {
            const res = await api.get("/health");
            setHealth(res.data);
        } catch (err: unknown) {
            console.error("Health check failed:", err);
            const errorObj = err as { response?: { data?: HealthStatus } };
            if (errorObj.response?.data) {
                setHealth(errorObj.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type: 'gpa' | 'attendance') => {
        if (type === 'gpa') setExportingGpa(true);
        if (type === 'attendance') setExportingAttendance(true);

        // Mock theoretical blob download delay
        setTimeout(() => {
            const csvStr = type === 'gpa'
                ? "Student ID,Last Name,First Name,Term,Cumulative GPA\n1,Doe,John,Fall 2026,92.5"
                : "Student ID,Last Name,First Name,Term,Attendance Rate\n1,Doe,John,Fall 2026,98.0";

            const blob = new Blob([csvStr], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `oxford_prep_${type}_export.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            if (type === 'gpa') setExportingGpa(false);
            if (type === 'attendance') setExportingAttendance(false);
        }, 1500);
    };

    if (userRole !== "ADMIN") return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="bg-oxford-dark rounded-xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light">
                <div>
                    <h1 className="text-3xl font-bold flex items-center mb-2">
                        <Activity className="w-8 h-8 mr-3 text-oxford-accent" />
                        System Infrastructure & Health
                    </h1>
                    <p className="text-oxford-light">
                        Monitor API gateways, PostgreSQL persistence boundaries, and extract compliance reporting.
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex items-center bg-oxford-blue px-4 py-2 rounded-lg border border-oxford-light/20">
                    <ShieldCheck className="w-5 h-5 mr-2 text-green-400" />
                    <span className="font-semibold text-sm tracking-wide">Oxford Security Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Terminus Aggregate Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className={`p-4 rounded-full mr-4 ${health?.status === 'ok' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <Activity className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">API Root Payload</p>
                        <h3 className="text-2xl font-bold flex items-center mt-1 text-oxford-dark">
                            {loading ? "..." : (health?.status === 'ok' ? 'Operational' : 'Degraded')}
                        </h3>
                    </div>
                </div>

                {/* PostgreSQL Database Health */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className={`p-4 rounded-full mr-4 ${health?.info?.database?.status === 'up' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        <Database className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">PostgreSQL Relational DB</p>
                        <h3 className="text-2xl font-bold flex items-center mt-1 text-oxford-dark">
                            {loading ? "..." : (health?.info?.database?.status === 'up' ? 'Connected' : 'Offline')}
                        </h3>
                    </div>
                </div>

                {/* Cron Job Backup Mock */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className={`p-4 rounded-full mr-4 bg-purple-50 text-purple-600`}>
                        <HardDrive className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">Last Backup Cycle</p>
                        <h3 className="text-2xl font-bold flex items-center mt-1 text-oxford-dark">
                            00:00 AM
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Today
                        </p>
                    </div>
                </div>

                {/* Auth Protocol */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className={`p-4 rounded-full mr-4 bg-oxford-accent/10 text-oxford-accent`}>
                        <Lock className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">Auth Protocol</p>
                        <h3 className="text-2xl font-bold flex items-center mt-1 text-oxford-dark">
                            Strict JWT
                        </h3>
                    </div>
                </div>
            </div>

            {/* Admin Operations & Compliance Exports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-oxford-dark flex items-center">
                        <Download className="w-5 h-5 mr-3 text-oxford-accent" />
                        Compliance Data Extractions
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Export raw metrics across the institution into comma-separated formats for external auditors.</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-oxford-accent/30 transition-colors">
                        <div>
                            <div className="flex items-center mb-2">
                                <FileSpreadsheet className="w-6 h-6 mr-2 text-green-600" />
                                <h3 className="font-semibold text-oxford-dark">Master Gradebook (.csv)</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Aggregate extraction of all enrolled students, cross-referenced with course metadata and cumulative term GPAs.</p>
                        </div>
                        <button
                            onClick={() => handleExport('gpa')}
                            disabled={exportingGpa}
                            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex justify-center items-center ${exportingGpa ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-oxford-blue text-white hover:bg-oxford-dark shadow-sm'}`}
                        >
                            {exportingGpa ? 'Synthesizing...' : 'Download GPA Export'}
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-oxford-accent/30 transition-colors">
                        <div>
                            <div className="flex items-center mb-2">
                                <FileSpreadsheet className="w-6 h-6 mr-2 text-green-600" />
                                <h3 className="font-semibold text-oxford-dark">Attendance Rosters (.csv)</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Global extraction detailing individual presence, absence, and late-arrival frequencies.</p>
                        </div>
                        <button
                            onClick={() => handleExport('attendance')}
                            disabled={exportingAttendance}
                            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex justify-center items-center ${exportingAttendance ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-2 border-oxford-blue text-oxford-blue hover:bg-oxford-blue hover:text-white shadow-sm'}`}
                        >
                            {exportingAttendance ? 'Synthesizing...' : 'Download Attendance Export'}
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
