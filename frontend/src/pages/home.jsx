import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            setIsLoggedIn(true);

            fetch(`http://localhost:3000/userName`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        setError(data.error);
                        localStorage.removeItem('token');
                        setIsLoggedIn(false);
                    } else {
                        setName(data.user);
                    }
                })
                .catch(err => {
                    console.log(err);
                    setError(err.message || "something went wrong");
                });
        } else {
            setIsLoggedIn(false);
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-zinc-900 flex flex-col font-sans">

            <header className="flex items-start justify-center px-10 py-5 bg-zinc-800 shadow-md border-b border-zinc-700/50">
                <h2 className="mt-5 text-xl font-bold text-center text-emerald-500">Welcome to the LMS platform!</h2>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-10 py-10">
                {isLoggedIn ? (
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-extrabold mb-4 text-zinc-100">
                            Welcome Back, <span className="text-emerald-400">{name.first_name || "User"}</span>
                        </h1>
                        <p className="text-zinc-400 text-lg mb-6">
                            You're successfully logged into your account, take a look at your available features below
                            <br />
                            <span className="inline-block text-3xl animate-bounce text-emerald-400">↓</span>
                        </p>


                        <div className=" mx-auto flex flex-col justify-center items-center gap-7">
                            {name.role === 'teacher' ? (
                                <>
                        <div className="bg-zinc-800/60 p-4 w-64  rounded-xl border border-zinc-700/50 shadow-lg flex flex-col items-center justify-center text-center gap-4 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-200">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                                📖
                            </div>
                            <h3 className="text-emerald-400 font-semibold text-lg pb-2 border-b border-zinc-emerald-400 w-full">Teacher features</h3>
                            <ul className="flex flex-col gap-2 inner-div rounded-xl p-3">

                                <li className="border border-transparent border-b-gray-700 py-2">Create courses and modify them</li>
                                <li className="border border-transparent border-b-gray-700 py-2">Add new tasks or remove current tasks (from created courses)</li>
                                <li>View and grade task submissions from students</li>
                            </ul>

                        </div>
                                <Link
                                    to="/teacher-dashboard"
                                    className="px-18 py-3 bg-emerald-600  hover:bg-emerald-500 text-white font-semibold rounded-lg transition no-underline shadow-lg"
                                >
                                    Go to Teacher Dashboard &rarr;
                                </Link>
                        </>
                            ) : (
                                <>
                                <div className="bg-zinc-800/60 p-4 w-64  rounded-xl border border-zinc-700/50 shadow-lg flex flex-col items-center justify-center text-center gap-4 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-200">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                                        📖
                                    </div>
                                    <h3 className="text-emerald-400 font-semibold text-lg pb-2 border-b border-emerald-400 w-full">Student features</h3>
                                    <ul className="flex flex-col gap-2 inner-div rounded-xl p-3">
                                        <li className="border border-transparent border-b-gray-700 py-2">View courses and their content</li>
                                        <li className="border border-transparent border-gray-700 py-2">View tasks and its content</li>
                                        <li>Add and modify submissions for tasks before they're graded</li>
                                    </ul>
                                </div>
                                <Link
                                    to="/student-dashboard"
                                    className="px-18 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition no-underline shadow-lg"
                                >
                                    Go to Student Dashboard &rarr;
                                </Link>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl flex flex-col items-center ">
                        <h1 className="text-5xl font-extrabold mb-6 text-zinc-100  tracking-tight">
                            Manage teacher-student work seamlessly.
                        </h1>
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-emerald-400 mb-2">About this app</h4>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                This LMS (Learning Management System) app is an all-in-one platform where students can view assignments, upload their work securely, and track grades in real time—while teachers manage tasks and review submissions in one place.
                            </p>
                        </div>
                        <div className="mt-5 mb-3">
                            <h4 className="text-lg font-semibold text-emerald-400 mb-5">Available features</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl w-full text-center">
                                <div className="bg-zinc-800/60 p-6 rounded-xl border border-zinc-700/50">
                                    <h3 className="text-emerald-400 font-semibold text-lg mb-2 border-b-1">Secure Submissions</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        Students can easily upload assignments with validation, supporting pdf formats directly to their portal.
                                    </p>
                                </div>
                                <div className="bg-zinc-800/60 p-6 rounded-xl border border-zinc-700/50">
                                    <h3 className="text-emerald-400 font-semibold text-lg mb-2 border-b-1">Real-Time <br/> Tracking</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        Instant grade visibility and submission status updates so students never have to guess where they stand.
                                    </p>
                                </div>
                                <div className="bg-zinc-800/60 p-6 rounded-xl border border-zinc-700/50">
                                    <h3 className="text-emerald-400 font-semibold text-lg mb-2 border-b-1">Streamlined Grading</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        Teachers can review incoming student work, post grades, and manage tasks efficiently from a unified dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition no-underline shadow-lg"
                            >
                                Let's get started by logging in first
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;
