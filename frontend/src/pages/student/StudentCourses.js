import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');

  useEffect(() => {
    axios.get('/api/courses').then(r => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(courses.map(c => c.category))];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = courses.filter(c =>
    (filter === 'All' || c.category === filter) &&
    (levelFilter === 'All' || c.level === levelFilter)
  );

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-heading">Explore Courses</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Find your next skill to master</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`filter-pill ${filter === cat ? 'active' : ''}`}>{cat}</button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 6px' }}></div>
          {levels.map(lv => (
            <button key={lv} onClick={() => setLevelFilter(lv)}
              className={`filter-pill level ${levelFilter === lv ? 'active' : ''}`}>{lv}</button>
          ))}
        </div>

        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No courses found</h3>
              <p>Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="course-grid">
              {filtered.map(c => (
                <Link to={`/courses/${c._id}`} key={c._id} className="course-card">
                  <div className="course-thumb">
                    <img src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} alt={c.title} />
                    <span className={`course-level-tag level-bg-${(c.level||'Beginner').toLowerCase()}`}>{c.level}</span>
                  </div>
                  <div className="course-body">
                    <div className="course-cat">{c.category}</div>
                    <div className="course-title">{c.title}</div>
                    <div className="course-instructor">by {c.instructorName}</div>
                    <div className="course-footer">
                      <span>⭐ {c.rating || '4.5'}</span>
                      <span>📚 {c.lessons?.length || 0} lessons</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>+{c.xpReward || 100} XP</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default StudentCourses;
