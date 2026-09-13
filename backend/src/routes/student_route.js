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
            'SELECT id,title, description FROM courses c ' /*+
            'JOIN student_courses sc ON c.id = sc.courseId ' +
            ' WHERE sc.student_id = $1', [studentId] */
        );
        const file = await pool.query(
            'SELECT id,name, file_path FROM files'
        )
        const enrolledResult = await pool.query(
            'SELECT courseid FROM student_courses WHERE student_id = $1',
            [studentId]
        );
        const enrolledIds = enrolledResult.rows.map(row => row.courseid);
        res.json({courses:result.rows,
            file: file.rows,
            enrolledIds: enrolledIds
        });
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

router.get('/student/courses/:id', Verify, async (req, res) => {
    const courseId = req.params.id;
    try {
        // 1. Fetch course details
        const courseResult = await pool.query(
            'SELECT * FROM courses WHERE id = $1', [courseId]
        );
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: "No course found with this id" });
        }

        // 2. Fetch sections and LEFT JOIN their files
        const sectionsQuery = `
            SELECT 
                s.id AS section_id, 
                s.title AS section_title, 
                f.id AS file_id, 
                f.name, 
                f.file_path 
            FROM sections s
            LEFT JOIN files f ON s.id = f.section_id
            WHERE s.course_id = $1
            ORDER BY s.id ASC;
        `;
        const sectionsResult = await pool.query(sectionsQuery, [courseId]);

        const sectionsMap = {};
        sectionsResult.rows.forEach(row => {
            if (!sectionsMap[row.section_id]) {
                sectionsMap[row.section_id] = {
                    id: row.section_id,
                    title: row.section_title,
                    files: []
                };
            }
            if (row.file_id) {
                sectionsMap[row.section_id].files.push({
                    id: row.file_id,
                    name: row.name,
                    file_path: row.file_path
                });
            }
        });
        
        const taskResult = await pool.query(
            'SELECT id, title, due_date FROM tasks WHERE course_id = $1', [courseId]
        );

        return res.json({
            course: courseResult.rows[0],
            sections: Object.values(sectionsMap),
            tasks: taskResult.rows
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: "failed to fetch courses" });
    }
});

router.get('/student/pending', Verify, async (req, res) => {
    try {
        const studentId = req.userId;
        const query = `
            SELECT tasks.*, courses.title AS course_title
            FROM tasks
                     JOIN courses ON tasks.course_id = courses.id
                     LEFT JOIN submissions
                               ON tasks.id = submissions.task_id
                                   AND submissions.student_id = $1
            WHERE submissions.task_id IS NULL;
        `;
        const result = await pool.query(query, [studentId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});

module.exports = router;