import React from 'react';
import './Styles/login.css'
const Logout = () => {


    const handleLogout = async () => {
        try {
            const response = await fetch('https://agile-kanban-dashboard.onrender.com/api/logout', {
                method: 'POST',
                credentials: 'include', // Make sure to send the session cookie
            });

            if (response.ok) {
                console.log('Logged out successfully.');
                // Update state to reflect logout (e.g., setIsAuthenticated(false))
                // Or redirect the user to the login page
                window.location.href = '/'; 
                
            } else {
                console.error('Logout failed.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    return (
        <div>
            <button
                className='github-login-btn'
                onClick={handleLogout}
            >Logout</button>
        </div>
    );

}

export default Logout;