import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../student/SharedStyles.css';

const InstructorLeaderboard = () => {
  const { user } = useAuth();
  const [global, setGlobal] = useState([]);
  const [myRank, setMyRank] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/leaderboard').then(r => {
      setGlobal(r.data.leaderboard);
      setMyRank(r.data.myRank);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="welcome-row" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-heading">🏆 Global Competition</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Instructors compete with students!</p>
          </div>
          {myRank > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 14, padding: '12px 20px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Your Rank</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>#{myRank}</div>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #f0f4ff, #fef3c7)', borderRadius: '14px 14px 0 0' }}>
            <p style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>
              🎯 Earn XP by taking quizzes & completing courses — Instructors and Students compete together!
            </p>
          </div>
          {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Role</th>
                  <th>Total XP</th>
                  <th>Level</th>
                  <th>Quizzes</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {global.map((entry, i) => {
                  const isMe = entry.id === user?.id;
                  return (
                    <tr key={i} className={`${i < 3 ? `rank-${i+1}` : ''} ${isMe ? 'my-row' : ''}`}>
                      <td>{i < 3 ? <span className="rank-medal">{medals[i]}</span> : <span style={{ fontWeight: 700, color: 'var(--muted)' }}>#{entry.rank}</span>}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="lb-avatar">{entry.name?.substring(0,2).toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{entry.name}</span>
                          {isMe && <span className="me-tag">YOU</span>}
                        </div>
                      </td>
                      <td><span className={`role-pill ${entry.role}`}>{entry.role === 'instructor' ? '🎓 Instructor' : '📘 Student'}</span></td>
                      <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>⚡ {entry.xp?.toLocaleString()}</span></td>
                      <td><span style={{ fontWeight: 600 }}>Lv.{entry.level}</span></td>
                      <td>{entry.quizzesTaken}</td>
                      <td>{entry.streak ? `🔥 ${entry.streak}` : '—'}</td>
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

export default InstructorLeaderboard;
