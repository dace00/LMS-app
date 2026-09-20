import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api_handle/api.jsx';

function Register() {
    const [forms, setForms] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        index_number: "",
        role: "student",
        teacher_pass: ""
    });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showTeacherPass, setShowTeacherPass] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForms({ ...forms, [e.target.name]: e.target.value });
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // teachers don't have an index number, so it isn't sent for them
            const { index_number, ...teacherForms } = forms;
            const payload = forms.role === "teacher" ? teacherForms : forms;

            await API.post('/register', payload);
            alert("Registered successfully!");
            navigate("/login");
        }
        catch (error) {
            setError(error.response?.data?.error)
        }
    };

    return (
        <div className="flex-1 flex flex-col gap-3 mt-7  items-center justify-center p-1">
            <div className="main-div flex flex-col gap-3 max-w-md w-full">
                <h2 className="text-2xl  font-bold !text-[#d4d4d8] text-center mb-1">Register for LMS</h2>
                {error && (
                    <p className="text-red-400 text-sm mb-4 text-center bg-red-950/50 border border-red-800/50 py-2 rounded-lg">
                        {error}
                    </p>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            onChange={handleChange}
                            required
                            className="text-gray-300 px-3 transition-colors bg-gray-950/50
                    border-gray-800/60 hover:border-emerald-500/30 border
                     focus:border-2 focus:outline-none focus:border-emerald-500/30
                      rounded-xl"
                        />
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name"
                            onChange={handleChange}
                            required
                            className="text-gray-300 px-3 transition-colors bg-gray-950/50
                    border-gray-800/60 hover:border-emerald-500/30 border
                     focus:border-2 focus:outline-none focus:border-emerald-500/30
                      rounded-xl"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            required
                            className="text-gray-300 px-3 transition-colors bg-gray-950/50
                    border-gray-800/60 hover:border-emerald-500/30 border
                     focus:border-2 focus:outline-none focus:border-emerald-500/30
                      rounded-xl"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                required
                                className="text-gray-300 pl-3 pr-14 w-full h-full transition-colors bg-gray-950/50
                    border-gray-800/60 hover:border-emerald-500/30 border
                     focus:border-2 focus:outline-none focus:border-emerald-500/30
                      rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {forms.role === "student" && (
                            <input
                                type="text"
                                name="index_number"
                                placeholder="Index Number"
                                value={forms.index_number}
                                onChange={handleChange}
                                required
                                className="text-gray-300 px-3 transition-colors bg-gray-950/50
                    border-gray-800/60 hover:border-emerald-500/30 border
                     focus:border-2 focus:outline-none focus:border-emerald-500/30
                      rounded-xl  col-span-full"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-6  px-1 text-zinc-300 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="student"
                                checked={forms.role === "student"}
                                onChange={handleChange}
                                className="accent-emerald-500"
                            /> Student
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="teacher"
                                checked={forms.role === "teacher"}
                                onChange={handleChange}
                                className="accent-emerald-500"
                            /> Teacher
                        </label>
                    </div>
                    <div className="flex items-center justify-center">
                        {forms.role === "teacher" && (
                            <div className="relative w-57">
                                <input
                                    type={showTeacherPass ? "text" : "password"}
                                    name="teacher_pass"
                                    placeholder="Enter passcode for teachers"
                                    onChange={handleChange}
                                    required
                                    className="text-gray-300 pl-3 pr-14 text-center transition-colors bg-gray-950/50
                    border-gray-800/60 hover:border-emerald-500/30 border w-full h-7
                     focus:border-2 focus:outline-none focus:border-emerald-500/30
                      rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowTeacherPass(prev => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                >
                                    {showTeacherPass ? "Hide" : "Show"}
                                </button>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="form-btn">
                        Register
                    </button>
                </form>

                <p className="mt-6 text-sm text-center text-zinc-400">
                    Already have an account? <Link to="/login" className="text-emerald-500 font-semibold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
