const express = require('express');
const router = express.Router();
const { Verify } = require('../middleware/authMiddleware');
const pool = require('../pool/pool.js');
const multer = require('multer');
const result = require("pg/lib/query");


const upload = multer({ dest: 'taskUploads/' });

router.post('/courses/modify/:id/tasks', Verify, upload.array("taskFiles"), async (req, res) => {
    const { id } = req.params;
    const { titleTask, descTask, dueDateTask } = req.body;

    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    const name = file ? file.originalname : null;
    const path = file ? `/taskFiles/${file.filename}` : null;

    try {
        const result = await pool.query(
            'INSERT INTO tasks (course_id, title, description, due_date, file_name, file_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, titleTask, descTask, dueDateTask, name, path]
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
    const {taskId} = req.params;
    try {
        const result = await pool.query(
            'SELECT title, description, due_date, file_name, file_path FROM tasks WHERE id = $1', [taskId]
        )
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        return res.status(400).json({ error: "unable to fetch task" });
    }
})

const uploadSubmit = multer({dest: 'submitUploads'})

router.post('/tasks/:taskId/submit', Verify, uploadSubmit.array("subm-files"), async (req, res) => {
const {taskId} = req.params;
const {descSubmit} = req.body;
const {grade} = req.body;
const userId = req.userId;
const file = req.files && req.files.length > 0 ? req.files[0] : null;
const name = file ? file.originalname : null;
const path = file ? `/submitUploads/${file.filename}` : null;
try {
  await pool.query(
        'INSERT INTO submissions (student_id ,task_id, file_url, submission_text, grade) VALUES ($1, $2, $3, $4, $5)', [userId, taskId, path, descSubmit, grade]
    );
  res.status(200).json({message: "successfully submitted work"});
}
catch (error) {
    console.log(error);
    res.status(400).json({ error: "unable to upload submission" });
}
})

router.get('/tasks/:taskId/submit', Verify,  async (req, res) => {
    const {taskId} = req.params;
    try {
        const result = await pool.query(
            'SELECT submission_text, student_id, file_url, id, grade FROM submissions WHERE task_id = $1', [taskId]
        )
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "unable to fetch submission" });
    }
})

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
            `SELECT submission_text, student_id, file_url, id, grade
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