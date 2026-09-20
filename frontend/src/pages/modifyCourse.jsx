import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link} from "react-router-dom";

function ModifyCourse() {
    const [course, setCourse] = useState({ title: '', description: '' });
    const [sections, setSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [pendingFile, setPendingFile] = useState([]);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editingSectionTitle, setEditingSectionTitle] = useState('');
    const [tasks, setTasks] = useState([]);
    const [titleTask, setTitleTask] = useState('');
    const [descTask, setDescTask] = useState('');
    const [dueDateTask, setDueDateTask] = useState('');
    const [taskFiles, setTaskFiles] = useState([]);
    const [error, setError] = useState('');
    const [fileInputKey, setFileInputKey] = useState(0);
    const { id } = useParams();
    const backup = useRef(null);
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
        const file = Array.from(e.target.files);
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

        if(pendingFile.length > 0) {
        pendingFile.forEach((file) => {
            formData.append("course-files", file);
        });
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
    
    const handleAddSection = async () => {
        if (!newSectionTitle.trim() && !selectedSectionId) {
            setError('Enter a new section title or select an existing section.');
            return;
        }
        if (!newSectionTitle.trim() && pendingFile.length === 0) {
            setError('Choose a file to upload to the selected section.');
            return;
        }

        const formData = new FormData();
        if (newSectionTitle.trim()) {
            formData.append('section_title', newSectionTitle.trim());
        } else {
            formData.append('section_id', selectedSectionId);
        }
        if (pendingFile.length > 0) {
           pendingFile.forEach((file) => {
               formData.append("course-files", file);
           })
        }

        try {
            const res = await fetch(`http://localhost:3000/student/courses/${id}/sections`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to add section');
            }

            const updated = data.section;
            setSections(prev =>
                prev.some(s => s.id === updated.id)
                    ? prev.map(s => s.id === updated.id
                        ? { ...s, files: [...(s.files || []), ...updated.files] }
                        : s)
                    : [...prev, updated]
            );

            setNewSectionTitle('');
            setSelectedSectionId('');
            setPendingFile([]);
            setFileInputKey(k => k + 1); // clears the file input
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateSectionName = async (sectionId) => {
        if (!editingSectionTitle.trim()) return;

        try {
            const res = await fetch(`http://localhost:3000/teacher/sections/${sectionId}`, {
                method: 'PUT',
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

        if (!backup.current.reportValidity()) return;

        const formData = new FormData();
        formData.append('titleTask', titleTask);
        formData.append('descTask', descTask);
        formData.append('dueDateTask', dueDateTask);
        if (taskFiles) {
            taskFiles.forEach((file) => {
                formData.append('taskFiles', file);
            });
        }

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
            setTaskFiles([]);
            alert('Task added successfully!');
        }
        catch(err) {
            setError(err.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete task');
            }

            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            alert('Task deleted successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

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

    if (!course) return (
        <div className="min-h-screen bg-zinc-900 text-zinc-400 flex items-center justify-center">
            <p>Loading course details...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-900 p-8 max-w-3xl mx-auto w-full font-sans text-zinc-100">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer mb-3"
            >
                ← Back
            </button>
            <h2 className="text-2xl font-bold text-white ">Modify Course</h2>
            {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 p-3 rounded-lg mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6 mt-7">
                <div className="flex flex-col main-div gap-4">
                    <h3 className="text-lg font-semibold text-white ">General Information</h3>
                    <div className="flex flex-col gap-1">
                        <label className="block text-xs text-left pl-2 uppercase tracking-wider text-gray-400 font-semibold mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={course.title || ''}
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 min-h-0 text-sm bg-zinc-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none hover:border-gray-700 focus:border-2 focus:border-gray-700 transition-all duration-100"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="block text-left pl-2 text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Description</label>
                        <textarea
                            name="description"
                            value={course.description || ''}
                            onChange={handleChange}
                            required
                            className="w-full min-h-[100px] inner-div-form p-3 text-sm rounded-lg text-gray-100 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="main-div p-5 rounded-xl space-y-4">
                    <h4 className="text-lg font-semibold text-white">Manage Sections</h4>
                    {sections.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">No sections created yet.</p>
                    ) : (
                        sections.map(section => (
                            <div key={section.id} className="inner-div p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    {editingSectionId === section.id ? (
                                        <div className="flex gap-2 flex-1 mr-4">
                                            <input
                                                type="text"
                                                value={editingSectionTitle}
                                                onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                className="text-gray-300 transition-colors bg-gray-950/50 border-gray-800/60 border hover:border-emerald-500/30
                                                rounded-xl px-2 focus:border-emerald-500/30 focus:border-2 focus:outline-none "
                                            />
                                            <button type="button" onClick={() => handleUpdateSectionName(section.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded transition-colors cursor-pointer">
                                                Save
                                            </button>
                                            <button type="button" onClick={() => setEditingSectionId(null)} className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-3 py-1.5 rounded transition-colors cursor-pointer">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 items-center">
                                            <strong className="text-white text-sm">{section.title}</strong>
                                            <button
                                                type="button"
                                                onClick={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }}
                                                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                                            >
                                                Modify Name
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                                    >
                                        Clear Section
                                    </button>
                                </div>
                                <ul className="space-y-2 pt-2 border-t border-zinc-800">
                                    {section.files.length === 0 ? (
                                        <li className="text-gray-500 text-xs italic">No files in this section.</li>
                                    ) : (
                                        section.files.map((file) => (
                                            <li key={file.id} className="flex justify-between items-center gap-3 inner-inner-div p-2 rounded-xl border ">
                                                <a href={`http://localhost:3000${file.file_path}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-gray-300 hover:text-emerald-300 transition-colors">
                                                    {file.name || 'Course Document'}
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoval(file.id)}
                                                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 text-[11px] px-2 py-1 rounded transition-colors cursor-pointer"
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


                <div className="main-div p-5 rounded-xl space-y-4">
                    <h4 className="text-lg font-semibold text-white">Add New File / Section</h4>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Select Existing Section</label>
                        <select
                            value={selectedSectionId}
                            onChange={(e) => { setSelectedSectionId(e.target.value); setNewSectionTitle(''); }}
                            className="w-full p-2.5 text-sm bg-zinc-900 border border-gray-800 hover:border-gray-700 cursor-pointer rounded-xl focus:outline-none transition-all duration-200"
                        >
                            <option value="">-- Choose Section --</option>
                            {sections.map(sec => (
                                <option key={sec.id} value={sec.id}>{sec.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Or Create New Section Title</label>
                        <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => { setNewSectionTitle(e.target.value); setSelectedSectionId(''); }}
                            placeholder="e.g. Week 2 Materials"
                            className="w-full mt-1 p-3 text-sm bg-zinc-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none hover:border-gray-700 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-all duration-100"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Upload File</label>
                        <input
                            key={fileInputKey}
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:cursor-pointer file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                        />
                    </div>


                    <button
                        type="button"
                        onClick={handleAddSection}
                        className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                    >
                        Add Section / Upload File
                    </button>
                </div>


                <div className="pt-4 border-t border-zinc-700/50 space-y-4">
                    <div className="main-div space-y-3">
                        <h3 className="text-xl font-semibold text-white">Course Tasks & Submissions</h3>
                        {tasks.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No tasks created yet.</p>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="inner-div p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <strong className="text-white text-sm">{task.title}</strong>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Due: {task.due_date ? new Date(task.due_date).toLocaleString() : 'No due date'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Link
                                            to={`/tasks/${task.id}/submissions`}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow"
                                        >
                                            View Submissions
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-zinc-800/60 p-6 max-w-md mx-auto border border-zinc-700/50 hover:border-emerald-500/30 transition-all hover:-translate-y-1 duration-200 rounded-xl space-y-4">
                    <h3 className="text-lg font-semibold text-white">Create New Task</h3>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Title</label>
                        <input
                            type="text"
                            value={titleTask}
                            onChange={e => setTitleTask(e.target.value)}
                            className="inner-div-form"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Description</label>
                        <textarea
                            name="task-desc"
                            value={descTask}
                            onChange={e => setDescTask(e.target.value)}
                            className="inner-div-form"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Due Date</label>
                        <input
                            type="datetime-local"
                            ref={backup}
                            required
                            value={dueDateTask}
                            onChange={e => setDueDateTask(e.target.value)}
                            className="inner-div-form"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Task File</label>
                        <input
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={e => setTaskFiles(Array.from(e.target.files))}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:cursor-pointer file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={(e) => handleTask(e)}
                        className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                    >
                        Add New Task
                    </button>
                </div>

                <div className="flex flex-col items-center gap-3 pt-4">
                    <button
                        type="submit"
                        className="w-full py-2.5 px-4 max-w-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors shadow-md cursor-pointer"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/teacher-dashboard')}
                        className="py-2.5 px-2 w-full max-w-md bg-zinc-700 hover:bg-zinc-600 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ModifyCourse;