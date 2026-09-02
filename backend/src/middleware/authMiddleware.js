const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    if(req.session.userId && req.session) {
        return next();
    }
    return res.status(401).json({error: "Unauthorized, please log in"})
};

function Verify(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log("1. Incoming Authorization Header:", authHeader);

    const token = authHeader && authHeader.split(' ')[1];
    console.log("2. Extracted Token:", token);

    if(!token) {
        return res.status(401).json({ error: "Token is missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            console.log("3. JWT Verify Error:", err.message); // <--- See if token is expired/invalid
            return res.status(401).json({ error: err.message });
        }
        req.userId = decoded.userId;
        req.role = decoded.role; 
        next();
    });
}

const isTeacher = (req, res, next) => {
    if (req.session && (req.session.role === 'teacher' || req.session.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ error: "Access denied. Teachers only." });
};

module.exports = { isAuthenticated, isTeacher, Verify };