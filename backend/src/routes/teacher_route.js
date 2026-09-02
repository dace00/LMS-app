const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isTeacher, Verify} = require('../middleware/authMiddleware');
const pool = require('../pool/pool');

router.get('/teacher-dashboard', Verify, (req, res) => {
    res.json({message: "Welcome to Teacher Dashboard"});
});

const upload = multer({dest: 'uploads/'})

router.post('/teacher-dashboard', Verify, upload.single('course-file'), async (req, res) => {
    const {title, description} = req.body;
    const filePath = req.file ? req.file.path : null;
    const instructorId = req.userId;
    try {
       const newCourse =  await pool.query(
            'INSERT INTO courses (title, description, instructor) VALUES ($1, $2, $3) RETURNING *', [title, description, instructorId]
        )
        res.status(201).json({message: "Successfully added course!", course: newCourse.rows[0]})
    }
    catch (error) {
        res.status(400).json({error: "An error occured while trying to add course"});
    }
})

module.exports = router;