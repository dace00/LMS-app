const express = require('express');
const router = express.Router();
const {isAuthenticated} = require('../middleware/authMiddleware');

router.get("/student-dashboard", isAuthenticated, (req, res) => {
    res.json({message: "Welcome to Student Dashboard"});
})

module.exports = router;

