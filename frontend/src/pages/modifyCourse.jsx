import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";

function ModifyCourse() {
    const [course, setCourse] = useState({ title: '', description: '' });
    const [sections, setSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [pendingFile, setPendingFile] = useState(null);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editingSectionTitle, setEditingSectionTitle] = useState('');
    const [tasks, setTasks] = useState([]);
    const [titleTask, setTitleTask] = useState('');
    const [descTask, setDescTask] = useState('');
    const [dueDateTask, setDueDateTask] = useState('');
    const [taskFiles, setTaskFiles] = useState([]);
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
                setSections(data.sections || []);
                if (data.tasks) {
                    setTasks(data.tasks);
                }
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
        setPendingFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", course.title);
        formData.append("description", course.description);

        if (selectedSectionId) {
            formData.append("section_id", selectedSectionId);
        }
        if (newSectionTitle) {
            formData.append("section_title", newSectionTitle);
        }

        if (pendingFile) {
            formData.append("course-files", pendingFile);
        }

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

    const handleUpdateSectionName = async (sectionId) => {
        if (!editingSectionTitle.trim()) return;

        try {
            const res = await fetch(`http://localhost:3000/teacher/sections/${sectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title: editingSectionTitle })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update section name');
            }

            setSections(sections.map(sec => sec.id === sectionId ? { ...sec, title: data.title } : sec));
            setEditingSectionId(null);
            setEditingSectionTitle('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm("Are you sure you want to clear/delete this section? All files inside it may be affected.")) return;

        try {
            const res = await fetch(`http://localhost:3000/teacher/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete section');
            }

            setSections(sections.filter(sec => sec.id !== sectionId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTask = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('titleTask', titleTask);
        formData.append('descTask', descTask);
        formData.append('dueDateTask', dueDateTask);
        taskFiles.forEach((file) => {
            formData.append('taskFiles', file);
        });

        try {
            const res = await fetch(`http://localhost:3000/courses/modify/${id}/tasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            })
            const newTask = await res.json();
            if (!res.ok) {
                throw new Error(newTask.error || 'Failed to add task');
            }
            setTasks(prev => [...prev, newTask]);
            setTitleTask('');
            setDescTask('');
            setDueDateTask('');
            setTaskFiles(null);
            alert('Task added successfully!');
        }
        catch(err) {
            setError(err.message);
        }
    }

    const handleRemoval = async (fileId) => {
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

            setSections(prevSections =>
                prevSections.map(sec => ({
                    ...sec,
                    files: sec.files.filter(file => file.id !== fileId)
                }))
            );
            alert('File deleted successfully!');
        }
        catch (error) {
            setError(error.message);
        }
    };

    if (!course) return <p>Loading course details...</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto' }}>
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
                    <h4>Manage Sections:</h4>
                    {sections.length === 0 ? (
                        <p style={{ color: '#777' }}>No sections created yet.</p>
                    ) : (
                        sections.map(section => (
                            <div key={section.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px', background: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    {editingSectionId === section.id ? (
                                        <div style={{ display: 'flex', gap: '5px', flex: 1, marginRight: '10px' }}>
                                            <input
                                                type="text"
                                                value={editingSectionTitle}
                                                onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                style={{ padding: '4px', flex: 1 }}
                                            />
                                            <button type="button" onClick={() => handleUpdateSectionName(section.id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>Save</button>
                                            <button type="button" onClick={() => setEditingSectionId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <strong>{section.title}</strong>
                                            <button
                                                type="button"
                                                onClick={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }}
                                                style={{ background: '#ffc107', border: 'none', padding: '3px 6px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                                            >
                                                Modify Name
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSection(section.id)}
                                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                                    >
                                        Clear Section
                                    </button>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {section.files.length === 0 ? (
                                        <li style={{ color: '#777', fontSize: '13px' }}>No files in this section.</li>
                                    ) : (
                                        section.files.map((file) => (
                                            <li key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <a href={`http://localhost:3000${file.file_path}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px' }}>
                                                    {file.name || 'Course Document'}
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoval(file.id)}
                                                    style={{ background: '#e03043', color: 'white', border: 'none', padding: '2px 6px', cursor: 'pointer', borderRadius: '4px', fontSize: '11px' }}
                                                >
                                                    Remove file
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ border: '1px dashed #ccc', padding: '15px', borderRadius: '4px' }}>
                    <h4>Add New File / Section</h4>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                        Select Existing Section:
                        <select
                            value={selectedSectionId}
                            onChange={(e) => { setSelectedSectionId(e.target.value); setNewSectionTitle(''); }}
                            style={{ display: 'block', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                        >
                            <option value="">-- Choose Section --</option>
                            {sections.map(sec => (
                                <option key={sec.id} value={sec.id}>{sec.title}</option>
                            ))}
                        </select>
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                        Or Create New Section Title:
                        <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => { setNewSectionTitle(e.target.value); setSelectedSectionId(''); }}
                            placeholder="e.g. Week 2 Materials"
                            style={{ display: 'block', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                        />
                    </label>
                    <label>
                        Upload File:
                        <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'block', marginTop: '5px' }} />
                    </label>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                    <h3>Course Tasks & Submissions</h3>
                    {tasks.length === 0 ? (
                        <p style={{ color: '#777' }}>No tasks created yet.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {tasks.map((task) => (
                                <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
                                    <div>
                                        <strong>{task.title}</strong>
                                        <p style={{ fontSize: '12px', color: '#555', margin: '4px 0 0 0' }}>
                                            Due: {task.due_date ? new Date(task.due_date).toLocaleString() : 'No due date'}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/tasks/${task.id}/submissions`}
                                        style={{ padding: '6px 12px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}
                                    >
                                        View Submissions
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <h3>Create new task</h3>
                    <label>
                        Title:
                        <input type="text" value={titleTask} onChange={e => setTitleTask(e.target.value)} style={{ display: 'block', padding: '8px', width: '100%', boxSizing: 'border-box', marginBottom: '10px' }} />
                    </label>
                    <label>
                        Description:
                        <textarea name="task-desc" value={descTask} onChange={e => setDescTask(e.target.value)} style={{ display: 'block', padding: '8px', width: '100%', boxSizing: 'border-box', marginBottom: '10px' }} />
                    </label>
                    <label>
                        Due date:
                        <input type="datetime-local" value={dueDateTask} onChange={e => setDueDateTask(e.target.value)} style={{ display: 'block', padding: '8px', width: '100%', boxSizing: 'border-box', marginBottom: '10px' }} />
                    </label>
                    <label>
                        Task File:
                        <input type="file" multiple onChange={e => setTaskFiles(Array.from(e.target.files))} style={{ display: 'block', marginBottom: '10px' }} />
                    </label>
                    <button type="button" onClick={(e) => handleTask(e)} style={{ padding: '8px 12px', background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Add new task</button>
                </div>

                <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                    Save Changes
                </button>
                <button type="button" onClick={() => navigate('/teacher-dashboard')} style={{ padding: '10px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
            </form>
        </div>
    );
}

export default ModifyCourse;