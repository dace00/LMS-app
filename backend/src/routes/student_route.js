const express = require('express');
const router = express.Router();
const { Verify } = require('../middleware/authMiddleware'); 
const pool = require('../pool/pool.js');

router.get("/student-dashboard", Verify, (req, res) => {
    res.json({ message: "Welcome to Student Dashboard" });
});

router.get('/student/courses', Verify, async (req, res) => {
    const studentId = req.userId;

    try {
        const result = await pool.query(
            'SELECT title, description, instructor FROM courses c ' +
            'JOIN student_courses sc ON c.id = sc.courseId ' +
            ' WHERE sc.student_id = $1', [studentId]
        );
        res.json(result.rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch courses" });
    }
});

router.post('/student/courses', Verify, async (req, res) => {
    const studentId = Number(req.userId);
    const { course_id } = req.body;

    try {
        await pool.query(
            'INSERT INTO student_courses (student_id, courseid) VALUES ($1, $2)', [studentId, course_id]
        );
        res.status(201).json({ message: "success" });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: "failed to enroll course" });
    }
});

module.exports = router;