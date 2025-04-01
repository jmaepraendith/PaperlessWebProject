import React, { useState, useEffect } from 'react';
import '../styles/SignupPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();
    const [pdpaAccepted, setPdpaAccepted] = useState(false);

    
    useEffect(() => {
        const container = document.querySelector('.signup-container');
        if (container) {
            container.classList.add('fade-in');
        }
    }, []);
    
    const validateForm = () => {
        const errors = {};
        
        if (!username.trim()) {
            errors.username = 'Username is required';
        } else if (username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }
        
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email address is invalid';
        }
        
        if (!password.trim()) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        if (!confirmPassword.trim()) {
            errors.confirmPassword = 'confirmPassword is required';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!pdpaAccepted) {
            errors.pdpa = 'You must accept the PDPA policy to continue';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await axios.post('http://localhost:13889/paperless/signup', {
                username,
                password,
                email
            });
            
            setIsLoading(false);
            
            if (response.data.error) {
                setFormErrors({ general: response.data.error });
            } else {
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Signup successful! Redirecting to login...';
                document.body.appendChild(successMessage);
                
                setTimeout(() => {
                    successMessage.remove();
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setIsLoading(false);
            
            if (error.response && error.response.status === 409) {
                setFormErrors({ general: 'Username or email already exists' });
            } else {
                setFormErrors({ general: 'An error occurred during signup. Please try again.' });
            }
            console.error('Signup error:', error);
        }
    };
    
    return (
        <div className="signup-container">
            {/* Left Column - Branding Section */}
            <div className="signup-left">
                <img src="/greenlogo.png" alt="Paperless Flow Logo" className="logo-signup" />
                <div className="signup-left-content">
                    <h2>Welcome to Paperless Flow</h2>
                    <p>
                        Simplify your accounting with AI-powered automation. Effortlessly extract data from receipts, purchase orders and invoices, minimize errors, and manage documents securely—all in one platform.
                    </p>
                    

                </div>
            </div>
            
            {/* Right Column - Form Section */}
            <div className="signup-right">
                <h1 className="signup-h1">Create an account</h1>
                
                {formErrors.general && (
                    <div className="error-message">
                        {formErrors.general}
                    </div>
                )}
                
                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            className={`input_signup ${formErrors.username ? 'error-input' : ''}`}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            disabled={isLoading}
                        />
                        {formErrors.username && <div className="input-error">{formErrors.username}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            className={`input_signup ${formErrors.email ? 'error-input' : ''}`}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                        {formErrors.email && <div className="input-error">{formErrors.email}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            className={`input_signup ${formErrors.password ? 'error-input' : ''}`}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            disabled={isLoading}
                        />
                        {formErrors.password && <div className="input-error">{formErrors.password}</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            className={`input_signup ${formErrors.confirmPassword ? 'error-input' : ''}`}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            disabled={isLoading}
                        />
                        {formErrors.confirmPassword && (
                            <div className="input-error">{formErrors.confirmPassword}</div>
                        )}
                    </div>
                    
                    <button 
                        className="submit_signup" 
                        type="submit" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Sign Up'}
                    </button>

                    <div className="form-group pdpa-checkbox">
                        <label htmlFor="pdpa" className="pdpa-label">
                            <input
                                type="checkbox"
                                id="pdpa"
                                checked={pdpaAccepted}
                                onChange={(e) => setPdpaAccepted(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span className="pdpa-front">
                                I have read and accept the{' '}
                                <span className="tooltip">
                                    PDPA policy
                                    <span className="tooltiptext">
                                        We value your privacy. By signing up, you consent to the collection and use of your personal data in accordance with our PDPA policy. Your filea will be used to train LLM model.
                                    </span>
                                </span>.
                            </span>
                        </label>
                        {!pdpaAccepted && formErrors.pdpa && (
                            <div className="input-error">{formErrors.pdpa}</div>
                        )}
                    </div>



                </form>
                <p>
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;