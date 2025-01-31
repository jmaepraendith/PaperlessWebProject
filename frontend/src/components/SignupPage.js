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

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            await axios.post('http://localhost:3000/api/users/signup', {
                email,
                username,
                password,
            });

            alert('Account created successfully!');
            navigate('/login'); // Redirect to login page
        } catch (error) {
            alert('Signup failed. Please try again.');
            console.error(error);
        }
    };

    return (
        <div className="signup-container">
            <img src="/logo512.png" alt="Paperless Flow Logo" className="logo" />
            <signup-h1>Create new account</signup-h1>
            <signup-form onSubmit={handleSignup}>
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
            </signup-form>
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
