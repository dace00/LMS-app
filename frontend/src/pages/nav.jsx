import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

function Nav() {
    const [role, setRole] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken('');
        setRole('');
        navigate('/');
    };
    useEffect(() => {
        const Token = localStorage.getItem('token');
        const Role = localStorage.getItem('role');
        if (Token) {
            setToken(Token);
        }
        if (Role) {
            setRole(Role);
        }
    }, []);

    return (
        <nav className="navbar">
            <button id="home" onClick={() => navigate('/')}>Home</button>
            {!token && (
                <button id="login" onClick={() => navigate('/login')}>Login</button>
            )}
            {token && role === 'teacher' && (
                <button id="teacher" onClick={() => navigate('/teacher-dashboard')}>View teacher-dash</button>
            )}
            {token && role === 'student' && (
                <button id="student" onClick={() => navigate('/student-dashboard')}>view student-dash</button>
            )}
            {token && (<button onClick={() => handleLogout() }>Log out</button>)}
        </nav>
    );
}

export default Nav;