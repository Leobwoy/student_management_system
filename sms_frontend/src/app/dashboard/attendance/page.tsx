"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/auth";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

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

interface AttendanceRecord {
    studentId: string;
    status: "Present" | "Absent" | "Late";
}

export default function AttendancePage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [term, setTerm] = useState<string>("Fall 2026");
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent" | "Late">>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        // Fetch courses on mount
        api.get("/courses").then(res => setCourses(res.data)).catch(console.error);
        // Fetch students
        api.get("/students").then(res => setStudents(res.data)).catch(console.error);
    }, []);

    const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Late") => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) {
            setMessage({ text: "Please select a course first.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        // Format for backend RecordAttendanceDto
        const payload = {
            courseId: selectedCourse,
            date: new Date(date).toISOString(),
            term,
            records: Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status,
            }))
        };

        try {
            await api.post("/attendance", payload);
            setMessage({ text: "Attendance records successfully saved!", type: "success" });
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } } };
            setMessage({ text: errorObj.response?.data?.message || "Failed to save attendance.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-3xl font-bold text-oxford-dark mb-2">Attendance Marking</h1>
                <p className="text-gray-600 mb-8">
                    Select a course and mark the daily attendance for enrolled students. Attendance records are permanently written.
                </p>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Course</label>
                            <select
                                required
                                className="w-full border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent bg-gray-50 focus:bg-white"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">-- Select Course --</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent bg-gray-50 focus:bg-white"
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

                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
                            <h3 className="font-semibold text-oxford-dark flex items-center">
                                <Users className="w-5 h-5 mr-2 text-oxford-accent" />
                                Student Roster
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold py-3 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 whitespace-nowrap">Student Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-oxford-dark">
                                                {student.lastName}, {student.firstName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{student.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(student.id, "Present")}
                                                        className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${attendance[student.id] === 'Present' ? 'bg-green-100 text-green-700 font-semibold ring-1 ring-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Present
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(student.id, "Late")}
                                                        className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${attendance[student.id] === 'Late' ? 'bg-yellow-100 text-yellow-700 font-semibold ring-1 ring-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        Late
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(student.id, "Absent")}
                                                        className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${attendance[student.id] === 'Absent' ? 'bg-red-100 text-red-700 font-semibold ring-1 ring-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                No students found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2.5 bg-oxford-accent text-white font-medium rounded-lg shadow-sm hover:bg-oxford-light transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Saving Records...' : 'Submit Attendance Batch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
