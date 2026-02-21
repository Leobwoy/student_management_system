"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/auth";
import { BookOpen, GraduationCap, TrendingUp, Search } from "lucide-react";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Course {
    id: string;
    name: string;
    code: string;
}

interface StudentAnalytics {
    averageGpaScore: number;
}

export default function GradesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [score, setScore] = useState<number | "">("");
    const [term, setTerm] = useState<string>("Fall 2026");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);

    useEffect(() => {
        api.get("/courses").then(res => setCourses(res.data)).catch(console.error);
        api.get("/students").then(res => setStudents(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            api.get(`/analytics/student/${selectedStudent}?term=${term}`)
                .then(res => setAnalytics(res.data))
                .catch(() => setAnalytics({ averageGpaScore: 0 })); // Reset if null/error
        } else {
            setAnalytics(null);
        }
    }, [selectedStudent, term]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !selectedCourse || score === "") {
            setMessage({ text: "Please fill out all fields.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await api.post("/grades", {
                studentId: selectedStudent,
                courseId: selectedCourse,
                score: Number(score),
                term,
            });
            setMessage({ text: "Grade successfully recorded!", type: "success" });
            setScore(""); // Reset form field

            // Refresh analytics softly
            const res = await api.get(`/analytics/student/${selectedStudent}?term=${term}`);
            setAnalytics(res.data);
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } } };
            setMessage({ text: errorObj.response?.data?.message || "Failed to record grade.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Entry Form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
                        <GraduationCap className="w-8 h-8 text-oxford-accent mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-oxford-dark">Gradebook Entry</h1>
                            <p className="text-sm text-gray-500">Input student scores securely.</p>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Student</label>
                            <select
                                required
                                className="w-full border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent bg-gray-50 focus:bg-white"
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                            >
                                <option value="">-- Choose Student --</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.lastName}, {s.firstName} ({s.email})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Course</label>
                            <select
                                required
                                className="w-full border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent bg-gray-50 focus:bg-white"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">-- Choose Course --</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-oxford-dark mb-2">Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    value={score}
                                    onChange={(e) => setScore(e.target.value ? Number(e.target.value) : "")}
                                    className="w-full border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent bg-gray-50 focus:bg-white"
                                    placeholder="e.g. 95"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-oxford-dark mb-2">Term</label>
                                <select
                                    required
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    className="w-full border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent bg-gray-50 focus:bg-white"
                                >
                                    <option value="Fall 2026">Fall 2026</option>
                                    <option value="Spring 2027">Spring 2027</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2.5 bg-oxford-accent text-white font-medium rounded-lg shadow-sm hover:bg-oxford-light transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Recording...' : 'Submit Grade'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Analytics Display */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="bg-oxford-blue text-white p-6">
                        <h3 className="font-semibold text-lg flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 opacity-80" />
                            Student Intel
                        </h3>
                        <p className="text-oxford-light text-sm mt-1">Real-time GPA querying</p>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-center items-center text-center bg-gray-50">
                        {selectedStudent ? (
                            analytics ? (
                                <div className="animate-in zoom-in-95 duration-300">
                                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Average GPA</div>
                                    <div className={`text-6xl font-extrabold ${Number(analytics.averageGpaScore) >= 90 ? 'text-green-600' : Number(analytics.averageGpaScore) >= 70 ? 'text-oxford-accent' : 'text-red-500'}`}>
                                        {Number(analytics.averageGpaScore).toFixed(1)}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">Score from {term}</p>
                                </div>
                            ) : (
                                <div className="text-gray-400 animate-pulse">Loading analytics...</div>
                            )
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <Search className="w-10 h-10 mb-3 opacity-20" />
                                <p>Select a student to display live analytics.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
