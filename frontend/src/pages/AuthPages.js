import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

// ── Eye icon toggle for password visibility ───────────────────
const EyeIcon = ({ visible }) => visible
  ? ( // eye-open (password visible)
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
  : ( // eye-off (password hidden)
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a18.5 18.5 0 015.06-5.94M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 7 11 7a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

// ── Reusable password field with show/hide toggle ─────────────
const PasswordField = ({ id, label, value, onChange, autoComplete, minLength }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="pw-input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="form-input"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE — role-aware (Student login vs Instructor login)
// ═══════════════════════════════════════════════════════════════
export const LoginPage = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);

      // Make sure the account's actual role matches the tab the user picked.
      // e.g. an instructor account trying to sign in via the Student tab is blocked.
      if (data.user.role !== role) {
        logout();
        setError(
          role === 'student'
            ? 'This account is registered as an Instructor. Please use the Instructor tab to sign in.'
            : 'This account is registered as a Student. Please use the Student tab to sign in.'
        );
        return;
      }

      navigate(data.user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const isInstructor = role === 'instructor';

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon" style={{ width: 60, height: 60, fontSize: 28, borderRadius: 16 }}>
            {isInstructor ? '🎓' : '📘'}
          </div>
        </div>
        <h1 className="auth-title">{isInstructor ? 'Instructor Login' : 'Student Login'}</h1>
        <p className="auth-sub">
          {isInstructor ? 'Sign in to manage your courses' : 'Sign in to continue your learning journey'}
        </p>

        {/* Role selector — determines which login page is shown */}
        <div className="role-tabs">
          <button type="button" className={`role-tab ${role === 'student' ? 'active' : ''}`} onClick={() => { setRole('student'); setError(''); }}>
            📘 Student
          </button>
          <button type="button" className={`role-tab ${role === 'instructor' ? 'active' : ''}`} onClick={() => { setRole('instructor'); setError(''); }}>
            🎓 Instructor
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : `Sign In as ${isInstructor ? 'Instructor' : 'Student'}`}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════════════
export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await register(name, email, password, role);
      navigate(data.user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo"><div className="brand-icon" style={{width:60,height:60,fontSize:28,borderRadius:16}}>📖</div></div>
        <h1 className="auth-title">Join LuminaNest</h1>
        <p className="auth-sub">Create your account to get started</p>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="role-tabs">
          <button type="button" className={`role-tab ${role==='student'?'active':''}`} onClick={()=>setRole('student')}>
            📘 Student
          </button>
          <button type="button" className={`role-tab ${role==='instructor'?'active':''}`} onClick={()=>setRole('instructor')}>
            🎓 Instructor
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="form-input" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required />
          </div>

          <PasswordField
            id="reg-password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
          />

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : `Create ${role === 'instructor' ? 'Instructor' : 'Student'} Account`}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;