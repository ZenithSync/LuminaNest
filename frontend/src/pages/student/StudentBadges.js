import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';
import './SharedStyles.css';
import './StudentCourses.css';

const StudentBadges = () => {
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      axios.get('/api/badges'),
      axios.get('/api/badges/mine')
    ]).then(([all, mine]) => {
      setAllBadges(all.data);
      setMyBadges(mine.data.map(b => b._id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = ['all', 'level', 'quiz', 'streak', 'course', 'competition', 'special'];
  const filtered = allBadges.filter(b => filter === 'all' || b.category === filter);
  const earned = myBadges.length;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-heading">🏅 Badges & Achievements</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {earned} of {allBadges.length} badges earned
          </p>
        </div>

        {/* Progress bar */}
        <div className="card" style={{ padding: '20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Collection Progress</span>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{allBadges.length ? Math.round((earned/allBadges.length)*100) : 0}%</span>
          </div>
          <div className="xp-bar"><div className="xp-fill" style={{ width: `${allBadges.length ? (earned/allBadges.length)*100 : 0}%` }}></div></div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6 }}>{earned} earned · {allBadges.length - earned} remaining</div>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`filter-pill ${filter === cat ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="badges-grid">
            {filtered.map(badge => {
              const has = myBadges.includes(badge._id);
              return (
                <div key={badge._id} className={`badge-card ${has ? '' : 'locked'} badge-tier-${badge.tier}`}>
                  <div className="badge-card-icon">{has ? badge.icon : '🔒'}</div>
                  <div className="badge-card-name">{badge.name}</div>
                  <div className="badge-card-desc">{badge.description}</div>
                  <div className="badge-card-footer">
                    <span className={`badge-chip badge-${badge.tier}`}>{badge.tier}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>+{badge.xpBonus} XP</span>
                  </div>
                  {has && <div className="badge-earned-check">✓</div>}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentBadges;
