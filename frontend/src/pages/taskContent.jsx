import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function TaskContent() {
    const [task, setTask] = useState(null);
    const [error, setError] = useState('');
    const [fileSubmit, setFileSubmit] = useState([]);
    const [descSubmit, setDescSubmit] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitRes, setSubmitRes] = useState(null);
    const { taskId } = useParams();

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const taskRes = await fetch(`http://localhost:3000/tasks/${taskId}`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
                });
                const taskData = await taskRes.json();
                if (taskData.error) {
                    setError(taskData.error);
                } else {
                    setTask(taskData);
                }

                const subRes = await fetch(`http://localhost:3000/tasks/${taskId}/submitRes`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
                });

                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData && !subData.error) {
                        setSubmitRes(subData);
                        setDescSubmit(subData.submission_text || "");
                        setIsSubmitted(true);
                    }
                }
            } catch (err) {
                console.error("Error fetching task details:", err);
            }
        };

        fetchTaskData();
    }, [taskId]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newFileEntries = files.map(singleFile => ({
            id: `temp_${Date.now()}_${Math.random()}`,
            name: singleFile.name,
            fileObj: singleFile
        }));

        setFileSubmit(prev => [...prev, ...newFileEntries]);
    };

    const handleRemoveFile = (id) => {
        setFileSubmit(prev => prev.filter(file => file.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('descSubmit', descSubmit);
        fileSubmit.forEach(file => {
            if (file.fileObj) {
                formData.append('subm-files', file.fileObj);
            }
        });

        try {
            const response = await fetch(`http://localhost:3000/tasks/${taskId}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const res = await response.json();
            if (!response.ok) {
                throw new Error(res.error || "something went wrong");
            }
            alert("Successfully submitted work!");

            // Reload to pull fresh submission response data with file arrays
            window.location.reload();
        }
        catch (err) {
            setError(err.message);
        }
    };

    if (error) return <p style={{ color: 'red', padding: '30px' }}>{error}</p>;
    if (!task) return <p style={{ padding: '30px' }}>Loading task details...</p>;

    return (
        <>
            <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto' }}>
                <Link to={-1}>← Back</Link>
                <h1>{task.title}</h1>
                <p style={{ margin: '20px 0', whiteSpace: 'pre-wrap' }}>{task.description}</p>

                {/* Helpful files list (Supports multiple files from teacher) */}
                <div style={{ margin: '15px 0' }}>
                    <p><strong>Helpful files:</strong></p>
                    {task.file_path && task.file_path.length > 0 ? (
                        task.file_path.map((path, index) => (
                            <div
                                key={index}
                                style={{ marginTop: '8px', background: '#f9f9f9', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <a
                                    href={`http://localhost:3000${path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#007bff' }}
                                >
                                    📄 {task.file_name?.[index] || `File ${index + 1}`}
                                </a>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#777', fontSize: '0.9rem', marginTop: '5px' }}>No helpful files attached.</p>
                    )}
                </div>

                <p style={{ marginTop: '15px' }}><strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}</p>
            </div>

            <div style={{ padding: '0 30px 30px 30px', maxWidth: '600px', margin: 'auto' }}>
                {!isSubmitted ? (
                    <>
                        <h3>Submit your work: </h3>
                        <form onSubmit={handleSubmit}>
                            <label style={{ display: 'block', marginBottom: '15px' }}>
                                Description
                                <textarea
                                    name="description"
                                    value={descSubmit}
                                    onChange={(e) => setDescSubmit(e.target.value)}
                                    style={{ display: 'block', width: '100%', marginTop: '5px', minHeight: '80px', padding: '8px' }}
                                />
                            </label>

                            <label style={{ display: 'block', marginBottom: '10px' }}>
                                Attach Files
                                <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'block', marginTop: '5px' }}
                                />
                            </label>

                            {/* Preview selected files before upload */}
                            {fileSubmit.length > 0 && (
                                <div style={{ marginBottom: '15px' }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Selected Files ({fileSubmit.length}):</p>
                                    {fileSubmit.map((file) => (
                                        <div
                                            key={file.id}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f1f1', padding: '8px 12px', borderRadius: '4px', marginTop: '5px' }}
                                        >
                                            <span>📄 {file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(file.id)}
                                                style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Submit work
                            </button>
                        </form>
                    </>
                ) : (
                    <div>
                        <h3>Submission successful</h3>
                        <p>Your submission info:</p>
                        {submitRes && (
                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px' }}>
                                <p><strong>Student ID:</strong> {submitRes.student_id}</p>
                                <p><strong>Description:</strong> {submitRes.submission_text || "No text provided."}</p>

                                <div style={{ margin: '15px 0' }}>
                                    <strong>Your Attached Files:</strong>
                                    {submitRes.file_url && submitRes.file_url.length > 0 ? (
                                        submitRes.file_url.map((url, index) => (
                                            <div
                                                key={index}
                                                style={{ marginTop: '8px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <p style={{ margin: '0 0 4px 0' }}>📄 {submitRes.file_name?.[index] || `File ${index + 1}`}</p>
                                                <a
                                                    href={`http://localhost:3000${url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#007bff' }}
                                                >
                                                    Download / View File
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#777', fontSize: '0.9rem' }}>No files attached.</p>
                                    )}
                                </div>

                                {submitRes.grade !== null && submitRes.grade !== undefined ? (
                                    <p>Your grade: <strong>{submitRes.grade}</strong></p>
                                ) : (
                                    <div style={{ marginTop: '15px' }}>
                                        <p>Your grade: <span style={{ opacity: "0.8" }}>not yet published</span></p>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            style={{ padding: '6px 12px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Edit submission
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default TaskContent;