import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => (
  <div className="landing">
    <nav className="landing-nav">
      <div className="landing-brand">
        <div className="brand-icon">📖</div>
        <span className="brand-name">LuminaNest</span>
      </div>
      <div className="landing-nav-actions">
        <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
      </div>
    </nav>

    <section className="hero">
      <div className="hero-text">
        <div className="hero-tag">🚀 The Future of Learning</div>
        <h1>Ignite Your Learning Journey with <span className="hero-brand">LuminaNest</span></h1>
        <p>Master new skills with expert courses, gamified quizzes, daily streaks, badges, and compete on global leaderboards.</p>
        <div className="hero-actions">
          <Link to="/register?role=student" className="btn btn-primary">Start Learning Free</Link>
          <Link to="/register?role=instructor" className="btn btn-outline">Become an Instructor</Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><strong>4K+</strong><span>Learners</span></div>
          <div className="hero-stat-div"></div>
          <div className="hero-stat"><strong>200+</strong><span>Courses</span></div>
          <div className="hero-stat-div"></div>
          <div className="hero-stat"><strong>50+</strong><span>Instructors</span></div>
        </div>
      </div>
      <div className="hero-visual">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=80" alt="Learning" />
        <div className="hero-float hero-float-1">🔥 7-day streak!</div>
        <div className="hero-float hero-float-2">🏆 #1 Leaderboard</div>
        <div className="hero-float hero-float-3">🥇 Badge Earned!</div>
      </div>
    </section>

    <section className="features">
      <h2>Everything You Need to Excel</h2>
      <div className="features-grid">
        {[
          { icon: '🎮', title: 'Gamified Quizzes', desc: 'Earn XP, level up, and unlock badges with every quiz you pass.', color: '#ede9fe' },
          { icon: '🏆', title: 'Live Leaderboard', desc: 'Compete with students AND instructors on a shared global leaderboard.', color: '#fef3c7' },
          { icon: '🥇', title: 'Level Badges', desc: 'Earn Beginner, Intermediate, and Advanced badges as you grow.', color: '#fce7f3' },
          { icon: '🎓', title: 'Verified Certificates', desc: 'Earn certificates with grades (Pass, Merit, Distinction) on completion.', color: '#d1fae5' },
          { icon: '📹', title: 'Rich Content', desc: 'Instructors can upload videos, PPTs, PDFs, and YouTube links.', color: '#dbeafe' },
          { icon: '📊', title: 'Dual Dashboards', desc: 'Separate dashboards for students and instructors with deep analytics.', color: '#fef9c3' },
        ].map((f, i) => (
          <div key={i} className="feature-card" style={{ background: f.color }}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="cta-section">
      <div className="cta-inner">
        <h2>Ready to Start Learning?</h2>
        <p>Join thousands of learners already growing their skills on LuminaNest.</p>
        <Link to="/register" className="btn btn-gold">Join Now — It's Free! 🚀</Link>
      </div>
    </section>
  </div>
);

export default LandingPage;
