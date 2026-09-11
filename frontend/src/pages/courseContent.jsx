import {useState, useEffect} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';

function CourseContent() {
    const [error, setError] = useState("");
    const [course, setCourse] = useState([]);
    const [files, setFiles] = useState([]);
    const [tasks, setTasks] = useState([]);
    const {id} = useParams();
    useEffect(() => {
        fetch(`http://localhost:3000/student/courses/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setCourse(data.course);
                setFiles(data.files || []);
            })
            .catch(err => console.error("Error fetching course content:", err));

        fetch(`http://localhost:3000/courses/${id}/tasks`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setTasks(data || []);
            })
            .catch(err => console.error("Error fetching tasks:", err));
    }, [id]);

    if (!course) return <p>Loading course details...</p>;

    return (
        <>
            <Link to="/student-dashboard">← Back to Dashboard</Link>
            <div>
                <h1>{course.title}</h1>
                <p>{course.description}</p>

                <h2>Course Materials</h2>
                <ul>
                    {files.map((file) => (
                        <li key={file.id}>
                            <a href={`http://localhost:3000${file.file_path}`} target="_blank" rel="noopener noreferrer">
                                {file.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Tasks</h3>
                {tasks.length === 0 ? (
                    <p>No tasks available.</p>
                ) : (
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id} style={{ marginBottom: '15px' }}>
                                <Link to={`./task/${task.id}`}>{task.title}</Link>

                                <small>Due: {new Date(task.due_date).toLocaleString()}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

export default CourseContent;