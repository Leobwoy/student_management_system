"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/auth";
import { useParams } from "next/navigation";
import { User, FileText, GraduationCap } from "lucide-react";

export default function StudentProfilePage() {
    const params = useParams();
    const id = params.id as string;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            api.get(`/students/${id}/full-profile`)
                .then(res => setProfile(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Profile...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Profile Not Found</div>;

    const reports = profile.documents?.filter((doc: any) => doc.documentType === 'TERMINAL_REPORT') || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-oxford-dark">Student Profile 360</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile.firstName || "Unknown"} {profile.lastName || "Student"}</h2>
                            <p className="text-sm text-gray-500">UID: {profile.id.substring(0, 8)}</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-gray-700">Class:</span> {profile.classGroup?.name || "Unassigned"}</p>
                        <p><span className="font-semibold text-gray-700">Enrolled:</span> {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Academic Reports Tab */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-oxford-dark flex items-center mb-4 border-b border-gray-100 pb-2">
                        <GraduationCap className="w-5 h-5 mr-2 text-oxford-accent" />
                        Academic Vault Reports
                    </h3>

                    {reports.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            {reports.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white shadow-sm transition-colors">
                                    <div className="flex items-center">
                                        <FileText className="w-5 h-5 text-oxford-accent mr-3" />
                                        <div>
                                            <span className="text-sm font-semibold text-oxford-dark block">{doc.title}</span>
                                            <span className="text-xs text-gray-500">Rendered: {new Date(doc.uploadedAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={`http://localhost:3001/${doc.filePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                    >
                                        Inspect JSON
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-lg mt-4 border border-dashed border-gray-200">
                            No terminal reports generated for this student yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
