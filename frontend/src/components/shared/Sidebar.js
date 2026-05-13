import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentNav = [
  { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { label: 'My Courses', icon: '📚', path: '/courses' },
  { label: 'Certificates', icon: '🎓', path: '/certificates' },
  { label: 'Badges', icon: '🏅', path: '/badges' },
  { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
];

const instructorNav = [
  { label: 'Dashboard', icon: '⊞', path: '/instructor/dashboard' },
  { label: 'My Courses', icon: '📖', path: '/instructor/courses' },
  { label: 'Leaderboard', icon: '🏆', path: '/instructor/leaderboard' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nav = user?.role === 'instructor' ? instructorNav : studentNav;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">📖</div>
        <div>
          <div className="brand-name">LuminaNest</div>
          <span className={`brand-role ${user?.role}`}>{user?.role === 'instructor' ? '🎓 Instructor' : '📘 Student'}</span>
        </div>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Menu</div>
        {nav.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏏</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
