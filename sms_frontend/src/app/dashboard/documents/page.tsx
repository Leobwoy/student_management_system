"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import {
    FileText, UploadCloud, Search, Download, History,
    Trash2, FileType, CheckCircle, AlertCircle
} from "lucide-react";

interface Document {
    id: string;
    title: string;
    description: string;
    department: string;
    version: number;
    filePath: string;
    createdAt: string;
    uploader: {
        email: string;
    };
}

export default function DocumentVaultPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userRole, setUserRole] = useState<string | null>(null);

    // Upload Form State
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [department, setDepartment] = useState("Academic");

    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState({ text: "", type: "" });
    const [activeTab, setActiveTab] = useState<"explorer" | "upload">("explorer");

    useEffect(() => {
        // Determine User Role for RBAC
        const token = Cookies.get("access_token");
        if (token) {
            try {
                const decoded = jwtDecode<{ role: string }>(token);
                setUserRole(decoded.role);
            } catch (e) {
                console.error("Invalid token decoding in Documents page.");
            }
        }
    }, []);

    useEffect(() => {
        if (activeTab === "explorer") {
            fetchDocuments();
        }
    }, [activeTab, searchTerm]);

    const fetchDocuments = async () => {
        try {
            if (searchTerm.length >= 3) {
                const res = await api.get(`/documents/search?query=${searchTerm}`);
                setDocuments(res.data);
            } else if (searchTerm.length === 0) {
                const res = await api.get("/documents/search?query="); // empty query returns all
                setDocuments(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            setUploadMessage({ text: "Please provide a file and title.", type: "error" });
            return;
        }

        setIsUploading(true);
        setUploadMessage({ text: "", type: "" });

        // Multi-part FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        if (description) formData.append("description", description);
        formData.append("department", department);

        try {
            await api.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadMessage({ text: "Document successfully vaulted!", type: "success" });

            // Reset form
            setFile(null);
            setTitle("");
            setDescription("");

            // Delay before switching tabs to show success
            setTimeout(() => {
                setActiveTab("explorer");
            }, 1500);
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } } };
            setUploadMessage({
                text: errorObj.response?.data?.message || "Upload failed. Please check permissions and file size.",
                type: "error"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = (doc: Document) => {
        // In a real env, you would trigger a file grab/blob download.
        // Assuming backend serves static or has a distinct download route.
        window.alert(`Downloading: ${doc.title} (v${doc.version})`);
    };

    const canUpload = userRole === "ADMIN" || userRole === "TEACHER";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header & Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-oxford-dark flex items-center">
                        <FileText className="w-8 h-8 mr-3 text-oxford-accent" />
                        Document Vault
                    </h1>
                    <p className="text-gray-500 mt-1 pl-11">Securely manage institutional knowledge</p>
                </div>

                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("explorer")}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'explorer' ? 'bg-white text-oxford-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Explorer
                    </button>

                    {canUpload && (
                        <button
                            onClick={() => setActiveTab("upload")}
                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'upload' ? 'bg-white text-oxford-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Upload New
                        </button>
                    )}
                </div>
            </div>

            {/* Explorer Tab */}
            {activeTab === "explorer" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-lg font-semibold text-oxford-dark">All Documents</h2>

                        <div className="relative w-full sm:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search vaults... (min 3 chars)"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-oxford-accent focus:border-oxford-accent bg-gray-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <div key={doc.id} className="group border border-gray-200 rounded-xl p-5 hover:border-oxford-accent hover:shadow-md transition-all duration-200 bg-white flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 rounded-lg text-oxford-accent">
                                            <FileType className="w-6 h-6" />
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                            v{doc.version}.0
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-oxford-dark mb-1 line-clamp-1" title={doc.title}>
                                        {doc.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                                        {doc.description || "No description provided."}
                                    </p>

                                    <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                            <span className="truncate max-w-[120px]" title={doc.uploader.email}>
                                                By: {doc.uploader.email.split('@')[0]}
                                            </span>
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="w-full flex items-center justify-center py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-oxford-dark bg-gray-50 hover:bg-oxford-accent hover:text-white hover:border-oxford-accent transition-colors"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium text-gray-500">No documents materialized.</p>
                                <p className="text-sm mt-1">Try a different search or upload one.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Tab */}
            {activeTab === "upload" && canUpload && (
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-in zoom-in-95 duration-300">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8 text-oxford-accent" />
                        </div>
                        <h2 className="text-2xl font-bold text-oxford-dark">Secure Document Upload</h2>
                        <p className="text-gray-500 text-sm mt-1">Upload files to the central institutional vault. Versions manage automatically based on title.</p>
                    </div>

                    {uploadMessage.text && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center text-sm ${uploadMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                            {uploadMessage.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
                            {uploadMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleFileUpload} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Document Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-oxford-accent/20 focus:border-oxford-accent bg-gray-50 focus:bg-white transition-all"
                                placeholder="e.g. 2026 Curriculum Syllabus"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-2 flex items-center">
                                <History className="w-3 h-3 mr-1" />
                                Uploading a document with an identical title will automatically trigger a new version number (e.g. v2.0).
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Description</label>
                            <textarea
                                className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-oxford-accent/20 focus:border-oxford-accent bg-gray-50 focus:bg-white transition-all resize-none"
                                placeholder="Optional meta description for search indexing..."
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Department</label>
                            <select
                                className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-oxford-accent/20 focus:border-oxford-accent bg-gray-50 focus:bg-white transition-all"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value="Academic">Academic</option>
                                <option value="Administration">Administration</option>
                                <option value="Admissions">Admissions</option>
                                <option value="Human Resources">Human Resources</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-oxford-dark mb-2">Select File <span className="text-red-500">*</span></label>
                            <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors group relative cursor-pointer text-center">
                                <input
                                    type="file"
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                />
                                {!file ? (
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-oxford-accent transition-colors mb-2" />
                                        <span className="text-sm font-medium text-oxford-dark">Click to browse or drag and drop</span>
                                        <span className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG, PNG up to 10MB</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <FileType className="w-10 h-10 text-oxford-accent mb-2" />
                                        <span className="text-sm font-semibold text-oxford-dark line-clamp-1 max-w-[250px]">{file.name}</span>
                                        <span className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isUploading}
                                className={`py-3 px-8 bg-oxford-accent text-white font-semibold rounded-lg shadow-md hover:bg-oxford-light transition-all focus:ring-2 focus:ring-offset-2 focus:ring-oxford-accent flex items-center ${isUploading ? 'opacity-75 cursor-not-allowed scale-95' : 'hover:scale-105'}`}
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload to Vault'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
