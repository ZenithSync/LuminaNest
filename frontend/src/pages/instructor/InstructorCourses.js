import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/instructor/courses').then(r => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="welcome-row" style={{ marginBottom: 24 }}>
          <h1 className="page-heading">My Courses</h1>
          <Link to="/instructor/courses/new" className="btn btn-primary">+ Create Course</Link>
        </div>
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : courses.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">📖</div>
            <h3>No courses yet</h3>
            <p>Create your first course to start teaching!</p>
            <Link to="/instructor/courses/new" className="btn btn-primary" style={{ marginTop: 20 }}>+ Create Course</Link>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map(c => (
              <Link to={`/instructor/courses/${c._id}`} key={c._id} className="course-card">
                <div className="course-thumb">
                  <img src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} alt={c.title} />
                  <span className={`course-level-tag level-bg-${(c.level||'Beginner').toLowerCase()}`}>{c.level}</span>
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span style={{ padding: '3px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: c.isPublished ? '#d1fae5' : '#fee2e2', color: c.isPublished ? '#059669' : '#dc2626' }}>
                      {c.isPublished ? '● Live' : '○ Draft'}
                    </span>
                  </div>
                </div>
                <div className="course-body">
                  <div className="course-cat">{c.category}</div>
                  <div className="course-title">{c.title}</div>
                  <div className="course-footer">
                    <span>📚 {c.lessons?.length || 0} lessons</span>
                    <span>👥 {c.enrolledCount || 0} students</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>⚡ {c.xpReward} XP</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorCourses;
