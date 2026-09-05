import './App.css';
import {useState, useEffect} from 'react';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import {Route, BrowserRouter, Routes} from "react-router-dom";
import Student_dash from "./pages/studentDash.jsx";
import Teacher_dash from "./pages/teacherDash.jsx";
import Nav from "./pages/nav.jsx";
import CourseContent from "./pages/courseContent.jsx";

function App() {
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    fetch("http://localhost:3000")
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch(err => console.log(err));
  }, []);
   return (
       <>
       <BrowserRouter>

           <div className="App">
               <h1> LMS frontend is live!</h1>
               <p>Backend status: {message || 'connecting...'}</p>
           </div>
           <Nav/>
           <Routes>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/student-dashboard" element={<Student_dash />} />
           <Route path="/teacher-dashboard" element={<Teacher_dash />}/>
               <Route path={`/student-dashboard/courses/:id`} element={<CourseContent/>}/>
           </Routes>
       </BrowserRouter>
       </>
   ); 
}

export default App;