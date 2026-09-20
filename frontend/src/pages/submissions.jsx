import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

function Submissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { taskId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/tasks/${taskId}/submit`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
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
                console.error("Error fetching submissions:", err);
                setError('Failed to load submission data');
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
            const res = await fetch(`http://localhost:3000/submissions/${subId}/grade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ grade: Number(input), id: Number(id) })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to add grade');
            }

            // match on the submission id (not the student id) so the right card moves to "Graded"
            setSubmissions(prev =>
                prev.map(sub => sub.id === id ? { ...sub, grade: Number(input) } : sub)
            );
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-900 text-zinc-400 flex items-center justify-center">
            <p>Loading submissions...</p>
        </div>
    );

    const ungradedSubmissions = submissions.filter(sub => sub.grade === null || sub.grade === undefined);
    const gradedSubmissions = submissions.filter(sub => sub.grade !== null && sub.grade !== undefined);

    // One card layout shared by both lists, only the badge and button text differ
    const renderSubmission = (sub, index, isGraded) => {
        const subId = sub.student_id || index;
        const fileUrls = sub.file_url || [];
        const fileNames = sub.file_name || [];

        return (
            <div key={sub.id} className="inner-div p-4 min-w-0 w-xs max-w-xs min-h-sm rounded-lg space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><strong className="text-white">Student ID:</strong> {sub.student_id}</span>
                    {isGraded ? (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-xs font-semibold">Grade: {sub.grade}</span>
                    ) : (
                        <span className="bg-red-600/20 text-red-400 border border-red-600/30 text-[11px] px-2 py-1 rounded transition-colors cursor-default">Not graded yet</span>
                    )}
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Description / Text</label>
                    <p className="whitespace-pre-wrap text-gray-300 transition-colors bg-gray-950/50 border-gray-800/60 hover:border-emerald-500/30 p-3 rounded-xl border text-sm text-gray-300">
                        {sub.submission_text || 'No text provided.'}
                    </p>
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Attached Files</label>
                    <ul className="space-y-2 pt-2 border-t border-zinc-800">
                        {fileUrls.length === 0 ? (
                            <li className="text-gray-500 text-xs italic">No files attached.</li>
                        ) : (
                            fileUrls.map((url, fileIndex) => (
                                <li key={fileIndex} className="flex justify-between items-center gap-3 inner-inner-div p-2 rounded-xl border">
                                    <a
                                        href={`http://localhost:3000${url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-sm text-gray-300 hover:text-emerald-300 transition-colors"
                                    >
                                        {fileNames[fileIndex]}
                                    </a>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <button
                    type="button"
                    onClick={() => handleGrade(subId, sub.id)}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow"
                >
                    {isGraded ? 'Update Grade' : 'Add Grade'}
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-900 p-8 max-w-3xl mx-auto w-full font-sans text-zinc-100">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer mb-3"
            >
                ← Back
            </button>
            <h2 className="text-2xl font-bold text-white">Task Submissions</h2>
            {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 p-3 rounded-lg mb-4 mt-4">{error}</p>}

            {submissions.length === 0 ? (
                <p className="text-gray-400 text-sm italic mt-7">No submissions found for this task yet.</p>
            ) :
                ( <div className="space-y-6 mt-7 flex flex-col justify-center items-center">
                    <div className="main-div rounded-xl grid grid-cols-[auto] place-items-center min-w-0 w-lg max-w-lg space-y-4">
                        <h3 className="text-lg font-semibold text-white">Ungraded Submissions</h3>
                        {ungradedSubmissions.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No ungraded submissions found.</p>
                        ) : (
                            ungradedSubmissions.map((sub, index) => renderSubmission(sub, index, false))
                        )}
                    </div>

                    <div className="main-div p-5 grid grid-cols-[auto] place-items-center rounded-xl min-w-0 w-lg max-w-lg space-y-4">
                        <h3 className="text-lg font-semibold text-white">Graded Submissions</h3>
                        {gradedSubmissions.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No graded submissions yet.</p>
                        ) : (
                            gradedSubmissions.map((sub, index) => renderSubmission(sub, index, true))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Submissions;
