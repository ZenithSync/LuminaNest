import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';
import './StudentDashboard.css';
import './SharedStyles.css';
import './StudentCourses.css';

const LEVEL_NAMES = ['', 'Novice', 'Apprentice', 'Scholar', 'Adept', 'Expert', 'Master', 'Champion', 'Legend', 'Mythic', 'Grandmaster'];

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const stats = [
    { icon: '🔥', label: 'Day Streak', value: data?.streak || 0, color: '#fef3c7', iconBg: '#fde68a' },
    { icon: '⚡', label: 'Total XP', value: data?.xp || 0, color: '#ede9fe', iconBg: '#c4b5fd' },
    { icon: '📚', label: 'Courses', value: data?.totalCourses || 0, color: '#dbeafe', iconBg: '#93c5fd' },
    { icon: '🏅', label: 'Badges', value: data?.badgeCount || 0, color: '#fce7f3', iconBg: '#f9a8d4' },
  ];

  const tierColor = { bronze: '#CD7F32', silver: '#A8A9AD', gold: '#FFD700', platinum: '#B0C4DE', special: '#9333ea' };
  const coursesInProgress = data?.enrolledCourses?.filter(c => !c.isCompleted) || [];
  const coursesCompleted = data?.enrolledCourses?.filter(c => c.isCompleted) || [];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {/* Welcome */}
        <div className="welcome-row">
          <div>
            <h1 className="page-heading">Welcome back, {data?.name?.split(' ')[0]}! 👋</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Continue your learning journey</p>
          </div>
          {data?.rank > 0 && (
            <div className="rank-badge-big">
              <span>🏆</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Rank #{data.rank}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Global</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ background: s.color, border: 'none' }}>
              <div className="stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
              <div className="stat-value">{s.value.toLocaleString()}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Level & XP */}
        <div className="card level-card">
          <div className="level-card-left">
            <div className="level-orb">
              <span className="level-num">{data?.level}</span>
            </div>
            <div>
              <div className="level-name">{LEVEL_NAMES[data?.level] || 'Novice'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Level {data?.level}</div>
            </div>
          </div>
          <div className="level-card-right">
            <div className="xp-bar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>XP Progress</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>{data?.xp} / {data?.nextLevelXp} XP</span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${data?.xpProgress || 0}%` }}></div>
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6 }}>
              {(data?.nextLevelXp || 0) - (data?.xp || 0)} XP to next level
            </div>
          </div>
        </div>

        {/* Badges */}
        {data?.badges?.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div className="section-header">
              <h2 className="section-title">Recent Badges</h2>
              <Link to="/badges" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            <div className="badges-row">
              {data.badges.slice(-5).map((b, i) => (
                <div key={i} className={`badge-big badge-${b.tier}`} title={b.description}>
                  <div className="badge-big-icon">{b.icon}</div>
                  <div className="badge-big-name">{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Learning */}
        {coursesInProgress.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div className="section-header">
              <h2 className="section-title">Continue Learning</h2>
              <Link to="/courses" className="btn btn-secondary btn-sm">Browse More</Link>
            </div>
            <div className="course-grid">
              {coursesInProgress.map(c => (
                <Link to={`/courses/${c._id}`} key={c._id} className="course-card">
                  <div className="course-thumb">
                    <img src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} alt={c.title} />
                    <span className={`course-level-tag level-bg-${(c.level||'Beginner').toLowerCase()}`}>{c.level}</span>
                  </div>
                  <div className="course-body">
                    <div className="course-cat">{c.category}</div>
                    <div className="course-title">{c.title}</div>
                    <div className="course-instructor">by {c.instructorName}</div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${c.percentComplete}%` }}></div></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.78rem', color: 'var(--muted)' }}>
                      <span>{c.percentComplete}% complete</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>+{c.totalXpEarned} XP</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {coursesCompleted.length > 0 && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Completed Courses ✅</h2>
              <Link to="/certificates" className="btn btn-secondary btn-sm">View Certificates</Link>
            </div>
            <div className="course-grid">
              {coursesCompleted.map(c => (
                <div key={c._id} className="course-card" style={{ opacity: 0.85 }}>
                  <div className="course-thumb">
                    <img src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} alt={c.title} />
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:'2rem' }}>✅</span>
                    </div>
                  </div>
                  <div className="course-body">
                    <div className="course-title">{c.title}</div>
                    <div style={{ color:'#10b981', fontWeight:600, fontSize:'0.85rem' }}>Course Completed! +{c.totalXpEarned} XP earned</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!data?.enrolledCourses?.length && (
          <div className="card empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses yet!</h3>
            <p>Start your learning journey by enrolling in a course.</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Courses</Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
