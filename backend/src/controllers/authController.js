const pool = require("../pool/pool.js");
const bcrypt = require("bcrypt");

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
            'INSERT INTO users (first_name, last_name, email, password_hash, index_number, role) VALUES ($1, $2, $3, $4, $5, "student") RETURNING id, first_name, index_number, role', [first_name, last_name, email, hashedPassword, index_number]
        );
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
        )
        if(userResult.rows.length === 0) {
            return res.status(400).json({ error: "Wrong email or password" });
        }
        const rightPass = await bcrypt.compare(password, userResult.rows[0].password);
        user = userResult.rows[0];
        if (!rightPass) {
            return res.status(400).json({ error: "Wrong email or password" });
        }
        req.session.userId = user.id
        req.session.role = user.role;

        res.json("Logged in successfully", {role: user.role});
    }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
}

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