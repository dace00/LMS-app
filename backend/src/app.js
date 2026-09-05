const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const router = require('./routes/student_route.js');
require('dotenv').config();

const app = express();

app.use(cors({
        origin: "http://localhost:5173",
    credentials: true
    }
));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}))
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/', require('./routes/authRoutes.js'));
app.use('/', require('./routes/student_route.js'));
app.use('/', require('./routes/teacher_route.js'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//-------------

app.get('/', (req, res) => {
    res.json({message: "Connected successfully"});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
