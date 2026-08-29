const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
        origin: "http://localhost:5173",
    credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/route/student', require('./routes/student_route.js'));
app.use('/route/teacher', require('./routes/teacher_route.js'));
//-------------

app.get('/', (req, res) => {
    res.json({message: "Connected successfully"});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
