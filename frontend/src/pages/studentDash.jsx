import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";

function Student_dash () {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [files, setFile] = useState([]);
    const [enrolledId, setEnrolledId] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Unauthorized, please log in");
            return;
        }

        fetch("http://localhost:3000/student-dashboard", {
            headers: {
                'authorization': `Bearer ${token}`
            }
        })
            .then(res =>  {
                if(!res.ok) throw new Error("Unauthorized or session expired");
                return res.json();
            })
            .then(data => setMessage(data.message))
            .catch(err => {
                console.log(err);
                setError("Unauthorized, please log in");
            });

        fetch("http://localhost:3000/student/courses", {
            headers: {
                'authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load courses");
                return res.json();
            })
            .then(data => {setCourses(data.courses);
                setFile(data.file)
                setEnrolledId(data.enrolledIds || []);} )
            .catch(err => console.error(err));


        fetch("http://localhost:3000/student/pending", {
            headers: {
                'authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load pending tasks");
                return res.json();
            })
            .then(data => setPendingTasks(data))
            .catch(err => console.error("Error fetching pending tasks:", err));

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
        const token = localStorage.getItem('token');

        fetch('http://localhost:3000/student/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ course_id: courseIdToEnroll }),
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized or enroll failed");
                return res.json();
            })
            .then(data => {
                alert(data.message || "Enrolled successfully!");
                setEnrolledId(prev => [...prev, courseIdToEnroll]);
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
                    <h3>Courses</h3>
                    {courses.map(course => {
                        const isEnrolled = enrolledId.includes(course.id)
                        return(
                            <div key={course.id}>
                                {isEnrolled ? (
                                        <Link to={`courses/${course.id}`}>{course.title}</Link>)
                                    : (
                                        <>
                                            <span>{course.title}</span>
                                            <button onClick={() => handleEnroll(course.id)}>Enroll in course</button>
                                        </>
                                    )}
                            </div>
                        );
                    })}
                    {/* <ul>
                        {files.map((file) => (
                            <li key={file.id}>
                                {file.name}{' '}
                                <a
                                    href={`http://localhost:3000${file.file_path}`}
                                    target="_blank"
                                >
                                    Download / View
                                </a>
                            </li>
                        ))}
                    </ul> */}

                </div>

                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Pending assignments</h3>
                    {pendingTasks.length === 0 ? (
                        <p style={{ color: '#666' }}>No pending tasks right now.</p>
                    ) : (
                        <ul style={{ paddingLeft: '20px', margin: '0' }}>
                            {pendingTasks.map(task => (
                                <li key={task.id} style={{ marginBottom: '10px' }}>
                                    <strong>{task.title}</strong>
                                    <p style={{ margin: '3px 0 0 0', color: '#555', fontSize: '0.9rem' }}>{task.description}</p>
                                    <p>from course: {task.course_title}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Student_dash;