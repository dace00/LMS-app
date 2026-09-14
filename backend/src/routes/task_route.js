const express = require('express');
const router = express.Router();
const { Verify } = require('../middleware/authMiddleware');
const pool = require('../pool/pool.js');
const { uploadTask, uploadSubmit } = require('../middleware/uploadConfig');

// --- TEACHER TASKS ROUTES ---

router.post('/courses/modify/:id/tasks', Verify, uploadTask.array("taskFiles"), async (req, res) => {
    const { id } = req.params;
    const { titleTask, descTask, dueDateTask } = req.body;

    // Map multiple uploaded task files into arrays for PostgreSQL TEXT[] columns
    const filePaths = req.files && req.files.length > 0
        ? req.files.map(file => `/taskFiles/${file.filename}`)
        : [];

    const fileNames = req.files && req.files.length > 0
        ? req.files.map(file => file.originalname)
        : [];

    try {
        const result = await pool.query(
            'INSERT INTO tasks (course_id, title, description, due_date, file_name, file_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, titleTask, descTask, dueDateTask, fileNames, filePaths]
        );
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "unable to add task" });
    }
});

router.get('/courses/:id/tasks', Verify, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT title, due_date, id FROM tasks WHERE course_id = $1',
            [id]
        );
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "unable to fetch task" });
    }
});

router.get('/tasks/:taskId', Verify, async (req, res) => {
    const { taskId } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, title, description, due_date, file_name, file_path FROM tasks WHERE id = $1', [taskId]
        );
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        return res.status(400).json({ error: "unable to fetch task" });
    }
});


// --- STUDENT SUBMISSIONS ROUTES ---

router.post('/tasks/:taskId/submit', Verify, uploadSubmit.array("subm-files"), async (req, res) => {
    const { taskId } = req.params;
    const { descSubmit, grade } = req.body;
    const userId = req.userId;

    const filePaths = req.files && req.files.length > 0
        ? req.files.map(file => `/submitUploads/${file.filename}`)
        : [];

    const fileNames = req.files && req.files.length > 0
        ? req.files.map(file => file.originalname)
        : [];

    try {
        await pool.query(
            'INSERT INTO submissions (student_id, task_id, file_url, file_name, submission_text, grade) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, taskId, filePaths, fileNames, descSubmit, grade]
        );

        res.status(200).json({ message: "successfully submitted work" });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "unable to upload submission" });
    }
});

router.get('/tasks/:taskId/submit', Verify, async (req, res) => {
    const { taskId } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, student_id, submission_text, file_url, file_name, grade
             FROM submissions
             WHERE task_id = $1`,
            [taskId]
        );

        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to fetch submission" });
    }
});

router.post('/submissions/:subId/grade', Verify, async (req, res) => {
    const { subId } = req.params;
    const { grade, id } = req.body;

    try {
        await pool.query(
            'UPDATE submissions SET grade = $1 WHERE student_id = $2 AND id = $3',
            [grade, subId, id]
        );
        res.status(200).json({ message: "Successfully saved grade" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to save grade" });
    }
});

router.get('/tasks/:taskId/submitRes', Verify, async (req, res) => {
    const { taskId } = req.params;

    try {
        const result = await pool.query(
            `SELECT submission_text, student_id, file_url, file_name, id, grade
             FROM submissions
             WHERE task_id = $1 AND student_id = $2`,
            [taskId, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No submission found" });
        }

        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to fetch submission" });
    }
});

module.exports = router;