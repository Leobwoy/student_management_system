export default function DashboardOverview() {
    return (
        <div className="space-y-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-3xl font-bold text-oxford-dark mb-4">Welcome to Oxford Preparatory</h1>
                <p className="text-gray-600 max-w-2xl leading-relaxed">
                    The Student Management System is online. You have securely authenticated and your
                    navigation options have been actively tailored to your administrative role. Please select an option from the sidebar to manage core school logic.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow border-l-4 border-l-oxford-accent">
                    <h3 className="font-semibold text-oxford-dark mb-1">Quick Action</h3>
                    <p className="text-sm text-gray-500">Register new students</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <h3 className="font-semibold text-oxford-dark mb-1">System Status</h3>
                    <p className="text-sm text-gray-500">All services operational</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                    <h3 className="font-semibold text-oxford-dark mb-1">Upcoming Events</h3>
                    <p className="text-sm text-gray-500">Midterms in 2 weeks</p>
                </div>
            </div>

        </div>
    );
}
