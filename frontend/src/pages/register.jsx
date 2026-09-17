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
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForms({ ...forms, [e.target.name]: e.target.value });
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await API.post('/register', forms);
            alert("Registered successfully!");
            navigate("/login");
        }
        catch (error) {
            setError(error.response?.data?.error)
        }
    };

    return (
        <div className="flex-1 flex flex-col gap-3  items-center justify-center p-1 bg-zinc-800">
            <h2 className="text-2xl  font-bold !text-[#d4d4d8] text-center mb-1">Register for LMS</h2>
            <div className="form-card max-w-md w-full">
                <p className="text-sm text-zinc-400 text-center mb-6">Create your account to get started</p>

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
                            className="form-input"
                        />
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name"
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            name="index_number"
                            placeholder="Index Number"
                            onChange={handleChange}
                            required
                            className="form-input  col-span-full"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-6 my-1 px-1 text-zinc-300 text-sm">
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
                        <input
                            type="password"
                            name="teacher_pass"
                            placeholder="Enter passcode for teachers"
                            onChange={handleChange}
                            required
                            className="w-[63%] h-[5px] bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2.5 rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition; animate-fadeIn"
                        />
                    )}
                    </div>
                    <button type="submit" className="form-btn mt-2">
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