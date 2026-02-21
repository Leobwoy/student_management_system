import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 bg-oxford-blue/5">
            <Sidebar />
            <div className="flex flex-col md:ml-64 min-h-screen">
                <Navbar />
                <main className="flex-1 p-6 lg:p-10 overflow-x-hidden relative z-0">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
