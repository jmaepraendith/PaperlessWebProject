import React, { useState } from 'react';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Check for empty fields
        if (!username || !password) {
            alert('All fields are required.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:13889/paperless/login', { username, password });
            console.log('API Response:', response.data);
        
            if (response.data.error) {
                alert(response.data.error);
            } else {
                alert('Login successful!');
                navigate('/homepage'); 
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                alert('User not found.');
            } else if (error.response && error.response.status === 401) {
                alert('Invalid password.');
            } else {
                alert('An error occurred during login.');
            }
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container">
            <img src="/logo512.png" alt="Paperless Flow Logo" className="logo" />
            <login-h1>Login to your account</login-h1>
            <form onSubmit={handleLogin}>
                <div className="form-group">
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
                <div className="form-group">
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
            </form>
            <p>
                Don't have an account? <a href="/signup">Sign Up</a>
            </p>
        </div>
    );
};

export default LoginPage;
