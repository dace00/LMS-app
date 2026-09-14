import { useState, useEffect } from "react";

function Profile() {
    const [user, setUser] = useState({});
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: ""
    });

    useEffect(() => {
        const getInfo = async () => {
            try {
                const res = await fetch("http://localhost:3000/userName", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch user info");
                }

                setUser(data.user);
                setFormData({
                    first_name: data.user.first_name || "",
                    last_name: data.user.last_name || "",
                    email: data.user.email || ""
                });
            }
            catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        getInfo();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const res = await fetch("http://localhost:3000/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update profile");
            }

            setUser(data.user || { ...user, ...formData });
            setSuccessMessage("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <>
            <h2>Your profile info</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            {!isEditing ? (
                <div>
                    <p>First name: {user.first_name}</p>
                    <p>Last name: {user.last_name}</p>
                    <p>Email: {user.email}</p>

                    <button onClick={() => setIsEditing(true)}>Change Info</button>
                </div>
            ) : (
                <form onSubmit={handleUpdate}>
                    <div>
                        <label>First name: </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginTop: "8px" }}>
                        <label>Last name: </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginTop: "8px" }}>
                        <label>Email: </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginTop: "12px" }}>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)} style={{ marginLeft: "8px" }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}

export default Profile;