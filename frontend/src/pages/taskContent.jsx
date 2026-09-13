import {useState, useEffect} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('descSubmit', descSubmit);
        fileSubmit.forEach(file => {
            if(file.fileObj) {
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
            if(!response.ok) {
                throw new Error (res.error || "something went wrong");
            }
            alert("Successfully submitted work!");
            setSubmitRes(res);
            setDescSubmit(res.submission_text || descSubmit);
            setIsSubmitted(true);
        }
        catch(err) {
            setError(err.message);
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!task) return <p>Loading task details...</p>;

    return (
        <>
            <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto' }}>
                <Link to={-1}>← Back</Link>
                <h1>{task.title}</h1>
                <p style={{ margin: '20px 0', whiteSpace: 'pre-wrap' }}>{task.description}</p>
                <p>Helpful files: </p>
                {task.file_path && <a href={`http://localhost:3000${task.file_path}`}>{task.file_name}</a>}
                <p><strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}</p>
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
                                    style={{ display: 'block', width: '100%', marginTop: '5px', minHeight: '80px' }}
                                />
                            </label>
                            {submitRes && submitRes.file_name && (
                                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '5px' }}>
                                    Previously uploaded file: <strong>{submitRes.file_name}</strong>
                                </p>
                            )}
                            <input type="file" multiple onChange={(e) => handleFileChange(e)} style={{ display: 'block', marginBottom: '15px' }} />
                            <button type="submit">Submit work</button>
                        </form>
                    </>
                ) : (
                    <div>
                        <h3>Submission successful</h3>
                        <p>Your submit info:</p>
                        {submitRes && (
                            <>
                                <p>Your ID: {submitRes.student_id}</p>
                                <p>Your description: {submitRes.submission_text}</p>
                                {submitRes.file_name && <p>Your file: {submitRes.file_name}</p>}
                                {submitRes.grade !== null && submitRes.grade !== undefined ? (
                                    <p>Your grade: <strong>{submitRes.grade}</strong></p>
                                ) : (
                                    <>
                                        <p>Your grade: <span style={{opacity: "0.8"}}>not yet published</span></p>
                                        <button onClick={() => setIsSubmitted(false)}>Edit submission</button>
                                    </>
                                )}

                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default TaskContent;