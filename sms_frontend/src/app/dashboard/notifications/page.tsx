"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import {
    Bell, AlertCircle, MessageSquare, Send, CheckCircle
} from "lucide-react";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "ANNOUNCEMENT" | "ALERT";
    isGlobal: boolean;
    createdAt: string;
}

export default function NotificationsHub() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Admin Announcement State
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementMessage, setAnnouncementMessage] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [publishFeedback, setPublishFeedback] = useState({ text: "", type: "" });

    // Support Ticket Form State
    const [supportIssue, setSupportIssue] = useState("");
    const [submittingTicket, setSubmittingTicket] = useState(false);
    const [ticketFeedback, setTicketFeedback] = useState({ text: "", type: "" });

    useEffect(() => {
        const token = Cookies.get("access_token");
        if (token) {
            try {
                const decoded = jwtDecode<{ role: string }>(token);
                setUserRole(decoded.role);
            } catch (e) {
                console.error("Invalid token decoding.");
            }
        }
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get("/notifications");
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGlobalAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementTitle || !announcementMessage) return;

        setPublishing(true);
        setPublishFeedback({ text: "", type: "" });

        try {
            await api.post("/notifications/announcement", {
                title: announcementTitle,
                message: announcementMessage
            });
            setPublishFeedback({ text: "Global announcement correctly broadcasted.", type: "success" });
            setAnnouncementTitle("");
            setAnnouncementMessage("");
            fetchNotifications();
        } catch (err) {
            setPublishFeedback({ text: "Failed to broadcast announcement.", type: "error" });
        } finally {
            setPublishing(false);
        }
    };

    const handleSupportTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supportIssue) return;

        setSubmittingTicket(true);
        setTicketFeedback({ text: "", type: "" });

        // Mock functionality for Support Tickets
        setTimeout(() => {
            setTicketFeedback({ text: "Support Ticket #3094 submitted properly to Admins.", type: "success" });
            setSupportIssue("");
            setSubmittingTicket(false);
        }, 1000);
    };

    const isAdmin = userRole === "ADMIN";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row gap-6">

                {/* Inbox Column */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[80vh]">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-oxford-dark flex items-center">
                            <Bell className="w-6 h-6 mr-3 text-oxford-accent" />
                            Notification Inbox
                        </h1>
                        <span className="text-sm text-gray-400">
                            {loading ? "Syncing..." : `${notifications.length} Messages`}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {loading ? (
                            <div className="space-y-3 p-4 opacity-50">
                                <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: '100ms' }}></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="space-y-2 p-2">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="p-4 rounded-lg bg-white border border-gray-100 hover:border-oxford-accent/30 hover:shadow-sm transition-all group">
                                        <div className="flex items-start">
                                            <div className="mt-1 mr-4 rounded-full p-2 bg-blue-50 text-oxford-accent border border-blue-100">
                                                {notif.type === 'ANNOUNCEMENT' ? <Bell className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-oxford-dark group-hover:text-oxford-accent transition-colors">
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-xs font-medium text-gray-400">
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                {notif.isGlobal && (
                                                    <span className="inline-block mt-3 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded uppercase tracking-widest">
                                                        School-Wide Broadcast
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Bell className="w-12 h-12 mb-4 opacity-20" />
                                <p>No notifications materialized for your profile.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Support & Admin Actions Column */}
                <div className="w-full md:w-80 lg:w-96 flex flex-col gap-6">

                    {/* Admin Publish Component */}
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-sm border border-oxford-accent/20 p-6">
                            <h2 className="text-lg font-bold text-oxford-dark mb-4 flex items-center">
                                <Send className="w-5 h-5 mr-2 text-oxford-accent" />
                                Global Broadcast
                            </h2>

                            {publishFeedback.text && (
                                <div className={`mb-4 p-3 rounded text-sm ${publishFeedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                    {publishFeedback.text}
                                </div>
                            )}

                            <form onSubmit={handleGlobalAnnouncement} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Announcement Headline"
                                        value={announcementTitle}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        className="w-full border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        required
                                        placeholder="Broadcast message to all roles..."
                                        rows={4}
                                        value={announcementMessage}
                                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                                        className="w-full border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={publishing}
                                    className="w-full py-2 bg-oxford-dark text-white text-sm font-semibold rounded-lg hover:bg-oxford-light transition-colors"
                                >
                                    {publishing ? 'Broadcasting...' : 'Publish Announcement'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* User Support Ticket Component */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-oxford-dark mb-4 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-oxford-light" />
                            IT Support Ticket
                        </h2>

                        {ticketFeedback.text && (
                            <div className={`mb-4 p-3 flex items-center rounded text-sm bg-blue-50 text-blue-800 border border-blue-100`}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {ticketFeedback.text}
                            </div>
                        )}

                        <form onSubmit={handleSupportTicket} className="space-y-4">
                            <textarea
                                required
                                placeholder="Describe your system issue or module malfunction..."
                                rows={5}
                                value={supportIssue}
                                onChange={(e) => setSupportIssue(e.target.value)}
                                className="w-full border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-oxford-accent focus:border-oxford-accent resize-none bg-gray-50"
                            />
                            <button
                                type="submit"
                                disabled={submittingTicket}
                                className="w-full py-2.5 border-2 border-oxford-accent text-oxford-accent bg-transparent text-sm font-semibold rounded-lg hover:bg-oxford-accent hover:text-white transition-colors"
                            >
                                {submittingTicket ? 'Submitting...' : 'Submit Support Request'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
