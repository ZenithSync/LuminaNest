import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import StudentCertificates from './pages/student/StudentCertificates';
import StudentLeaderboard from './pages/student/StudentLeaderboard';
import StudentBadges from './pages/student/StudentBadges';

// Instructor pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import InstructorCourseBuilder from './pages/instructor/InstructorCourseBuilder';
import InstructorLeaderboard from './pages/instructor/InstructorLeaderboard';

import './App.css';

const PrivateRoute = ({ children, roleRequired }) => {
  const { token, user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!token) return <Navigate to="/login" />;
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to={user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'} />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (token) return <Navigate to={user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'} />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Student */}
          <Route path="/dashboard" element={<PrivateRoute roleRequired="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute roleRequired="student"><StudentCourses /></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute roleRequired="student"><StudentCourseDetail /></PrivateRoute>} />
          <Route path="/certificates" element={<PrivateRoute roleRequired="student"><StudentCertificates /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute roleRequired="student"><StudentLeaderboard /></PrivateRoute>} />
          <Route path="/badges" element={<PrivateRoute roleRequired="student"><StudentBadges /></PrivateRoute>} />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={<PrivateRoute roleRequired="instructor"><InstructorDashboard /></PrivateRoute>} />
          <Route path="/instructor/courses" element={<PrivateRoute roleRequired="instructor"><InstructorCourses /></PrivateRoute>} />
          <Route path="/instructor/courses/new" element={<PrivateRoute roleRequired="instructor"><InstructorCourseBuilder /></PrivateRoute>} />
          <Route path="/instructor/courses/:id" element={<PrivateRoute roleRequired="instructor"><InstructorCourseBuilder /></PrivateRoute>} />
          <Route path="/instructor/leaderboard" element={<PrivateRoute roleRequired="instructor"><InstructorLeaderboard /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
