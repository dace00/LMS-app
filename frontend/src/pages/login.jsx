import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.userId);
                console.log("Token saved successfully:", data.token);

                navigate('/');
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Something went wrong");
        }
    };

    return (
        <div className="max-w-md mx-auto my-16 p-8 border border-none rounded-xl shadow-lg">
            <h2 className="text-2xl  mb-6 text-center !text-[#d4d4d8]">LMS Login</h2>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <form onSubmit={handleLogin} className="flex flex-col gap-4 form-card">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                />
                <button
                    type="submit"
                    className="form-btn"
                >
                    Log In
                </button>
            </form>

            <p className="mt-6 text-sm text-center text-zinc-400">
                Don't have an account? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Register</Link>
            </p>
        </div>
    );
}

export default Login;