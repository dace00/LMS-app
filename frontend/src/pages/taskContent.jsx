import {useState, useEffect} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';

function TaskContent() {
    const [task, setTask] = useState(null);
    const [error, setError] = useState('');
    const [fileTasks, setFileTasks] = useState([]);
    const [fileSubmit, setFileSubmit] = useState([]);
    const [descSubmit, setDescSubmit] = useState("");
    const { taskId } = useParams();

    useEffect(() => {
        fetch(`http://localhost:3000/tasks/${taskId}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setTask(data);
                }
            })
            .catch(err => console.error("Error fetching task details:", err));
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
     })

    try {
        const data = await fetch(`http://localhost:3000/tasks/${taskId}/submit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        const res = await data.json();
        if(!data.ok) {
            throw new Error (res.error || "something went wrong");
        }
        alert("successfully submitted work!")
    }
     catch(err) {
         setError(err.message);
     }
}

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!task) return <p>Loading task details...</p>;

    return (
        <>
        <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto' }}>
            <Link to={-1}>← Back</Link>
            <h1>{task.title}</h1>
            <p style={{ margin: '20px 0', whiteSpace: 'pre-wrap' }}>{task.description}</p>
            <p>Helpful files: </p>
            <a href={`http://localhost:3000${task.file_path}`}>{task.file_name}</a>
            <p><strong>Due Date:</strong> {new Date(task.due_date).toLocaleString()}</p>
        </div>
            <div>
                <h3>Submit your work: </h3>
                <form onSubmit={handleSubmit}>
                    <label>
                        Description
                        <textarea name="description" onChange={(e) => setDescSubmit(e.target.value)} />
                    </label>
                    <input type="file" multiple onChange={(e) => handleFileChange(e)} />
                    <button type="submit">Submit work</button>
                </form>
            </div>
        </>
    );
}

export default TaskContent;