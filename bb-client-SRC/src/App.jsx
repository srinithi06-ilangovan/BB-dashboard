import { useState } from 'react'
import './App.css'
import ExcelUploader from './components/ExcelUploader'
import TabbedComponent from './components/TabbedComponent';
import Login from './components/Login';
import { useEffect } from 'react';
import Logout from './components/Logout';


function App() {

  const [fileSelected, setFileSelected] = useState(false); // State to track file selection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get('auth');
  console.log(myParam, 'myParammyParam')
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // The browser automatically sends the session cookie with this request
        const response = await fetch('https://agile-kanban-dashboard.onrender.com/api/auth/status', {
          credentials: 'include',
        });
        if (response.ok) { // `response.ok` is true for a 200-299 status code
          const data = await response.json();
          setIsAuthenticated(true);
          setUsername(data.username);

        }
      } catch (error) {
        console.error("Not authenticated:", error);
        setIsAuthenticated(false);
      } 
    };

    if (myParam === 'success') {
      checkAuthStatus();
    }
  }, [myParam]);


  return (
    <div className='container'>
      <h3>Live Nation - Agile Status Report Automation</h3>
      {isAuthenticated ? <>
        <p>Welcome, {username}!</p> 
        <Logout />
        <ExcelUploader setFileSelected={setFileSelected} fileSelected={fileSelected} />
        <TabbedComponent fileSelected={fileSelected} />
      </>
        :
        <>
          <div>Access Denied. Please log in with GitHub.
          </div>
          <Login />
        </>
      }

    </div>
  )
}

export default App