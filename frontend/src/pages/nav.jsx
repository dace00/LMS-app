import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

function Nav() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [name, setName] = useState({});
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const ref = useRef(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        if (token) {
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
                    } else {
                        setName(data.user);
                    }
                })
                .catch(err => {
                    console.log(err);
                    setError(err.message || "something went wrong");
                });
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event("storage"));
        navigate('/');
    };

    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    return (
        <nav className="w-full grid grid-cols-3 items-center px-8 py-4 border-none shadow-lg sticky top-0 z-50 bg-zinc-800">
            <div className="flex items-center">
                <h3 className="italic text-2xl font-bold no-underline select-none text-emerald-400 cursor-default">
                    LMS
                </h3>
            </div>
            <div className="flex items-center justify-center gap-6">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `no-underline font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
                            isActive
                                ? 'bg-zinc-700 text-emerald-400'
                                : 'text-zinc-300 hover:text-emerald-400 hover:bg-zinc-700/50'
                        }`
                    }
                >
                    Home

                </NavLink>
                {token && ( name.role === 'student' ? (
                    <NavLink
                        to="/student-dashboard"
                        className={({ isActive }) =>
                            `no-underline font-medium px-3 py-2 rounded-lg transition-all duration-300 select-none ${
                                isActive
                                    ? 'bg-zinc-700 text-emerald-400'
                                    : 'text-zinc-300 hover:text-emerald-400 hover:bg-zinc-700/50'
                            }`
                        }
                    >
                        Student Dashboard
                    </NavLink>
                ) : (
                    <NavLink
                        to="/teacher-dashboard"
                        className={({ isActive }) =>
                            `no-underline font-medium px-3 py-2 rounded-lg transition-all duration-300 select-none ${
                                isActive
                                    ? 'bg-zinc-700 text-emerald-400'
                                    : 'text-zinc-300 hover:text-emerald-400 hover:bg-zinc-700/50'
                            }`
                        }
                    >
                        Teacher Dashboard
                    </NavLink>
                ))}


            </div>

            <div className="relative flex justify-end">
                {token ? (
                    <div className=" transition-shadow duration-200 border border-black rounded-full bg-zinc-700 border-emerald-500/50 hover:ring-2 ring-emerald-500/60 overflow-hidden cursor-pointer flex items-center justify-center p-1" ref={ref}>
                        <svg
                            className="w-10 h-10"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className={`bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer transition-all duration-300 overflow-hidden whitespace-nowrap ${
                            isAuthPage
                                ? "opacity-0  pointer-events-none "
                                : "opacity-100 scale-100 w-auto px-4 py-2"
                        }`}
                    >
                        Login
                    </button>
                )}

                {isDropdownOpen && (
                    <div className="absolute right-0 top-14 border-gray-950/50 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden w-40 flex flex-col border border-gray-100 z-50">
                        <button
                            onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                            className="px-4 py-3 border-none bg-transparent text-left cursor-pointer text-sm text-emerald-400 hover:text-emerald-400 hover:font-bold transition"
                        >
                            View Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-3 border-none bg-transparent text-left cursor-pointer text-sm text-red-500 hover:text-red-500 hover:font-bold transition"
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Nav;