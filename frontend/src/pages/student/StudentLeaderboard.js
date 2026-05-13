import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import './SharedStyles.css';

const LEVEL_NAMES = ['','Novice','Apprentice','Scholar','Adept','Expert','Master','Champion','Legend','Mythic','Grandmaster'];

const StudentLeaderboard = () => {
  const { user } = useAuth();
  const [global, setGlobal] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [tab, setTab] = useState('global');
  const [myRank, setMyRank] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/leaderboard'),
      axios.get('/api/leaderboard/weekly')
    ]).then(([g, w]) => {
      setGlobal(g.data.leaderboard);
      setMyRank(g.data.myRank);
      setWeekly(w.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const data = tab === 'global' ? global : weekly;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="welcome-row" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-heading">🏆 Leaderboard</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Students & Instructors compete together!</p>
          </div>
          {myRank > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #5B4FE8, #7C6FF7)', borderRadius: 14, padding: '12px 20px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Your Rank</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>#{myRank}</div>
            </div>
          )}
        </div>

        {/* Podium top 3 */}
        {!loading && global.length >= 3 && (
          <div className="podium-row">
            {[global[1], global[0], global[2]].map((entry, i) => {
              if (!entry) return null;
              const place = i === 1 ? 1 : i === 0 ? 2 : 3;
              const isMe = entry.id === user?.id;
              return (
                <div key={i} className={`podium-block place-${place} ${isMe ? 'is-me' : ''}`}>
                  <div className="podium-avatar">
                    {entry.name?.substring(0,2).toUpperCase()}
                    <div className="podium-role-badge">{entry.role === 'instructor' ? '🎓' : '📘'}</div>
                  </div>
                  <div className="podium-medal">{medals[place - 1]}</div>
                  <div className="podium-name">{entry.name}</div>
                  <div className="podium-xp">⚡ {entry.xp?.toLocaleString()} XP</div>
                  {entry.topBadge && <div style={{ fontSize: '1rem' }}>{entry.topBadge.icon}</div>}
                </div>
              );
            })}
          </div>
        )}

        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 4, padding: '16px 16px 0', borderBottom: '1px solid var(--border)' }}>
            {['global', 'weekly'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`tab-btn ${tab === t ? 'active' : ''}`}>
                {t === 'global' ? '🌍 All-Time' : '📅 This Week'}
              </button>
            ))}
          </div>

          {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Role</th>
                  <th>{tab === 'global' ? 'XP' : 'Weekly XP'}</th>
                  <th>Level</th>
                  {tab === 'global' && <th>Streak</th>}
                  {tab === 'global' && <th>Quizzes</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((entry, i) => {
                  const isMe = entry.id === user?.id || entry.name === user?.name;
                  return (
                    <tr key={i} className={`${i < 3 ? `rank-${i+1}` : ''} ${isMe ? 'my-row' : ''}`}>
                      <td>
                        {i < 3 ? <span className="rank-medal">{medals[i]}</span> : <span style={{ fontWeight: 700, color: 'var(--muted)' }}>#{entry.rank || i+1}</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="lb-avatar">{entry.name?.substring(0,2).toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{entry.name}</span>
                          {isMe && <span className="me-tag">YOU</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`role-pill ${entry.role}`}>
                          {entry.role === 'instructor' ? '🎓 Instructor' : '📘 Student'}
                        </span>
                      </td>
                      <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>⚡ {(entry.xp || entry.weeklyXp || 0).toLocaleString()}</span></td>
                      <td><span style={{ fontWeight: 600 }}>{LEVEL_NAMES[entry.level] || 'Novice'}</span></td>
                      {tab === 'global' && <td>{entry.streak ? `🔥 ${entry.streak}` : '—'}</td>}
                      {tab === 'global' && <td>{entry.quizzesTaken || 0}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentLeaderboard;
