import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // Tracks the current step
    const navigate = useNavigate();

    // Function to request verification code
    const handleGetCode = async (e) => {
        e.preventDefault();
        
        if (!username) {
            alert('Please enter your username.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:13889/paperless/reset-password', { username });
            alert(response.data.message);
            setStep(2); // Move to the next step
        } catch (error) {
            alert(error.response?.data?.error || 'Error sending verification code.');
        }
    };

    // Function to verify code and update password
    const handleConfirmCode = async (e) => {
        e.preventDefault();
        
        if (!code || !newPassword || !confirmPassword) {
            alert('Please enter all required fields.');
            return;
        }

        // Check for password match
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:13889/paperless/verify-code', {
                username,
                code,
                newPassword
            });

            alert(response.data.message);
            navigate('/login'); 
        } catch (error) {
            alert(error.response?.data?.error || 'Error verifying code or updating password.');
        }
    };

    return (
        <div className="container">
            <img src="/logo512.png" alt="Paperless Flow Logo" className="logo-login" />
            <h1 className="login-h1">Reset Your Password</h1>

            {step === 1 && (
                <form onSubmit={handleGetCode}>
                    <div className="form-group">
                        <label htmlFor="username">1. Enter your Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            className='input_login'
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <button className='getcode' type="submit">Get Code</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleConfirmCode}>
                    <p>We've sent a verification code to your email. Please check your inbox.</p>
                    
                    <div className="form-group">
                        <label htmlFor="code">2. Enter the Verification Code</label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            className='input'
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter Code"
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="form-group">
                            <label htmlFor="newPassword">3. Enter Your New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                className='input'
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter New Password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                className='input_signup'
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>
                    </div>

                    <button className='confirm' type="submit">Confirm</button>
                </form>
            )}
        </div>
    );
};

export default ResetPasswordPage;
