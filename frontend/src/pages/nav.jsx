import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState, useRef} from "react";

function Nav() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const ref = useRef(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const handleClickOutside = (e) => {
            if(ref.current && !ref.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        }
    })

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #eaeaea',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#007bff' }}>
                    LMS
                </Link>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#555', fontWeight: '500' }}>Home</Link>
                    <Link to="/student-dashboard" style={{ textDecoration: 'none', color: '#555', fontWeight: '500' }}>Student Dashboard</Link>
                </div>
            </div>
            
            <div style={{ position: 'relative' }}>
                
                    {token ? (
                    <div style={{border: '1px solid black', borderRadius:"90%",  background: '#007bff'}} ref={ref}>
                        <svg
                        width="40px"
                        height="40px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>) : (
                        <button onClick={() => navigate('/login')}>Login</button>
                    )}

               
                {isDropdownOpen && (
                    <div style={{
                        position: 'absolute',
                        right: '0',
                        top: '50px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        width: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #eaeaea'
                    }}>
                        <button
                            onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                            style={{ padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}
                            onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                            onMouseOut={(e) => e.target.style.background = 'none'}
                        >
                            View Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{ padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'red', fontSize: '0.9rem' }}
                            onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                            onMouseOut={(e) => e.target.style.background = 'none'}
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