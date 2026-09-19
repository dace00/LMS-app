
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
            const method = submitRes ? 'PUT' : 'POST';
            const endpoint = `http://localhost:3000/tasks/${taskId}/submit`;

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const res = await response.json();

            if (!response.ok) {
                throw new Error(res.error || "something went wrong");
            }

            alert(submitRes ? "Successfully updated work!" : "Successfully submitted work!");
            window.location.reload();
        }
        catch (err) {
            setError(err.message || "Uh Oh! Something went wrong, please try again later!");
        }
    };
    
if (error) {
    return (
        <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center p-8">
            <p className="text-lg bg-red-950/40 border border-red-900/50 p-4 rounded-xl">{error}</p>
        </div>
    );
}

if (!task) {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-300 flex items-center justify-center">
            <p className="text-lg animate-pulse">Loading task details...</p>
        </div>
    );
}

return (
    <>
    <div className=" text-gray-100  mt-2 font-sans">
        <Link
            to={-1}
            className="inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors mb-4"
        >
            ← Back
        </Link>
    </div>

    
        <div className="max-w-5xl mx-auto space-y-8 mb-8">
            <div className="bg-zinc-800/60 max-w-md mx-auto rounded-xl  border border-zinc-700/50  hover:border-emerald-500/50 hover:-translate-y-1">
                <h2 className="text-sm font-bold text-white border-b border-b-2 border-zinc-700/50 px-6 py-6">
                    {task.title}
                </h2>
                <div className="p-6">

                    <p className="text-gray-400 text-sm pb-1 leading-relaxed border-b border-emerald-300 ">
                        {task.description}
                    </p>
                    
                    <div className="bg-zinc-900/60 border border-gray-800 w-[auto] rounded-xl p-5 shadow-md mt-4 transition-all hover:border-gray-700">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                            Helpful files:
                        </p>

                        {task.file_path && task.file_path.length > 0 ? (
                            <div className="space-y-2">
                                {task.file_path.map((path, index) => (
                                    <div
                                        key={index}
                                        className="max-w-sm mx-auto my-3 mb-4 bg-gray-950/50 border border-gray-800 p-2 rounded-lg transition-all hover:border-emerald-500/30"
                                    >
                                        <a
                                            href={`http://localhost:3000${path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-gray-300 hover:text-emerald-300 transition-colors"
                                        >
                                            📄 <span className="ml-2">
                                                    {task.file_name?.[index] || `File ${index + 1}`}
                                                </span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-xs italic">
                                No helpful files attached.
                            </p>
                        )}
                    </div>

                    <div className="text-xs text-gray-400 border-t border-gray-800 pt-3 mt-4 flex items-center justify-start gap-2">
                        <span>Due Date:</span>
                        <span className="text-gray-300 font-medium">
                                {new Date(task.due_date).toLocaleString()}
                            </span>
                    </div>

                </div>
            </div>

            {/* Submission part */}
            <div className="bg-zinc-800/60 max-w-md mx-auto p-6 rounded-xl border border-zinc-700/50 transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1">
                {!isSubmitted ? (
                    <>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Submit your work
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-zinc-900/60 border border-gray-800 w-[auto] rounded-xl p-5 shadow-md mt-4 transition-all duration-200 hover:border-gray-700">
                                <label className="block text-xs uppercase  tracking-wider text-gray-400 font-semibold mb-1">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={descSubmit}
                                    onChange={(e) => setDescSubmit(e.target.value)}
                                    className="w-full mt-1 min-h-[90px] p-3 text-sm bg-gray-950/50 border
                                     border-gray-800 rounded-lg text-gray-100 focus:outline-none
                                     hover:border-emerald-500/30 focus:border-2 focus:border-emerald-500/30
                                     transition-all duration-100"
                                    placeholder="Add notes or text for your submission..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                    Attach Files
                                </label>

                                <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={handleFileChange}
                                    className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:cursor-pointer file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                                />
                            </div>

                            {/* Preview selected files before upload */}
                            {fileSubmit.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-400">
                                        Selected Files ({fileSubmit.length}):
                                    </p>

                                    {fileSubmit.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex justify-between items-center bg-zinc-900/60 border border-gray-800 hover:border-gray-700 p-2.5 rounded-lg text-sm"
                                        >
                                                <span className="text-gray-300 hover:text-emerald-300 cursor-default truncate mr-2">
                                                    📄 {file.name}
                                                </span>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(file.id)}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2 py-1 rounded text-xs transition-colors cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors shadow-md cursor-pointer"
                            >
                                Submit work
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                Submission Successful
                            </h3>

                            <p className="text-xs text-gray-400">
                                Your recorded submission info:
                            </p>
                        </div>

                        {submitRes && (
                            <div className="space-y-3">
                                <div className="bg-zinc-900/60 border border-gray-800 p-4 rounded-lg text-sm space-y-2">
                                    <p className="text-gray-300">
                                        <strong className="text-gray-400">Student ID:</strong> {submitRes.student_id}
                                    </p>

                                    <p className="text-gray-300">
                                        <strong className="text-gray-400">Description:</strong> {submitRes.submission_text || "No text provided."}
                                    </p>

                                    <div className="pt-2 border-t border-gray-800">
                                        <strong className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-2">
                                            Your Attached Files:
                                        </strong>

                                        {submitRes.file_url && submitRes.file_url.length > 0 ? (
                                            <div className="space-y-2">
                                                {submitRes.file_url.map((url, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-950/50 border border-gray-800/60 p-2.5 rounded-lg"
                                                    >
                                                        <p className="text-xs text-gray-300 mb-1">
                                                            📄 {submitRes.file_name?.[index] || `File ${index + 1}`}
                                                        </p>

                                                        <a
                                                            href={`http://localhost:3000${url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center"
                                                        >
                                                            Download / View File →
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-xs italic">
                                                No files attached.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {submitRes.grade !== null && submitRes.grade !== undefined ? (
                                    <div className="bg-zinc-900/60 border border-gray-800 p-3 rounded-lg text-sm">
                                        <span className="text-gray-400">Your grade:</span>{" "}
                                        <strong className="text-emerald-400 ml-1">
                                            {submitRes.grade}
                                        </strong>
                                    </div>
                                ) : (
                                    <div className="pt-2 flex items-center justify-between">
                                            <span className="text-xs text-gray-400 italic">
                                                Grade not yet published
                                            </span>

                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
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

        </div>
    </>
);
}

export default TaskContent;

