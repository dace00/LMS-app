import {useState, useEffect} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';

function CourseContent() {
    const [error, setError] = useState("");
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [tasks, setTasks] = useState([]);
    const {id} = useParams();

    useEffect(() => {
        // Single fetch now pulls course details, sections (with files), and tasks
        fetch(`http://localhost:3000/student/courses/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setCourse(data.course);
                setSections(data.sections || []);
                setTasks(data.tasks || []);
            })
            .catch(err => console.error("Error fetching course content:", err));
    }, [id]);

    if (!course) return <p>Loading course details...</p>;

    return (
        <>
            <Link to="/student-dashboard">← Back to Dashboard</Link>
            <div>
                <h1>{course.title}</h1>
                <p>{course.description}</p>

                <h2>Course Materials</h2>
                {sections.length === 0 ? (
                    <p>No sections available for this course yet.</p>
                ) : (
                    sections.map((section) => (
                        <div key={section.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                            <h3>{section.title}</h3>
                            {section.files.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: '#666' }}>No files uploaded in this section.</p>
                            ) : (
                                <ul>
                                    {section.files.map((file) => (
                                        <li key={file.id}>
                                            <a href={`http://localhost:3000${file.file_path}`} target="_blank" rel="noopener noreferrer">
                                                {file.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))
                )}
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
                                <br />
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