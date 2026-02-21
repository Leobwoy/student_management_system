"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/auth";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    Legend, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
    TrendingUp, Users, AlertTriangle, BookOpen, ChevronRight
} from "lucide-react";

interface CourseStat {
    courseName: string;
    totalStudents: number;
    averageGrade: number;
    attendanceRate: number;
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function AnalyticsPage() {
    const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

    useEffect(() => {
        fetchAggregatedStats();
    }, []);

    const fetchAggregatedStats = async () => {
        try {
            setLoading(true);
            // We'll mimic the advanced aggregates by querying our generated courses 
            // and firing parallel GET /analytics/course/:id requests
            const coursesRes = await api.get("/courses");
            const courses = coursesRes.data;

            const statsPromises = courses.map(async (c: { id: string; code: string; name: string }) => {
                try {
                    const stat = await api.get(`/analytics/course/${c.id}?term=Fall 2026`);
                    return {
                        courseName: c.code,
                        totalStudents: Number(stat.data.totalEnrolled),
                        averageGrade: Number(stat.data.averageGradeScore),
                        attendanceRate: Number(stat.data.attendancePercentage)
                    };
                } catch {
                    return null; // Skip if analytics aren't seeded for this course yet
                }
            });

            const resolvedStats = (await Promise.all(statsPromises)).filter(Boolean) as CourseStat[];
            setCourseStats(resolvedStats);

            // Mimicking an "At-Risk" algorithm by grabbing a subset of students and checking their individual GPA
            const studentsRes = await api.get("/students");
            const sampleStudents = studentsRes.data.slice(0, 5); // Just grab a quick sample for the dashboard

            const riskPromises = sampleStudents.map(async (s: Student) => {
                try {
                    const gpaRes = await api.get(`/analytics/student/${s.id}?term=Fall 2026`);
                    const gpa = Number(gpaRes.data.averageGpaScore);
                    const att = Number(gpaRes.data.attendancePercentage);

                    if (gpa < 70 || att < 85) {
                        return { ...s, gpa, attendance: att, riskFactor: gpa < 70 ? 'Academic' : 'Attendance' };
                    }
                    return null;
                } catch {
                    return null;
                }
            });

            const resolvedRisks = (await Promise.all(riskPromises)).filter(Boolean);
            setAtRiskStudents(resolvedRisks);

        } catch (err) {
            console.error("Dashboard Aggregation failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80 bg-gray-100 animate-pulse rounded-xl"></div>
                    <div className="h-80 bg-gray-100 animate-pulse rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="bg-gradient-to-r from-oxford-blue to-oxford-dark rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <h1 className="text-3xl font-bold mb-2 flex items-center relative z-10">
                    <TrendingUp className="w-8 h-8 mr-3 text-oxford-accent" />
                    Advanced Analytics Dashboard
                </h1>
                <p className="text-oxford-light relative z-10 max-w-2xl">
                    Real-time aggregation of Academic and Operations data across all departments at Oxford Preparatory.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* At-Risk Students Panel (Takes up 1 column) */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-oxford-dark flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                            At-Risk Students
                        </h2>
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {atRiskStudents.length} Flagged
                        </span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {atRiskStudents.length > 0 ? (
                            <div className="space-y-4">
                                {atRiskStudents.map((student, idx) => (
                                    <div key={idx} className="bg-gray-50 border border-red-100 rounded-lg p-4 hover:border-red-300 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-semibold text-oxford-dark group-hover:text-oxford-accent transition-colors">
                                                {student.lastName}, {student.firstName}
                                            </p>
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-oxford-accent transition-transform group-hover:translate-x-1" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                            <div className="bg-white p-2 rounded border border-gray-100">
                                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">GPA</span>
                                                <span className={`font-bold ${student.gpa < 70 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {student.gpa.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2 rounded border border-gray-100">
                                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Attendance</span>
                                                <span className={`font-bold ${student.attendance < 85 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {student.attendance.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-70 py-10">
                                <AlertTriangle className="w-12 h-12 mb-3 text-gray-300" />
                                <p>No high-risk students detected in the sampled cohort.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Container (Takes up 2 columns) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* GPA Distribution Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <BookOpen className="w-5 h-5 mr-2 text-oxford-accent" />
                            <h2 className="text-lg font-bold text-oxford-dark">Department Grade Averages</h2>
                        </div>

                        <div className="h-72 w-full">
                            {courseStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={courseStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="courseName" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <RechartsTooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="averageGrade" name="Average Course GPA" fill="#002147" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p>Insufficient analytical data to render distribution metric.</p>
                                    <p className="text-sm mt-2">Enter student grades into courses to populate.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Trend Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <Users className="w-5 h-5 mr-2 text-oxford-accent" />
                            <h2 className="text-lg font-bold text-oxford-dark">Attendance Retention Rates</h2>
                        </div>

                        <div className="h-72 w-full">
                            {courseStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={courseStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="courseName" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="attendanceRate" name="Attendance %" stroke="#cc9900" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p>Insufficient structural data to render retention metric.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
