import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import API from '../api_handle/api.jsx';

function Register() {
    const [forms, setForms] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        index_number: "",
        phone_number: null
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForms({ ...forms, [e.target.name]: e.target.value });
    }
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await API.post('route/auth/register', forms);
            alert("Registered successfully!");
            navigate("/login");
        }
        catch (error) {
            setError(error.response?.data?.error)
        }
    };
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Register for LMS</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
                <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <input type="text" name="index_number" placeholder="Index Number" onChange={handleChange} required />
                <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Register</button>
            </form>
            <p style={{ marginTop: '15px' }}>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    );
}

export default Register;