const express = require('express');
const router = express.Router();
const {isAuthenticated, isTeacher} = require('../middleware/authMiddleware');

router.get('/dashboard', isAuthenticated, isTeacher, (req, res) => {
    res.json({message: "Welcome to Teacher Dashboard"});
});

module.exports = router;