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

    if (loading) return (
        <div className="min-h-screen bg-zinc-900 text-zinc-400 flex items-center justify-center">
            <p>Loading submissions...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-zinc-900 text-red-400 flex items-center justify-center p-8">
            <p className="bg-red-950/40 border border-red-900/50 p-4 rounded-lg">{error}</p>
        </div>
    );

    const ungradedSubmissions = submissions.filter(sub => sub.grade === null || sub.grade === undefined);
    const gradedSubmissions = submissions.filter(sub => sub.grade !== null && sub.grade !== undefined);

    return (
        <div className="min-h-screen bg-zinc-900 p-8 max-w-3xl mx-auto w-full font-sans text-zinc-100">
            <Link to={-1} className="inline-block text-sm text-emerald-400 hover:underline mb-6">← Back</Link>
            <h2 className="text-2xl font-bold text-white mb-6">Task Submissions</h2>

            {submissions.length === 0 ? (
                <p className="text-zinc-400 text-sm italic mt-5">No submissions found for this task yet.</p>
            ) : (
                <div className="space-y-8">
                    {/* Ungraded Submissions */}
                    <div>
                        <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2 mb-4">Ungraded Submissions</h3>
                        {ungradedSubmissions.length === 0 ? (
                            <p className="text-zinc-500 text-xs italic">No ungraded submissions found.</p>
                        ) : (
                            <div className="space-y-4">
                                {ungradedSubmissions.map((sub, index) => {
                                    const subId = sub.student_id || index;
                                    const id = sub.id;
                                    const fileUrls = sub.file_url || [];
                                    const fileNames = sub.file_name || [];

                                    return (
                                        <div
                                            key={index}
                                            className="bg-zinc-800/40 border border-zinc-700/50 p-5 rounded-xl space-y-4"
                                        >
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-300"><strong>Student ID:</strong> {sub.student_id}</span>
                                                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded text-xs">Not graded yet</span>
                                            </div>

                                            <div>
                                                <strong className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Description / Text:</strong>
                                                <p className="whitespace-pre-wrap bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-sm text-zinc-200">
                                                    {sub.submission_text || "No text provided."}
                                                </p>
                                            </div>

                                            <div>
                                                <strong className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">Attached Files:</strong>
                                                {fileUrls.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {fileUrls.map((url, fileIndex) => (
                                                            <div key={fileIndex} className="flex justify-between items-center bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                                                <span className="text-xs text-zinc-300">📄 {fileNames[fileIndex] || `File ${fileIndex + 1}`}</span>
                                                                <a
                                                                    href={`http://localhost:3000${url}`}
                                                                    target="_blank"
                                                                    className="text-xs text-emerald-400 hover:underline font-medium"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Download / View File
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-500 text-xs italic">No files attached.</p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleGrade(subId, id)}
                                                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow"
                                            >
                                                Add grade
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Graded Submissions */}
                    <div>
                        <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2 mb-4">Graded Submissions</h3>
                        {gradedSubmissions.length === 0 ? (
                            <p className="text-zinc-500 text-xs italic">No graded submissions yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {gradedSubmissions.map((sub, index) => {
                                    const subId = sub.student_id || index;
                                    const id = sub.id;
                                    const fileUrls = sub.file_url || [];
                                    const fileNames = sub.file_name || [];

                                    return (
                                        <div
                                            key={index}
                                            className="bg-zinc-800/40 border border-zinc-700/50 p-5 rounded-xl space-y-4"
                                        >
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-300"><strong>Student ID:</strong> {sub.student_id}</span>
                                                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-xs font-semibold">Grade: {sub.grade}</span>
                                            </div>

                                            <div>
                                                <strong className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Description / Text:</strong>
                                                <p className="whitespace-pre-wrap bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-sm text-zinc-200">
                                                    {sub.submission_text || "No text provided."}
                                                </p>
                                            </div>

                                            <div>
                                                <strong className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">Attached Files:</strong>
                                                {fileUrls.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {fileUrls.map((url, fileIndex) => (
                                                            <div key={fileIndex} className="flex justify-between items-center bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                                                <span className="text-xs text-zinc-300">📄 {fileNames[fileIndex] || `File ${fileIndex + 1}`}</span>
                                                                <a
                                                                    href={`http://localhost:3000${url}`}
                                                                    target="_blank"
                                                                    className="text-xs text-emerald-400 hover:underline font-medium"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Download / View File
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-500 text-xs italic">No files attached.</p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleGrade(subId, id)}
                                                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow"
                                            >
                                                Update Grade
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Submissions;