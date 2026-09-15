const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isTeacher, Verify} = require('../middleware/authMiddleware');
const pool = require('../pool/pool');
const path = require('path');

router.get('/teacher-dashboard', Verify, (req, res) => {
    res.json({message: "Welcome to Teacher Dashboard"});
});

const fileFilter = (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('UTF-8')
const allowedMimeTypes = ['application/pdf']
    const extname = path.extname(file.originalname).toLowerCase();
if(allowedMimeTypes.includes(file.mimetype) && extname === '.pdf') {
    cb(null, true);
}
else {
    cb( new Error('Unsupported file extension'), false);
}
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage, // Use 'storage' instead of 'dest'
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter
});

router.post('/teacher-dashboard', Verify, upload.array('course-file'), async (req, res) => {
    const { title, description, section_title } = req.body;
    const instructorId = req.userId;

    try {
        const newCourse = await pool.query(
            'INSERT INTO courses (title, description, instructor) VALUES ($1, $2, $3) RETURNING *',
            [title, description, instructorId]
        );
        const course_id = newCourse.rows[0].id;

        const secTitle = section_title || "General";
        const newSection = await pool.query(
            'INSERT INTO sections (course_id, title) VALUES ($1, $2) RETURNING *',
            [course_id, secTitle]
        );
        const section_id = newSection.rows[0].id;

        let newFileResults = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileQuery = await pool.query(
                    'INSERT INTO files (name, file_path, course_id, section_id) VALUES ($1, $2, $3, $4) RETURNING *',
                    [file.originalname, `/uploads/${file.filename}`, course_id, section_id]
                );
                newFileResults.push(fileQuery.rows[0]);
            }
        }

        res.status(201).json({
            message: "Successfully added course with section and files!",
            course: newCourse.rows[0],
            section: newSection.rows[0],
            files: newFileResults
        });
    }
    catch (error) {
        console.error(error.message);
        res.status(400).json({ error: "An error occured while trying to add course" });
    }
});
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
    const { title, description, section_id, section_title } = req.body;

    try {
        const result = await pool.query(
            'UPDATE courses SET title = $1, description = $2 WHERE id = $3', [title, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        let targetSectionId = section_id || null;

        if (section_title) {
            const newSec = await pool.query(
                'INSERT INTO sections (course_id, title) VALUES ($1, $2) RETURNING id',
                [id, section_title]
            );
            targetSectionId = newSec.rows[0].id;
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const name = file.originalname;
                const file_path = `/uploads/${file.filename}`;
                await pool.query(
                    'INSERT INTO files (name, file_path, course_id, section_id) VALUES ($1, $2, $3, $4)',
                    [name, file_path, id, targetSectionId]
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

router.put('/teacher/sections/:sectionId', Verify, async (req, res) => {
    const { sectionId } = req.params;
    const { title } = req.body;

    try {
        const updateResult = await pool.query(
            'UPDATE sections SET title = $1 WHERE id = $2 RETURNING *',
            [title, sectionId]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        res.json(updateResult.rows[0]);
    } catch (error) {
        console.error('Section update error:', error.message);
        res.status(500).json({ error: 'Server error while updating section' });
    }
});

router.delete('/teacher/sections/:sectionId', Verify, async (req, res) => {
    const { sectionId } = req.params;

    try {
        const deleteResult = await pool.query(
            'DELETE FROM sections WHERE id = $1 RETURNING *',
            [sectionId]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Section deletion error:', error.message);
        res.status(500).json({ error: 'Server error while deleting section' });
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
        const teacherId = req.userId;
        const result = await pool.query(`
            SELECT
                submissions.id AS submission_id,
                submissions.submitted_at,
                submissions.student_id,
                submissions.task_id,
                submissions.submission_text,
                tasks.title AS task_title,
                courses.title AS course_title,
                users.first_name,
                users.email
            FROM submissions
                     JOIN tasks ON submissions.task_id = tasks.id
                     JOIN courses ON tasks.course_id = courses.id
                     JOIN users ON submissions.student_id = users.id
            WHERE courses.instructor = $1
              AND submissions.grade IS null;
        `, [teacherId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});

router.use((err, req, res, next) => {
    if (err.message === 'Unsupported file extension' || err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "Please insert a pdf file (max 10MB)" });
    }
    console.error(err.message);
    res.status(500).json({ error: "An unexpected server error occurred" });
});

module.exports = router;