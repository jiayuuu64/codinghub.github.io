import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import LanguagePreference from './components/LanguagePreference';
import ExperiencePreference from './components/ExperiencePreference';
import CommitmentPreference from './components/CommitmentPreference';
import { isAuthenticated } from './utils/auth';

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/" />;
    }
    return children;
};

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/language-preference" element={<LanguagePreference />} />
            <Route path="/experience-preference" element={<ExperiencePreference />} />
            <Route path="/commitment-preference" element={<CommitmentPreference />} />
        </Routes>
    );
};

export default App;
