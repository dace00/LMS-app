import {useNavigate} from "react-router-dom";
import {useState} from "react";


function Teacher_dash (req, res, next)  {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        if (file) {
            form.append("course-file", file);
        }
        try {
            const res = await fetch('http://localhost:3000/teacher/courses', {
                method: 'POST',
                body: form,
                headers: {
                    'authentication': `Bearer ${token}`
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
    return (
        <div style={{ padding: '30px', maxWidth: '500px', margin: 'auto' }}>
            <h2>Create a New Course</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
        </div>
    )
}