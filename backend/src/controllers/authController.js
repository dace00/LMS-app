const pool = require("../pool/pool.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    const { first_name, last_name, email, password, index_number } = req.body;

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const complex = 10;
        const hashedPassword = await bcrypt.hash(password, complex);
        
        const newUser = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, index_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, index_number, role', [first_name, last_name, email, hashedPassword, index_number, 'student']
        );
        return res.status(200).json(newUser);
        }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email=$1', [email]
        );

        if(userResult.rows.length === 0) {
            return res.status(400).json({ error: "Wrong email or password" });
        }

        const user = userResult.rows[0];

        if (!password || !user.password_hash) {
            return res.status(400).json({ error: "Invalid credentials provided" });
        }

        const rightPass = await bcrypt.compare(password, user.password_hash);

        if (!rightPass) {
            return res.status(400).json({ error: "Wrong email or password" });
        }

        // --- CREATE JWT TOKEN AFTER SUCCESSFUL PASSWORD CHECK ---
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send back the token and role instead of relying on sessions
        res.json({
            message: "Logged in successfully",
            token: token,
            role: user.role
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

const logOutUser = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ error: "Could not log out" });
        }
        res.clearCookie('connect.sid');
        res.json({ success: "Logged out successfully" });
    })
}

module.exports = {logOutUser, loginUser, registerUser};