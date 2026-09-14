import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

function Submissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { taskId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/tasks/${taskId}/submit`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setSubmissions(Array.isArray(data) ? data : [data]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching submission:", err);
                setError("Failed to load submission data");
                setLoading(false);
            });
    }, [taskId]);

    const handleGrade = async (subId, id) => {
        let input, isValid = false;
        while (!isValid) {
            input = prompt("Enter Grade:");
            if (input === null) return;
            if (input.trim() !== "" && !isNaN(Number(input))) {
                isValid = true;
            } else {
                alert("Please enter a number!");
            }
        }

        try {
            const response = await fetch(`http://localhost:3000/submissions/${subId}/grade`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ grade: Number(input), id: Number(id) })
            });

            if (!response.ok) {
                throw new Error("Failed to add grade");
            }

            setSubmissions(prevSubmissions =>
                prevSubmissions.map(sub =>
                    (sub.id === subId) ? { ...sub, grade: Number(input) } : sub
                )
            );
        } catch (error) {
            console.error(error);
            setError("Failed to add grade");
        }
    }

    if (loading) return <p style={{ padding: '30px' }}>Loading submissions...</p>;
    if (error) return <p style={{ padding: '30px', color: 'red' }}>{error}</p>;

    const ungradedSubmissions = submissions.filter(sub => sub.grade === null || sub.grade === undefined);
    const gradedSubmissions = submissions.filter(sub => sub.grade !== null && sub.grade !== undefined);

    return (
        <div style={{ padding: '30px', maxWidth: '700px', margin: 'auto' }}>
            <Link to={-1}>← Back</Link>
            <h2>Task Submissions</h2>

            {submissions.length === 0 ? (
                <p style={{ color: '#777', marginTop: '20px' }}>No submissions found for this task yet.</p>
            ) : (
                <>
                    <div style={{ marginTop: '20px' }}>
                        <h3>Ungraded Submissions</h3>
                        {ungradedSubmissions.length === 0 ? (
                            <p style={{ color: '#777', marginTop: '10px' }}>No ungraded submissions found.</p>
                        ) : (
                            ungradedSubmissions.map((sub, index) => {
                                const subId = sub.student_id || index;
                                const id = sub.id;
                                const fileUrls = sub.file_url || [];
                                const fileNames = sub.file_name || [];

                                return (
                                    <div
                                        key={index}
                                        style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginTop: '15px', border: '1px solid #ddd' }}
                                    >
                                        <p><strong>Student ID:</strong> {sub.student_id}</p>
                                        <p><strong>Grade:</strong> Not graded yet</p>

                                        <div style={{ margin: '15px 0' }}>
                                            <strong>Description / Text:</strong>
                                            <p style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}>
                                                {sub.submission_text || "No text provided."}
                                            </p>
                                        </div>

                                        <div>
                                            <strong>Attached Files:</strong>
                                            {fileUrls.length > 0 ? (
                                                fileUrls.map((url, fileIndex) => (
                                                    <div key={fileIndex} style={{ marginTop: '8px', marginBottom: '10px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                                                        <p style={{ margin: '0 0 4px 0' }}>📄 {fileNames[fileIndex] || `File ${fileIndex + 1}`}</p>
                                                        <a
                                                            href={`http://localhost:3000${url}`}
                                                            target="_blank"
                                                            style={{ display: "inline-block", color: '#007bff' }}
                                                            rel="noopener noreferrer"
                                                        >
                                                            Download / View File
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ color: '#777', marginTop: '5px' }}>No files attached.</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleGrade(subId, id)}
                                            style={{ marginTop: '10px', padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Add grade
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <h3>Graded Submissions</h3>
                        {gradedSubmissions.length === 0 ? (
                            <p style={{ color: '#777', marginTop: '10px' }}>No graded submissions yet.</p>
                        ) : (
                            gradedSubmissions.map((sub, index) => {
                                const subId = sub.student_id || index;
                                const id = sub.id;

                                const fileUrls = sub.file_url || [];
                                const fileNames = sub.file_name || [];

                                return (
                                    <div
                                        key={index}
                                        style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginTop: '15px', border: '1px solid #ddd' }}
                                    >
                                        <p><strong>Student ID:</strong> {sub.student_id}</p>
                                        <p><strong>Grade:</strong> {sub.grade}</p>

                                        <div style={{ margin: '15px 0' }}>
                                            <strong>Description / Text:</strong>
                                            <p style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}>
                                                {sub.submission_text || "No text provided."}
                                            </p>
                                        </div>

                                        <div>
                                            <strong>Attached Files:</strong>
                                            {fileUrls.length > 0 ? (
                                                fileUrls.map((url, fileIndex) => (
                                                    <div key={fileIndex} style={{ marginTop: '8px', marginBottom: '10px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                                                        <p style={{ margin: '0 0 4px 0' }}>📄 {fileNames[fileIndex] || `File ${fileIndex + 1}`}</p>
                                                        <a
                                                            href={`http://localhost:3000${url}`}
                                                            target="_blank"
                                                            style={{ display: "inline-block", color: '#007bff' }}
                                                            rel="noopener noreferrer"
                                                        >
                                                            Download / View File
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ color: '#777', marginTop: '5px' }}>No files attached.</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleGrade(subId, id)}
                                            style={{ marginTop: '10px', padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Add grade
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Submissions;