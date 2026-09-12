const pool = require('../pool/pool.js');
const express = require('express');
const router = express.Router();
const { Verify } = require('../middleware/authMiddleware');

router.get('/userName', Verify, async (req, res) => {
    const {userId} = req;
    try {
        const result = await pool.query(
            'SELECT first_name, last_name, role FROM users WHERE id = $1',
            [userId]
        )
        if(result.rows.length == 0){
            return res.status(404).json({error: "no user found"});
        }
        return res.status(200).json({message: 'User found successfully', user: result.rows[0]});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error.message});
    }
})

module.exports = router;