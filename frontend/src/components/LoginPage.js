import React, { useState } from 'react';
import '../styles/LoginPage.css'; // Ensure correct path
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/api/users/login', {
                username,
                password,
            });

            if (response.data.token) {
                alert('Login successful!');
                navigate('/dashboard'); // Redirect to dashboard
            }
        } catch (error) {
            alert('Invalid username or password.');
            console.error(error);
        }
    };

    return (
        <div className="login-container">
            <img src="/logo512.png" alt="Paperless Flow Logo" className="logo" />
            <login-h1>Login to your account</login-h1>

            {/* Login Form */}
            <login-form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </login-form>

            <p>
                Don't have an account? <a href="/signup">Sign Up to Create an account</a>
            </p>
        </div>
    );
};

export default LoginPage;
