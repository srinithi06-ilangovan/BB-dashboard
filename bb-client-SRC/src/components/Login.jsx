import React from 'react';
import './Styles/login.css'
const Login = () => {

    // const handleSignIn = async () => {
    //     try {
    //         const response = await fetch('http://localhost:3001/github/login', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });


    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }

    //         const data = await response.json();

    //     } catch (error) {
    //         console.error('Error during sign-in:', error);
    //     }
    // }

    const handleLogin = () => {
        // Redirect to your Node.js backend's login route
        window.location.href = `http://localhost:3001/auth/github`;
    };
    return (
        <div>
            <button
                className='github-login-btn'
                onClick={handleLogin}
            >Login with GitHub</button>
        </div>
    );

}

export default Login;