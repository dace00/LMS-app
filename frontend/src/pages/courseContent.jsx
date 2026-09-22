import {useState, useEffect} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';

function CourseContent() {
    const [error, setError] = useState("");
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [tasks, setTasks] = useState([]);
    const {id} = useParams();

    useEffect(() => {
        fetch(`http://localhost:3000/student/courses/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setCourse(data.course);
                setSections(data.sections || []);
                setTasks(data.tasks || []);
            })
            .catch(err => console.error("Error fetching course content:", err));
    }, [id]);

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-300 flex items-center justify-center">
                <p className="text-lg animate-pulse">Loading course details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-100 p-6 md:p-10 font-sans">
            <Link
                to="/student-dashboard"
                className="inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors mb-6"
            >
                ← Back to Dashboard
            </Link>

            <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-zinc-800/60 max-w-md mx-auto p-6 rounded-xl border border-zinc-700/50 transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1">
                    <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
                    <p className="text-gray-400 text-sm leading-relaxed">{course.description}</p>
                </div>

                <div className="feature-card grid grid-cols-[auto] gap-2 place-items-center">
                    <h2 className="course-title">
                        Course Materials
                    </h2>

                    {sections.length === 0 ? (
                        <p className="text-gray-500 italic">No sections available for this course yet.</p>
                    ) : (
                        <>
                        <div className="grid grid-cols-2 gap-2">
                            {sections.map((section) => (
                            <div
                                key={section.id}
                                className="bg-zinc-900/60 border border-gray-800 rounded-xl p-5 shadow-md transition-all [&:nth-child(odd):last-child]:col-span-2  [&:nth-child(odd):last-child]:w-1/2 [&:nth-child(odd):last-child]:justify-self-center hover:border-gray-700"
                            >
                                <h3 className="text-lg text-[#d4d4d8] font-medium text-white transition-colors block mb-2">{section.title}</h3>

                                {section.files.length === 0 ? (
                                    <p className="text-sm italic text-gray-500">No files uploaded in this section.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {section.files.map((file) => (
                                            <li key={file.id}>
                                                <a
                                                    href={`http://localhost:3000${file.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center text-sm text-gray-300 hover:text-emerald-300 transition-colors bg-gray-950/50 px-3 py-2 rounded-lg border border-gray-800/60 w-full hover:border-emerald-500/30"
                                                >
                                                    📄 <span className="ml-2">{file.name}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                        </div>
                        </>
                    )}
                </div>

                <div className="bg-zinc-800/60 mx-auto max-w-md max-h-sm p-6 rounded-xl border border-zinc-700/50 transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1">
                    <h3 className="course-title">
                        Tasks
                    </h3>

                    {tasks.length === 0 ? (
                        <p className="text-gray-500 italic">No tasks available.</p>
                    ) : (
                        <ul className="flex flex-wrap gap-2 place-items-center">
                            {tasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="bg-zinc-900/60 border border-gray-800  rounded-xl p-4 shadow-md flex flex-col justify-between transition-all hover:border-gray-700"
                                >
                                    <div>
                                        <Link
                                            to={`./task/${task.id}`}
                                            className="text-md font-medium text-white hover:text-emerald-400 transition-colors block "
                                        >
                                            {task.title}
                                        </Link>
                                    </div>
                                    <div className="text-xs text-gray-400 border-t border-gray-800/80 pt-3 mt-3 flex items-center justify-between">
                                        <span>Due: &nbsp;</span>
                                        <span className="text-gray-300 font-medium">{new Date(task.due_date).toLocaleString()}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseContent;