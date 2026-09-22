import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Teacher_dash() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [title, setTitle] = useState('');
    const [courses, setCourses] = useState([]);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [viewCourse, setViewCourse] = useState(false);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);

    // Custom dropdown states
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("Select option...");

    useEffect(() => {
        if (!token) {
            setError('Unauthorized, please log in!');
            return;
        }

        const fetchDashboard = async () => {
            try {
                const res = await fetch('http://localhost:3000/teacher-dashboard', {
                    headers: { 'authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to load dashboard');
                setMessage(data.message);
            } catch (err) {
                setError(err.message);
            }
        };

        const getCourses = async () => {
            try {
                const course = await fetch('http://localhost:3000/student/courses', {
                    headers: { 'authorization': `Bearer ${token}` }
                });
                const data = await course.json();
                setCourses(data.courses);
            } catch (err) {
                setError(err.message);
            }
        };

        const getUngraded = async () => {
            try {
                const res = await fetch('http://localhost:3000/teacher/ungraded', {
                    headers: { 'authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setUngradedSubmissions(data);
            } catch (err) {
                console.error("Error fetching ungraded submissions:", err);
            }
        };

        fetchDashboard();
        getCourses();
        getUngraded();
    }, [token]);

    if (error && !message) {
        return (
            <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center p-8">
                <div className="text-center space-y-4 bg-red-950/40 border border-red-900/50 p-6 rounded-xl max-w-sm">
                    <p className="text-lg">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        if (file.length !== 0) {
            file.forEach(fil => form.append("course-file", fil));
        }
        try {
            const res = await fetch('http://localhost:3000/teacher-dashboard', {
                method: 'POST',
                body: form,
                headers: { 'authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong.');
            alert('Course created successfully!');
            navigate('/teacher-dashboard');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRemoval = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        try {
            const res = await fetch(`http://localhost:3000/course-removal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete course');

            setCourses(courses.filter(course => course.id !== courseId));
            alert('Course deleted successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 p-8 max-w-7xl mx-auto w-full font-sans text-zinc-100 flex flex-col items-center">
            <header className="border-b-2 border-zinc-700 pb-4 mb-8 w-full max-w-5xl">
                <h1 className="text-3xl font-bold text-white mb-2 inline-flex cursor-default group hover:animate-pulse">
                    {"Teacher Portal".split("").map((char, index) => (
                        <span
                            key={index}
                            className="transition-colors duration-300 group-hover:text-emerald-400"
                            style={{ transitionDelay: `${index * 40}ms` }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                </h1>
            </header>

            <div className="bg-zinc-800/60 p-6 rounded-xl border border-zinc-700/50
             hover:border-emerald-500/30 transition-all hover:-translate-y-1 duration-200 space-y-4 w-full max-w-md">
                {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 p-3 rounded-lg">{error}</p>}

                <div className="flex flex-col items-center gap-2 pt-2">
                    <label className="text-zinc-300 text-sm font-medium text-center">
                        Select option to create or view course/s
                    </label>

                    {/* Custom Dropdown Container */}
                    <div className="relative w-full mt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full bg-zinc-900 border border-gray-800 rounded-2xl p-3 text-zinc-100 text-sm font-medium shadow-md flex justify-between items-center transition-all hover:border-gray-700 cursor-pointer"
                        >
                            <span>{selectedLabel}</span>
                            <svg
                                className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        <div className={`absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl overflow-hidden z-20 transition-all duration-300 ease-in-out origin-top ${
                            isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}>
                            <div
                                onClick={() => {
                                    setSelectedLabel("None");
                                    setIsEdit(false);
                                    setViewCourse(false);
                                    setIsOpen(false);
                                }}
                                className="p-3 text-zinc-400 border-0 border-b border-white text-sm text-center
                                cursor-pointer transition-colors hover:text-emerald-300"
                            >
                                None
                            </div>
                            <div
                                onClick={() => {
                                    setSelectedLabel("Create new course");
                                    setIsEdit(true);
                                    setViewCourse(false);
                                    setIsOpen(false);
                                }}
                                className="p-3 text-zinc-400 border-0 border-b border-white text-sm text-center
                                cursor-pointer transition-colors hover:text-emerald-300"
                            >
                                Create new course
                            </div>
                            <div
                                onClick={() => {
                                    setSelectedLabel("View courses");
                                    setViewCourse(true);
                                    setIsEdit(false);
                                    setIsOpen(false);
                                }}
                                className="p-3 text-zinc-400 text-sm text-center
                                cursor-pointer transition-colors hover:text-emerald-300"
                            >
                                View courses
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Form Section */}
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isEdit ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-zinc-700/50 mt-4">
                            <h3 className="text-lg font-semibold text-white">Create New Course</h3>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Course Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter course title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    className="w-full mt-1 min-h-[90px] p-3 text-sm bg-zinc-900 border
                                     border-gray-800 rounded-lg text-gray-100 focus:outline-none
                                     hover:border-gray-700 focus:border-2 focus:border-gray-700
                                     transition-all duration-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Course Description</label>
                                <textarea
                                    placeholder="Enter course description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                    className="w-full mt-1 min-h-[90px] p-7 text-sm bg-zinc-900 border
                                     border-gray-800 rounded-lg text-gray-100 focus:outline-none
                                     hover:border-gray-700 focus:border-2 focus:border-gray-700
                                     transition-all duration-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Attach PDF Files</label>
                                <input
                                    type="file"
                                    accept='.pdf'
                                    multiple
                                    onChange={e => setFile(Array.from(e.target.files))}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:cursor-pointer file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors shadow-md cursor-pointer"
                            >
                                Publish Course
                            </button>
                        </form>
                    </div>
                </div>

                {/* View Courses Section */}
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${viewCourse ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                        <div className="space-y-3 pt-4 border-t border-zinc-700/50 mt-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Created Courses</h3>
                            {courses.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No courses found.</p>
                            ) : (
                                courses.map(course => (
                                    <div key={course.id} className="inner-div p-4 rounded-lg flex items-center justify-between gap-4">
                                        <h4 className="text-sm font-medium text-gray-200">{course.title}</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`courses/modify/${course.id}`)}
                                                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white border border-amber-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                            >
                                                Modify
                                            </button>
                                            <button
                                                onClick={() => handleRemoval(course.id)}
                                                className="py-1.5 px-3 bg-red-500/25 hover:bg-red-500/35 text-red-400 border border-red-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submissions Awaiting Grading */}
            <div className={`bg-zinc-800/60 p-6 rounded-xl border w-[auto] border-zinc-700/50 hover:border-emerald-500/30 
            transition-all duration-200 space-y-4 w-lg grid grid-cols-[auto] items-center justify-center max-w-5xl mt-6 ${!isOpen ? 'hover:-translate-y-1' : ''}`}>
                <h3 className="text-lg course-title">Submissions Awaiting Grading</h3>
                {ungradedSubmissions.length === 0 ? (
                    <p className="inner-div text-sm p-3 rounded-lg">
                        ✅ Everything is fully graded!
                    </p>
                ) : (
                    <div className="grid grid-cols-2 space-y-3">
                        {ungradedSubmissions.map(sub => (
                            <div key={sub.submission_id} className=" inner-div p-2 m-2  rounded-lg flex flex-col [&:nth-child(odd):last-child]:col-span-2
                            [&:nth-child(odd):last-child]:justify-self-center [&:nth-child(odd):last-child]:w-1/2 gap-3 space-y-3">
                                <p className="text-xs text-gray-200 ">
                                    <strong className="text-white">{sub.first_name}</strong> ({sub.email}) submitted for <em className="text-emerald-400">{sub.task_title}</em> in <strong className="text-gray-300">{sub.course_title}</strong>
                                </p>
                                <p className="text-xs p-1 text-gray-300  transition-colors bg-gray-950/50 border rounded-xl border-gray-800/60 hover:border-emerald-500/30">
                                    <span className="font-semibold text-gray-300">Description: <br/> </span> {sub.submission_text || "No text provided."}
                                </p>
                                <button
                                    onClick={() => navigate(`/tasks/${sub.task_id}/submissions`)}
                                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shadow cursor-pointer"
                                >
                                    Grade Work
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Teacher_dash;