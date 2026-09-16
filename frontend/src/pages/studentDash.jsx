import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";

function Student_dash() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [files, setFile] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolledId, setEnrolledId] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Unauthorized, please log in");
            return;
        }

        fetch("http://localhost:3000/student-dashboard", {
            headers: {
                'authorization': `Bearer ${token}`
            }
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
            headers: {
                'authorization': `Bearer ${token}`
            }
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
            headers: {
                'authorization': `Bearer ${token}`
            }
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-red-400 font-medium text-lg">{error}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
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
        <div className="p-8 max-w-7xl mx-auto w-full">
            <header className="border-b-2 border-zinc-700 pb-4 mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Student Portal</h1>
                <p className="text-blue-400 text-lg font-medium">{message}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Unenrolled Courses Card */}
                {unenrolledCourses.length > 0 && (
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700 flex flex-col gap-4">
                        <h3 className="text-xl font-semibold text-white">Unenrolled Courses</h3>
                        <div className="flex flex-col gap-3">
                            {unenrolledCourses.map(course => (
                                <div key={course.id} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50">
                                    <span className="text-zinc-300 font-medium">{course.title}</span>
                                    <button
                                        onClick={() => handleEnroll(course.id)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                                    >
                                        Enroll
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enrolled Courses Card */}
                <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700 flex flex-col gap-4">
                    <h3 className="text-xl font-semibold text-white">Enrolled Courses</h3>
                    <div className="flex flex-col gap-2">
                        {courses.map(course => {
                            const isEnrolled = enrolledId.includes(course.id);
                            return (
                                <div key={course.id}>
                                    {isEnrolled && (
                                        <Link
                                            to={`courses/${course.id}`}
                                            className="block p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50 text-zinc-300 hover:text-blue-400 hover:border-blue-500/50 transition font-medium no-underline"
                                        >
                                            {course.title}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pending Tasks Card */}
                <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700 flex flex-col gap-4">
                    <h3 className="text-xl font-semibold text-white">Pending Assignments</h3>
                    {pendingTasks.length === 0 ? (
                        <p className="text-zinc-400 text-sm">No pending tasks right now.</p>
                    ) : (
                        <ul className="flex flex-col gap-3 list-none p-0 m-0">
                            {pendingTasks.map(task => (
                                <li key={task.id} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col gap-1">
                                    <strong className="text-zinc-200">{task.title}</strong>
                                    <p className="text-zinc-400 text-sm m-0">{task.description}</p>
                                    <span className="text-xs text-blue-400 mt-1">Course: {task.course_title}</span>
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