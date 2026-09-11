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
        while(!isValid) {
            input = prompt("Enter Grade:");
            if(input === null) return;
            if(input.trim() !== "" && !isNaN(Number(input))) {
                isValid = true;
            }
            else {
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
        }
        catch (error) {
            console.error(error);
            setError("Failed to add grade");
        }
    }

    if (loading) return <p style={{ padding: '30px' }}>Loading submissions...</p>;
    if (error) return <p style={{ padding: '30px', color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '700px', margin: 'auto' }}>
            <Link to={-1}>← Back</Link>
            <h2>Task Submissions</h2>

            {submissions.length === 0 ? (
                <p style={{ color: '#777', marginTop: '20px' }}>No submissions found for this task yet.</p>
            ) : (
                submissions.map((sub, index) => {
                    const subId = sub.student_id || index;
                    const id = sub.id;
                    return (
                        <div
                            key={index}
                            style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '1px solid #ddd' }}
                        >
                            <p><strong>Student ID:</strong> {sub.student_id}</p>
                            <p><strong>Grade:</strong> {sub.grade !== null && sub.grade !== undefined ? sub.grade : 'Not graded yet'}</p>

                            <div style={{ margin: '15px 0' }}>
                                <strong>Description / Text:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}>
                                    {sub.submission_text || sub.description || "No text provided."}
                                </p>
                            </div>

                            <div>
                                <strong>Attached File:</strong>
                                {sub.file_url ? (
                                    <a
                                        href={`http://localhost:3000${sub.file_url}`}
                                        target="_blank"
                                        style={{display: "block"}}
                                        rel="noopener noreferrer"
                                    >
                                        Download / View File
                                    </a>
                                ) : (
                                    <p style={{ color: '#777', marginTop: '5px' }}>No file attached.</p>
                                )}
                                <button
                                    onClick={() => handleGrade(subId, id)}
                                    style={{ marginTop: '10px', padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Add grade
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Submissions;