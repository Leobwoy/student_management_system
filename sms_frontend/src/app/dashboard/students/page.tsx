"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/auth";
import { Users, Plus, Search } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classGroup?: {
    name: string;
  } | null;
  createdAt?: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get<Student[]>("/students");
        setStudents(res.data);
      } catch {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dateOfBirth) return;

    setCreating(true);
    setError("");
    try {
      const res = await api.post<Student>("/students", {
        firstName,
        lastName,
        dateOfBirth,
      });
      setStudents((prev) => [res.data, ...prev]);
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
          "Failed to create student. Check your permissions."
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = `${s.firstName ?? ""} ${s.lastName ?? ""}`.toLowerCase();
    return search ? term.includes(search.toLowerCase()) : true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-oxford-dark flex items-center">
            <Users className="w-8 h-8 mr-3 text-oxford-accent" />
            Student Roster
          </h1>
          <p className="text-gray-600 mt-1 pl-11 text-sm">
            Browse and onboard students into the academic graph. Click a row to
            open the Student Profile 360 view.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-oxford-accent focus:border-oxford-accent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-oxford-dark text-lg">
              Active Students
            </h2>
            <span className="text-xs text-gray-400">{students.length} total</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 animate-pulse">
              Loading roster...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm bg-gray-50">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Class</th>
                    <th className="px-6 py-3 text-left hidden md:table-cell">
                      DOB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/dashboard/students/${student.id}`)
                      }
                    >
                      <td className="px-6 py-3 font-medium text-oxford-dark">
                        {student.lastName}, {student.firstName}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {student.classGroup?.name ?? "Unassigned"}
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {student.dateOfBirth
                          ? new Date(student.dateOfBirth).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Student */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="font-semibold text-lg text-oxford-dark flex items-center mb-2">
            <Plus className="w-5 h-5 mr-2 text-oxford-accent" />
            Quick Enroll
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a minimal student record with core identity details. Advanced
            attributes can be attached later.
          </p>

          {error && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-oxford-dark mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-oxford-accent focus:border-oxford-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-oxford-dark mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-oxford-accent focus:border-oxford-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-oxford-dark mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-oxford-accent focus:border-oxford-accent"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className={`mt-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-oxford-accent hover:bg-oxford-light shadow-sm transition-colors ${
                creating ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {creating ? "Creating..." : "Create Student"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

