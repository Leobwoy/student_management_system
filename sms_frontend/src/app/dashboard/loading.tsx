import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-oxford-light/30 rounded-full animate-pulse"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-oxford-accent rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-oxford-dark flex items-center">
                Restricting Access
                <span className="flex space-x-1 ml-2">
                    <span className="w-1.5 h-1.5 bg-oxford-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-oxford-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-oxford-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm text-center">
                Establishing secure relay to Oxford Prep databases. Applying robust Role-Based Access Controls...
            </p>

            {/* Generic Skeleton Table Mockup */}
            <div className="mt-12 w-full max-w-4xl opacity-50">
                <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-6 animate-pulse"></div>
                <div className="space-y-4">
                    <div className="h-16 bg-gray-100 rounded-lg w-full animate-pulse"></div>
                    <div className="h-16 bg-gray-100 rounded-lg w-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                    <div className="h-16 bg-gray-100 rounded-lg w-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                </div>
            </div>
        </div>
    );
}
