import React, { useState } from 'react';
import '../styles/SignupPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
    
        // Check for empty fields
        if (!email || !username || !password || !confirmPassword) {
            alert('All fields are required.');
            return;
        }
    
        // Check for email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            alert('Invalid email format. Please enter a valid email.');
            return;
        }
    
        // Check for password length
        if (password.length < 8) {
            alert('Password should be at least 8 characters long.');
            return;
        }
    
        // Check for password match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:13889/paperless/signup', { email, username, password });
            console.log('API Response:', response.data);
        
            if (response.data.error) {
                alert(response.data.error);
            } else {
                alert('Signup successful!');
                navigate('/login');
            }
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            alert('Signup failed. Please try again.');
        }
    };

    return (
        <div className="signup-container">
            <img src="/logo512.png" alt="Paperless Flow Logo" className="logo" />
            <h1>Create new account</h1>
            <form onSubmit={handleSignup}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                </div>
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
            <p>
                or Use without Login
            </p>
        </div>
    );
};

export default SignupPage;
