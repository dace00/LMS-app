import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }

        fetch(`http://localhost:3000/userName`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if(data.error) {
                    setError(data.error);
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                }
                else {
                    setName(data.user);
                }
            })
            .catch(err => {console.log(err);
                setError(err.message || "something went wrong");
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #eaeaea' }}>
                <h2 style={{ margin: 0, color: '#333' }}>Welcome to the LMS platform!</h2>
                <div>
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            style={{ padding: '8px 16px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Log out
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link to="/login" style={{ padding: '8px 16px', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Log in</Link>
                        </div>
                    )}
                </div>
            </header>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
                {isLoggedIn ? (
                    <div>
                        <h1 className="bg-orange-500 text-white" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Welcome Back {name.first_name}</h1>
                        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>.</p>
                        {name.role === 'teacher' ? (<Link
                            to="/teacher-dashboard"
                            style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' }}
                        >
                            Go to teacher Dashboard &rarr;
                        </Link>) : (
                            <Link to="/student-dashboard"  style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' }}>
                                Go to student dashboard &rarr;
                            </Link>
                        )}
                    </div>
                ) : (
                    <div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '15px', color: '#222' }}>Manage teacher-student work</h1>
                        <div>
                            <h4>About this app</h4>
                        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', marginBottom: '30px', lineHeight: '1.5' }}>
                           This LMS (Learning Management System) app is an all-in-one platform where students can view assignments, upload their work securely, and track grades in real time - while teachers
                            manage tasks and review submissions in one place.
                        </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <Link
                                to="/login"
                                style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' }}
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