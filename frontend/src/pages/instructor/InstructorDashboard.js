import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';

const LEVEL_NAMES = ['','Novice','Apprentice','Scholar','Adept','Expert','Master','Champion','Legend','Mythic','Grandmaster'];

const InstructorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/instructor/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const stats = [
    { icon: '📖', label: 'Total Courses', value: data?.totalCourses || 0, color: '#ede9fe' },
    { icon: '✅', label: 'Published', value: data?.publishedCourses || 0, color: '#d1fae5' },
    { icon: '👥', label: 'Total Students', value: data?.totalStudents || 0, color: '#dbeafe' },
    { icon: '🎯', label: 'Quiz Pass Rate', value: `${data?.quizPassRate || 0}%`, color: '#fef3c7' },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="welcome-row" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-heading">Welcome, {data?.name?.split(' ')[0]}! 🎓</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Manage your courses and track student progress</p>
          </div>
          <Link to="/instructor/courses/new" className="btn btn-primary">+ Create New Course</Link>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ background: s.color, border: 'none' }}>
              <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.6)' }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Instructor XP and rank */}
        <div className="card" style={{ padding: '20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{data?.level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{LEVEL_NAMES[data?.level] || 'Novice'} — Level {data?.level} Instructor</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>⚡ {data?.xp} XP — You compete on the leaderboard too!</div>
          </div>
          <Link to="/instructor/leaderboard" className="btn btn-secondary btn-sm">View Leaderboard 🏆</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* My Courses */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="section-header">
              <h2 className="section-title">My Courses</h2>
              <Link to="/instructor/courses" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {!data?.courses?.length ? (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div className="empty-icon">📖</div>
                <h3>No courses yet</h3>
                <p>Create your first course!</p>
                <Link to="/instructor/courses/new" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>+ New Course</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.courses.map(c => (
                  <Link to={`/instructor/courses/${c._id}`} key={c._id}
                    style={{ display: 'flex', gap: 12, padding: '10px', borderRadius: 10, background: 'var(--bg)', textDecoration: 'none', alignItems: 'center' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.lessons?.length} lessons · {c.enrolledCount} students</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: c.isPublished ? '#d1fae5' : '#fee2e2', color: c.isPublished ? '#059669' : '#dc2626' }}>
                      {c.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Students */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="section-header">
              <h2 className="section-title">Top Students</h2>
            </div>
            {!data?.topStudents?.length ? (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div className="empty-icon">👥</div>
                <h3>No students yet</h3>
                <p>Publish courses to attract students!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.topStudents.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px', borderRadius: 8 }}>
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 800, color: i < 3 ? '#FFB800' : 'var(--muted)', fontSize: '0.9rem' }}>#{i+1}</div>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {s.name?.substring(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>{LEVEL_NAMES[s.level] || 'Novice'}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>⚡ {s.xp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard;
