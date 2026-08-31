const express = require('express');
const router = express.Router();
const {isAuthenticated} = require('../middleware/authMiddleware');
const pool = require('../pool/pool.js');

router.get("/student-dashboard", isAuthenticated, (req, res) => {
    res.json({message: "Welcome to Student Dashboard"});
})

router.get('/student/courses', isAuthenticated , async (req, res) => {
    const studentId = req.session.userId;
    try {
        const result = await pool.query(
            'SELECT title, description, instructor' +
            ' FROM courses c ' +
            'JOIN student_courses sc ON c.id = sc.course_id' +
            'WHERE sc.student_id = $1', [studentId]
        );
        res.json(result.rows);
    }
    catch(err) {
        res.status(500).json("failed to add courses");
    }
})

router.post('/student/courses', isAuthenticated , async (req, res) => {
    const studentId = req.session.userId;
    const {course_id} = req.body;
    try {
        await pool.query(
            'INSERT INTO student_courses (student_id, courseid) VALUES ($1, $2)', [studentId, course_id]
        );
        res.status(201).json({message: "success"});
    }
    catch(err) {
        res.status(500).json({message: "failed to add courses"});
    }
})

module.exports = router;

