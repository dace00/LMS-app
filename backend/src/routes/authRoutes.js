const express = require('express');
const router = express.Router();
const {registerUser, loginUser, logOutUser} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logOut", logOutUser);

module.exports = router;