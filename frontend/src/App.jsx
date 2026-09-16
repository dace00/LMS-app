import './App.css';
import {useState, useEffect} from 'react';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import {Route, BrowserRouter, Routes} from "react-router-dom";
import Student_dash from "./pages/studentDash.jsx";
import Teacher_dash from "./pages/teacherDash.jsx";
import Nav from "./pages/nav.jsx";
import CourseContent from "./pages/courseContent.jsx";
import ModifyCourse from "./pages/modifyCourse.jsx";
import TaskContent from "./pages/taskContent.jsx";
import Submissions from "./pages/submissions.jsx";
import Home from "./pages/home.jsx";
import Profile from "./pages/profile.jsx";
import GlobalStyle from "./pages/global-style.jsx";


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
       <div className="w-full min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
       <BrowserRouter>
           <Nav/>
           <Routes>
           <Route element={<GlobalStyle />}>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/student-dashboard" element={<Student_dash />} />
           <Route path="/teacher-dashboard" element={<Teacher_dash />}/>
           <Route path={`/student-dashboard/courses/:id`} element={<CourseContent/>}/>
           <Route path={`teacher-dashboard/courses/modify/:id`} element={<ModifyCourse/>}/>
           <Route path={'student-dashboard/courses/:courseId/task/:taskId'} element={<TaskContent/>}/>
           <Route path={'/tasks/:taskId/submissions'} element={<Submissions/>}/>
           <Route path={'/'} element={<Home/>}/>
           <Route path={'/profile'} element={<Profile/>}/>
           </Route>
           </Routes>
       </BrowserRouter>
       </div>
       </>
   ); 
}

export default App;