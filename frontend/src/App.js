import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ActivityPage from './components/ActivityPage';
import HomePageWithoutLogin from './components/HomePageWithoutLogin';
import ChangePasswordPage from './components/ChangePasswordPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePageWithoutLogin />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/homepage/:username" element={<HomePage />} />
                <Route path="/resetpassword" element={<ResetPasswordPage />} />
                <Route path="/activity/:username" element={<ActivityPage />} />
                <Route path="/homepage" element={<HomePageWithoutLogin/>} />
                <Route path="/changepassword" element={<ChangePasswordPage/>} />
            </Routes>
        </Router>
    );
};

export default App;
