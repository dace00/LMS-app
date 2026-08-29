const isAuthenticated = (req, res, next) => {
    if(req.session.userId && req.session) {
        return next();
    }
    return res.status(401).json({error: "Unauthorized, please log in"})
};

const isTeacher = (req, res, next) => {
    if (req.session && (req.session.role === 'teacher' || req.session.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ error: "Access denied. Teachers only." });
};

module.exports = { isAuthenticated, isTeacher };