const express = require('express');
const router = express.Router();
const { Verify } = require('../middleware/authMiddleware');
const pool = require('../pool/pool.js');
const { uploadTask, uploadSubmit } = require('../middleware/uploadConfig');



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

router.put('/tasks/:taskId/submit', Verify, uploadSubmit.array("subm-files"), async (req, res) => {
    const { taskId } = req.params;
    const { descSubmit, grade } = req.body;
    const userId = req.userId;

    // Check if new files were uploaded; if so, map their paths and names
    const filePaths = req.files && req.files.length > 0
        ? req.files.map(file => `/submitUploads/${file.filename}`)
        : null;

    const fileNames = req.files && req.files.length > 0
        ? req.files.map(file => file.originalname)
        : null;

    try {
        // First, check if a submission already exists for this user and task
        const existingSub = await pool.query(
            'SELECT * FROM submissions WHERE task_id = $1 AND student_id = $2',
            [taskId, userId]
        );

        if (existingSub.rows.length === 0) {
            return res.status(404).json({ error: "No existing submission found to update." });
        }

        // If new files were provided, update text AND files. If no new files were uploaded, keep the old files intact.
        let updateQuery;
        let queryParams;

        if (filePaths && filePaths.length > 0) {
            updateQuery = `
                UPDATE submissions 
                SET submission_text = $1, file_url = $2, file_name = $3 
                WHERE task_id = $4 AND student_id = $5
            `;
            queryParams = [descSubmit, filePaths, fileNames, taskId, userId];
        } else {
            updateQuery = `
                UPDATE submissions 
                SET submission_text = $1 
                WHERE task_id = $2 AND student_id = $3
            `;
            queryParams = [descSubmit, taskId, userId];
        }

        await pool.query(updateQuery, queryParams);

        res.status(200).json({ message: "Successfully updated submission work" });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Unable to update submission" });
    }
});

router.delete('/tasks/:taskId', Verify, async (req, res) => {
    const { taskId } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [taskId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully!' });
    } catch (err) {
        console.error('Task deletion error:', err.message);
        res.status(500).json({ error: 'Server error while deleting task' });
    }
});

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