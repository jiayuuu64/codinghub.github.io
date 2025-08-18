import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Logins';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import LanguagePreference from './components/LanguagePreference';
import ExperiencePreference from './components/ExperiencePreference';
import CommitmentPreference from './components/CommitmentPreference';
import Profile from './components/Profile';
import Courses from './components/Courses';
import Sections from './components/Sections';
import Lesson from './components/Lesson';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';
import SelfEvalQuiz from './components/SelfEvalQuiz';
import AdminDashboard from './components/AdminDashboard';

import { isAuthenticated } from './utils/auth';

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/" />;
    }
    return children;
};

const AdminRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isAuth = isAuthenticated();

    if (!isAuth) return <Navigate to="/" />;
    if (!isAdmin) return <Navigate to="/" />;

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
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/courses/:courseId" element={<ProtectedRoute><Sections /></ProtectedRoute>} />
            <Route path="/lesson/:lessonId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
            <Route path="/language-preference" element={<LanguagePreference />} />
            <Route path="/experience-preference" element={<ExperiencePreference />} />
            <Route path="/commitment-preference" element={<CommitmentPreference />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/self-eval-quiz" element={<ProtectedRoute><SelfEvalQuiz /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
    );
};

export default App;