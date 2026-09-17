import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";

function Student_dash() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [files, setFile] = useState([]);
    const [enrolledId, setEnrolledId] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Unauthorized, please log in");
            return;
        }

        fetch("http://localhost:3000/student-dashboard", {
            headers: { 'authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized or session expired");
                return res.json();
            })
            .then(data => setMessage(data.message))
            .catch(err => {
                console.log(err);
                setError("Unauthorized, please log in");
            });

        fetch("http://localhost:3000/student/courses", {
            headers: { 'authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load courses");
                return res.json();
            })
            .then(data => {
                setCourses(data.courses);
                setFile(data.file);
                setEnrolledId(data.enrolledIds || []);
            })
            .catch(err => console.error(err));

        fetch("http://localhost:3000/student/pending", {
            headers: { 'authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load pending tasks");
                return res.json();
            })
            .then(data => setPendingTasks(data))
            .catch(err => console.error("Error fetching pending tasks:", err));

    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans bg-zinc-900 text-zinc-100">
                <p className="text-red-400 font-medium text-lg">{error}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition cursor-pointer"
                >
                    Log in
                </button>
            </div>
        );
    }

    const handleEnroll = (courseIdToEnroll) => {
        const token = localStorage.getItem('token');

        fetch('http://localhost:3000/student/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ course_id: courseIdToEnroll }),
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized or enroll failed");
                return res.json();
            })
            .then(data => {
                alert(data.message || "Enrolled successfully!");
                setEnrolledId(prev => [...prev, courseIdToEnroll]);
            })
            .catch(err => {
                console.error("Error enrolling:", err);
                navigate('/login');
            });
    };

    const unenrolledCourses = courses.filter(course => !enrolledId.includes(course.id));

    return (
        <div className="min-h-screen bg-zinc-900 p-8 max-w-7xl mx-auto w-full font-sans text-zinc-100 flex flex-col items-center">
            <header className="border-b-2 border-zinc-700 pb-4 mb-8 w-full max-w-5xl">
                <h1 className="text-3xl font-bold text-white mb-2 inline-flex cursor-default group hover:animate-pulse">
                    {"Student Portal".split("").map((char, index) => (
                        <span
                            key={index}
                            className="transition-colors duration-300 group-hover:text-emerald-400"
                            style={{ transitionDelay: `${index * 40}ms` }}
                        >
            {char === " " ? "\u00A0" : char}
        </span>
                    ))}
                </h1>
                {/* <p className="text-emerald-400 text-lg font-medium">{message}</p> */}
            </header>

            <div className={`grid grid-cols-1 ${unenrolledCourses.length > 0 ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 max-w-3xl'} gap-6 my-12 w-full`}>

                {unenrolledCourses.length > 0 && (
                    <div className="feature-card flex flex-col gap-4">
                        <h3 className="feature-title">Unenrolled Courses</h3>
                        <div className="flex flex-col gap-3">
                            {unenrolledCourses.map(course => (
                                <div key={course.id} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg
                                border border-zinc-700/50">
                                    <span className="text-zinc-300 font-medium">{course.title}</span>
                                    <button
                                        onClick={() => handleEnroll(course.id)}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg
                                        transition cursor-pointer"
                                    >
                                        Enroll
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="feature-card flex flex-col gap-4">
                    <h3 className="feature-title">Enrolled Courses</h3>
                    <div className="flex flex-col gap-2">
                        {courses.map(course => {
                            const isEnrolled = enrolledId.includes(course.id);
                            return (
                                <div key={course.id}>
                                    {isEnrolled && (
                                        <Link
                                            to={`courses/${course.id}`}
                                            className="block p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/50 transition font-medium no-underline"
                                        >
                                            {course.title}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="feature-card flex flex-col gap-4">
                    <h3 className="feature-title">Pending Assignments</h3>
                    {pendingTasks.length === 0 ? (
                        <p className="feature-desc">No pending tasks right now.</p>
                    ) : (
                        <ul className="flex flex-col gap-3 list-none p-0 m-0">
                            {pendingTasks.map(task => (
                                <li key={task.id} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col gap-1">
                                    <strong className="text-zinc-200">Title: {task.title}</strong>
                                    <p className="feature-desc m-0">Description: {task.description}</p>
                                    <span className="text-xs text-emerald-400 mt-1">Course: {task.course_title}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Student_dash;