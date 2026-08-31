import {useState, useEffect} from 'react';
import {useNavigate} from "react-router-dom";


function Student_dash () {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetch("http://localhost:3000/student-dashboard", {
            credentials: 'include'
        })
            .then(res =>  {
                if(!res.ok) {
                    throw new Error("Unauthorized or session expired");
            }
                return res.json();
            })
            .then (data => setMessage(data.message))
            .catch(err => {
                console.log(err);
                setError("Unauthorized, please log in");
            })

        fetch("http://localhost:3000/student/courses", { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load courses");
                return res.json();
            })
            .then(data => setCourses(data))
            .catch(err => console.error(err));

    }, []);
    
    if(error) {
        return (
        <div>
            <p style={{color:'red'}}>{error}</p>
            <button onClick={() => navigate('/login')}>Log in</button>
        </div>
        );
    }
    const handleEnroll = (courseIdToEnroll) => {
        fetch('http://localhost:3000/student/courses', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_id: courseIdToEnroll })  // back to courseId
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Unauthorized or enroll failed");
                }
                return res.json();          // <-- this was missing before
            })
            .then(data => {
                alert(data.message);
            })
            .catch(err => {
                console.error("Error enrolling:", err);
                navigate('/login');
            });
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '10px', marginBottom: '20px' }}>
                <h1>Student Portal</h1>
                <p style={{ color: '#007bff', fontSize: '1.1rem' }}>{message}</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Enrolled Courses</h3>
                        {courses.map(course => (
                            <div key={course.id}>
                                <p>{course.title}</p>
                                <p>{course.instructor}</p>
                            </div>
                        ))}
                   <button onClick={() => handleEnroll(1)}>Enroll a course</button>
                </div>

                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Assignments & Projects</h3>
                    <p style={{ color: '#666' }}>No pending tasks right now.</p>
                </div>
            </div>
        </div>
    );
}

export default Student_dash;