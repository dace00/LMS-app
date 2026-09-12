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
    const file = req.file.originalname;
    const file_path = `/uploads/${req.file.filename}`;
    const instructorId = req.userId;
    try {
       const newCourse =  await pool.query(
            'INSERT INTO courses (title, description, instructor) VALUES ($1, $2, $3) RETURNING *', [title, description, instructorId]
        )
        const course_id = newCourse.rows[0].id;
        const newFile = await pool.query(
            'INSERT INTO files (name, file_path, course_id) VALUES ($1, $2, $3) RETURNING *', [file, file_path, course_id]
        )
        res.status(201).json({message: "Successfully added course!", course: newCourse.rows[0], file: newFile.rows[0]})
    }
    catch (error) {
        res.status(400).json({error: "An error occured while trying to add course"});
    }
})

router.post("/course-removal", Verify, async (req, res) => {
    const { courseId } = req.body;

    try {
        const result = await pool.query(
            'DELETE FROM courses WHERE id = $1 RETURNING *',
            [courseId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course deleted permanently!' });
    } catch (err) {
        console.error('Database deletion error:', err.message);
        res.status(500).json({ error: 'Server error while deleting course' });
    }
});

router.post("/student/courses/modify/:id", Verify, upload.array('course-files'), async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
        const result = await pool.query(
            'UPDATE courses SET title = $1, description = $2 WHERE id = $3', [title, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const name = file.originalname;
                const file_path = `/uploads/${file.filename}`;
                await pool.query(
                    'INSERT INTO files (name, file_path, course_id) VALUES ($1, $2, $3)',
                    [name, file_path, id]
                );
            }
        }

        res.json({ message: "Successfully updated course!" });
    }
    catch (error) {
        console.error('Database update error:', error.message);
        res.status(500).json({ error: 'Server error while updating course' });
    }
});

router.post("/student/courses/files/:fileId", Verify, async (req, res) => {
    const { fileId } = req.params;
    try {
      const result = await pool.query(
            'DELETE FROM files WHERE id = $1 RETURNING *', [fileId]
        );
      if(result.rowCount === 0) {
          return res.status(404).json({ error: 'file not found' });
      }
    }
    catch (error) {
        console.error('File deletion error:', error.message);
        return res.status(500).json({ error: 'Server error while deleting file' });
    }
    return res.json({message: "Successfully removed file!"});
})

router.get('/teacher/ungraded', Verify, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM submissions WHERE grade IS NULL`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});

module.exports = router;