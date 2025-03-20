import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ActivityPage from './components/ActivityPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/homepage/:username" element={<HomePage />} />
                <Route path="/resetpassword" element={<ResetPasswordPage />} />
                <Route path="/activity/:username" element={<ActivityPage />} />
                
            </Routes>
        </Router>
    );
};

export default App;
