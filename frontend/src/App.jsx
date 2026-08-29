import './App.css';
import {useState, useEffect} from 'react';

function App() {
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    fetch("http://localhost:5432")
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch(err => console.log(err));
  }, []);
   return (
       <div className="App"> 
       <h1> LMS frontend is live!</h1>
         <p>Backend status: {message || 'connecting...'}</p>  
       </div>
   ) 
}

export default App;