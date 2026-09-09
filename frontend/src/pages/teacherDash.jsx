import {Link, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";


function Teacher_dash (req, res, next)  {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [title, setTitle] = useState('');
    const [courses,setCourses] = useState([]);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [viewCourse, setViewCourse] = useState(false);
    const [courseId, setCourseId] = useState("");
    
    useEffect(() => {
        if (!token) {
            setError('Unauthorized, please log in!');
            return;
        }

        const fetchDashboard = async () => {
            try {
                const res = await fetch('http://localhost:3000/teacher-dashboard', {
                    headers: {
                        'authorization': `Bearer ${token}`
                    }
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to load dashboard');
                }

                setMessage(data.message);
            } catch (err) {
                setError(err.message);
            }
        };
        
        const getCourses = async () => {
            try {
                const course = await fetch('http://localhost:3000/student/courses', {
                    headers: {
                        'authorization': `Bearer ${token}`
                    }
                });
                const data = await course.json();
               setCourses(data.courses);
            }
            catch (err) {
                setError(err.message);
            }
        }


        fetchDashboard();
        getCourses();
    }, [token]);

    if (error && !message) {
        return (
            <div style={{ padding: '30px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={() => navigate("/login")}>Login</button>
            </div>
        );
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        if (file) {
            form.append("course-file", file);
        }
        try {
            const res = await fetch('http://localhost:3000/teacher-dashboard', {
                method: 'POST',
                body: form,
                headers: {
                    'authorization': `Bearer ${token}`
                }
            })
            
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong.');
            }
            alert('Course created successfully!');
            navigate('/teacher-dashboard');
        }
        catch (error) {
            console.log('couldn\'t fetch course data')
            setError(error.message);
        }
    }

    const handleRemoval = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        try {
            const res = await fetch(`http://localhost:3000/course-removal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId }) // Sending ID in the body
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete course');
            }

            setCourses(courses.filter(course => course.id !== courseId));
            alert('Course deleted successfully!');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div style={{ padding: '30px', maxWidth: '500px', margin: 'auto' }}>
            <h1>{message}</h1>
            <button onClick={() => setIsEdit(!isEdit) }>{isEdit ? "close creation" : "create new course"}</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {isEdit && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Course Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    style={{ padding: '10px' }}
                />
                <textarea
                    placeholder="Course Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    style={{ padding: '10px', height: '100px' }}
                />
                <input
                    type="file"
                    onChange={e => setFile(e.target.files[0])}
                />
                <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
                    Publish Course
                </button>
            </form>
                )}
            <div>
            <button onClick = {() => setViewCourse(!viewCourse)}>{viewCourse ? "Close list" : "View created courses (by all teachers)"}</button>
            {viewCourse && (
                courses.map(course => (
                        <div key={course.id}>
                            <h3>{course.title}</h3>
                            <button onClick={() => navigate(`courses/modify/${course.id}`)}>Modify course</button>
                            <button onClick={() => handleRemoval(course.id)}>Remove course</button>
                        </div>
                    ))
            )}
        </div>
            
        </div>
    );
}

export default Teacher_dash;
