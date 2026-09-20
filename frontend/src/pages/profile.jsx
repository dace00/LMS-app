import { useState, useEffect } from 'react';

function Profile() {
    const [user, setUser] = useState({});
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLeft, setIsLeft] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    useEffect(() => {
        fetch("http://localhost:3000/userName", {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setUser(data.user);
                    setFormData({
                        first_name: data.user.first_name || '',
                        last_name: data.user.last_name || '',
                        email: data.user.email || ''
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching user info:", err);
                setError('Failed to fetch user info');
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStartEditing = () => {
        setSuccessMessage('');
        setIsLeft(true);
        setTimeout(() => setIsEditing(true), 300);
    };

    const handleCancel = () => {
        // restore the saved values so discarded edits don't show up next time
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || ''
        });
        setError('');
        setIsEditing(false);
        setTimeout(() => setIsLeft(false), 50);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
            setError('First name, last name and email are required.');
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/update-profile", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setUser(prev => data.user || { ...prev, ...formData });
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setIsLeft(false), 50);
        } catch (err) {
            setError(err.message);
        }
    };
    
    const slideClass = `relative inline-block max-w-full transition-all duration-300 ${isLeft ? 'left-0 translate-x-0' : 'left-1/2 -translate-x-1/2'}`;

    return (
        <div className="min-h-screen bg-zinc-900 p-8 max-w-3xl mx-auto w-full font-sans text-zinc-100">
            <h2 className="text-2xl font-bold text-white">Your Profile</h2>
            {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 p-3 rounded-lg mb-4 mt-4">{error}</p>}
            {successMessage && <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-lg mb-4 mt-4">{successMessage}</p>}

            <form onSubmit={handleUpdate} className="main-div p-5 rounded-xl space-y-4 mt-7">
                <h3 className="text-lg font-semibold text-white">General Information</h3>

                <div className="flex flex-col gap-1">
                    {isEditing ? (
                        <>
                    <label className="block text-xs text-left pl-2 uppercase tracking-wider text-gray-400 font-semibold mb-1">First Name</label>
                        <textarea
                            name="first_name"
                            rows={1}
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full min-h-[46px] p-3 text-sm bg-zinc-900 border border-gray-800 rounded-lg text-gray-100 resize-none focus:outline-none hover:border-gray-700 focus:border-2 focus:border-gray-700 transition-all duration-100"
                        />
                        </>
                    ) : (
                        <>
                            <label className="block text-xs text-left pl-2 uppercase tracking-wider text-gray-400 font-semibold mb-1"><span className={slideClass}>First Name</span></label>
                        <p className="w-full min-h-[46px] p-3 text-sm text-left bg-zinc-900 border border-gray-800 rounded-lg text-gray-300 break-words">
                            <span className={slideClass}>{user.first_name || '-'}</span>
                        </p>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    {isEditing ? (
                        <>
                            <label className="block text-xs text-left pl-2 uppercase tracking-wider text-gray-400 font-semibold mb-1">Last Name</label>
                        <textarea
                            name="last_name"
                            rows={1}
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full min-h-[46px] p-3 text-sm bg-zinc-900 border border-gray-800 rounded-lg text-gray-100 resize-none focus:outline-none hover:border-gray-700 focus:border-2 focus:border-gray-700 transition-all duration-100"
                        />
                        </>
                    ) : (
                        <>
                            <label className="block text-xs text-left pl-2 uppercase tracking-wider text-gray-400 font-semibold mb-1"><span className={slideClass}>Last Name</span></label>
                        <p className="w-full min-h-[46px] p-3 text-left text-sm bg-zinc-900 border border-gray-800 rounded-lg text-gray-300 break-words">
                            <span className={slideClass}>{user.last_name || '-'}</span>
                        </p>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-1">

                    {isEditing ? (
                        <>
                        <label className="block text-xs text-left pl-2 uppercase tracking-wider text-gray-400 font-semibold mb-1">Email</label>
                        <textarea
                            name="email"
                            rows={1}
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full min-h-[46px] p-3 text-sm bg-zinc-900 border border-gray-800 rounded-lg text-gray-100 resize-none focus:outline-none hover:border-gray-700 focus:border-2 focus:border-gray-700 transition-all duration-100"
                        />
                        </>
                    ) : (
                        <>
                        <label className="block text-xs text-left pl-2 uppercase tracking-wider text-gray-400 font-semibold mb-1"><span className={slideClass}>Email</span></label>
                        <p className="w-full min-h-[46px] p-3 text-left text-sm bg-zinc-900 border border-gray-800 rounded-lg text-gray-300 break-words">
                            <span className={slideClass}>{user.email || '-'}</span>
                        </p>
                        </>
                    )}
                </div>
                
                {isEditing ? (
                    <div key="edit-actions" className="flex flex-col items-center gap-3 pt-4">
                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 max-w-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors shadow-md cursor-pointer"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="py-2.5 px-2 w-full max-w-md bg-zinc-700 hover:bg-zinc-600 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div key="view-actions" className="flex flex-col items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleStartEditing}
                            className="w-full py-2.5 px-4 max-w-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 font-medium text-sm rounded-lg transition-colors cursor-pointer"
                        >
                            Change Info
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default Profile;
