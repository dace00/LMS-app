import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import API from '../api_handle/api.jsx';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const authenticate = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/login', {email, password});
            const role = response.data.role;

            if (role === 'admin' || role === 'teacher') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        }
        catch (error) {
            setError(error.response?.data?.error);
        }
    };
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>LMS Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Log In</button>
            </form>
            <p style={{ marginTop: '15px' }}>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    )
}