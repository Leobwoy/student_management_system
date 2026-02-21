"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Lock, Mail } from "lucide-react";
import { api } from "../../lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", { email, password });

            if (response.data?.access_token) {
                // Securely store the JWT in cookies
                Cookies.set("access_token", response.data.access_token, { expires: 1, secure: true });
                // Redirect to the dashboard
                router.push("/dashboard");
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } } };
            setError(errorObj.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-oxford-blue flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-[1.01]">

                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-oxford-accent rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            OX
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-oxford-dark mb-2">Oxford Prep</h1>
                    <p className="text-gray-500 text-sm">Student Management System</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-oxford-dark mb-2">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-oxford-accent transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-oxford-accent focus:border-oxford-accent sm:text-sm bg-gray-50 focus:bg-white transition-colors"
                                placeholder="developer@oxford.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-oxford-dark mb-2">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-oxford-accent transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-oxford-accent focus:border-oxford-accent sm:text-sm bg-gray-50 focus:bg-white transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-oxford-accent hover:bg-oxford-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-oxford-accent transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

            </div>

            <div className="mt-8 text-oxford-white text-sm opacity-80">
                &copy; 2026 Oxford Preparatory School. All rights reserved.
            </div>
        </div>
    );
}
