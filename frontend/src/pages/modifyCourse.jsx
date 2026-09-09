import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

function ModifyCourse() {
    const [course, setCourse] = useState({ title: '', description: '' });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/student/courses/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.course) {
                    setCourse(data.course);
                }
                setFiles(data.files || []);
            })
            .catch(err => console.error("Error fetching course content:", err));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourse(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const newFileEntry = {
            id: `temp_${Date.now()}`,
            name: file.name,
            fileObj: file
        };

        setFiles(prev => [...prev, newFileEntry]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("courseId", id);
        formData.append("title", course.title);
        formData.append("description", course.description);

        files.forEach((file) => {
            if (file.fileObj) {
                formData.append("course-files", file.fileObj);
            }
        });

        try {
            const res = await fetch(`http://localhost:3000/student/courses/modify/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update course');
            }

            alert('Course updated successfully!');
            navigate('/teacher-dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoval = async (fileId) => {
        if (typeof fileId === 'string' && fileId.startsWith('temp_')) {
            setFiles(files.filter(file => file.id !== fileId));
            return;
        }

        if (!window.confirm("Are you sure you want to delete this file?")) return;

        try {
            const res = await fetch(`http://localhost:3000/student/courses/files/${fileId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to remove file');
            }

            setFiles(files.filter(file => file.id !== fileId));
            alert('File deleted successfully!');
        }
        catch (error) {
            setError(error.message);
        }
    };

    if (!course) return <p>Loading course details...</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '500px', margin: 'auto' }}>
            <h2>Modify Course</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label>
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={course.title || ''}
                        onChange={handleChange}
                        required
                        style={{ display: 'block', padding: '10px', width: '100%', boxSizing: 'border-box' }}
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        name="description"
                        value={course.description || ''}
                        onChange={handleChange}
                        required
                        style={{ display: 'block', padding: '10px', height: '100px', width: '100%', boxSizing: 'border-box' }}
                    />
                </label>
                <div>
                    <h4>Attached Files:</h4>
                    {files.length === 0 ? (
                        <p style={{ color: '#777' }}>No files attached.</p>
                    ) : (
                        <ul>
                            {files.map((file) => (
                                <li key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <a href={`http://localhost:3000${file.file_path}`} target="_blank" rel="noopener noreferrer">
                                        {file.name || 'Course Document'}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoval(file.id)}
                                        style={{ background: '#e03043', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        Remove file
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <input type="file" onChange={handleFileChange} />
                </div>
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Save Changes
                </button>
                <button type="button" onClick={() => navigate('/teacher-dashboard')}>Cancel</button>
            </form>
        </div>
    );
}

export default ModifyCourse;