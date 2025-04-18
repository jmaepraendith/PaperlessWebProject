import React, { useState } from 'react';
import '../styles/ResetPasswordPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // Tracks the current step
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGetCode = async (e) => {
        e.preventDefault();
        
        if (!username) {
            alert('Please enter your username.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:13889/paperless/reset-password', { username });
            alert(response.data.message);
            setStep(2); 
        } catch (error) {
            alert(error.response?.data?.error || 'Error sending verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCode = async (e) => {
        e.preventDefault();
        
        if (!code || !newPassword || !confirmPassword) {
            alert('Please enter all required fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
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
                            className="input_login"
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button 
                        className="submit_login" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Sending Code...' : 'Get Code'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleConfirmCode}>
                    <p className="info-message">
                        We've sent a verification code to your email. Please check your inbox.
                    </p>
                    
                    <div className="form-group">
                        <label htmlFor="code">2. Enter the Verification Code</label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            className="input_login"
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter Code"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">3. Enter Your New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            className="input_login"
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter New Password"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">4. Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            className="input_login"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button 
                        className="submit_login" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Confirming...' : 'Confirm'}
                    </button>
                </form>
            )}

            <p>
                <a href="#" onClick={() => step === 2 ? setStep(1) : navigate('/login')}>
                    {step === 2 ? 'Go Back' : 'Back to Login'}
                </a>
            </p>
        </div>
    );
};

export default ResetPasswordPage;