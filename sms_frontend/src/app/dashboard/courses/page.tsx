"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/auth";
import { BookOpen, Plus, Hash, Layers } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [credits, setCredits] = useState<number | "">("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get<Course[]>("/courses");
        setCourses(res.data);
      } catch {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || credits === "") return;

    setCreating(true);
    setError("");
    try {
      const res = await api.post<Course>("/courses", {
        name,
        code,
        credits: Number(credits),
      });
      setCourses((prev) => [res.data, ...prev]);
      setName("");
      setCode("");
      setCredits("");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
          "Failed to create course. Check your permissions."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-oxford-dark flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-oxford-accent" />
            Course Registry
          </h1>
          <p className="text-gray-600 mt-1 pl-11 text-sm">
            Define the master course catalogue powering enrollment, attendance
            and grade capture.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-oxford-dark text-lg">
              Registered Courses
            </h2>
            <span className="text-xs text-gray-400">{courses.length} total</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 animate-pulse">
              Loading courses...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm">{error}</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm bg-gray-50">
              No courses defined yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Code</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-oxford-dark">
                        {course.code}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{course.name}</td>
                      <td className="px-6 py-3 text-gray-500">
                        {course.credits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Course */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="font-semibold text-lg text-oxford-dark flex items-center mb-2">
            <Plus className="w-5 h-5 mr-2 text-oxford-accent" />
            New Course Blueprint
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Provision a new course for the timetable. This immediately becomes
            available for enrollment, attendance and grading.
          </p>

          {error && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-oxford-dark mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-gray-400" />
                Course Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-oxford-accent focus:border-oxford-accent"
                placeholder="e.g. MTH101"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-oxford-dark mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-gray-400" />
                Course Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-oxford-accent focus:border-oxford-accent"
                placeholder="e.g. Algebra I"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-oxford-dark mb-1">
                Credits
              </label>
              <input
                type="number"
                min={1}
                required
                value={credits}
                onChange={(e) =>
                  setCredits(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-oxford-accent focus:border-oxford-accent"
                placeholder="e.g. 3"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className={`mt-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-oxford-accent hover:bg-oxford-light shadow-sm transition-colors ${
                creating ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {creating ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

