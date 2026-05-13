import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/shared/Sidebar';
import './SharedStyles.css';

const gradeColors = { Distinction: '#10b981', Merit: '#3b82f6', Pass: '#6b7280' };

const StudentCertificates = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/certificates').then(r => { setCerts(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-heading" style={{ marginBottom: 6 }}>🎓 My Certificates</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 28 }}>Your earned certificates of achievement</p>

        {certs.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">🏅</div>
            <h3>No certificates yet</h3>
            <p>Complete a course to earn your first certificate!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {certs.map(cert => (
              <div key={cert._id} className="cert-card">
                <div className="cert-top">
                  <div className="cert-seal">
                    <span>📖</span>
                  </div>
                  <div>
                    <div className="cert-platform-name">LuminaNest</div>
                    <div className="cert-tagline">Certificate of Completion</div>
                  </div>
                  <div className="cert-grade" style={{ color: gradeColors[cert.grade] || '#6b7280' }}>
                    {cert.grade}
                  </div>
                </div>
                <div className="cert-body-main">
                  <div className="cert-presented">This certificate is presented to</div>
                  <div className="cert-name">{user?.name}</div>
                  <div className="cert-for">for successfully completing</div>
                  <div className="cert-course-name">{cert.course?.title}</div>
                  <div className="cert-level">
                    <span className={`level-badge level-${(cert.course?.level||'Beginner').toLowerCase()}`}>{cert.course?.level}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{cert.course?.category}</span>
                  </div>
                </div>
                <div className="cert-footer-row">
                  <div>
                    <div className="cert-detail-label">Certificate ID</div>
                    <div className="cert-detail-val mono">{cert.certificateId}</div>
                  </div>
                  <div>
                    <div className="cert-detail-label">Issued</div>
                    <div className="cert-detail-val">{new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div className="cert-detail-label">Score</div>
                    <div className="cert-detail-val" style={{ color: gradeColors[cert.grade] || '#6b7280', fontWeight: 700 }}>{cert.finalScore}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentCertificates;
