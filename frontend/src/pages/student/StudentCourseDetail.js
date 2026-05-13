import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';
import './StudentCourseDetail.css';

const StudentCourseDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [quizState, setQuizState] = useState(null); // null | 'active' | 'result'
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [quizTimer, setQuizTimer] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [newBadgePopup, setNewBadgePopup] = useState([]);
  const [msg, setMsg] = useState('');
  const timerRef = useRef(null);

  const load = () => {
    setLoading(true);
    axios.get(`/api/courses/${id}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (quizState === 'active') {
      timerRef.current = setInterval(() => setQuizTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [quizState]);

  const enroll = async () => {
    setEnrolling(true);
    try {
      await axios.post(`/api/courses/${id}/enroll`);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    } finally { setEnrolling(false); }
  };

  const startQuiz = (lessonIdx) => {
    setActiveLesson(lessonIdx);
    setQuizState('active');
    setCurrentQ(0);
    setSelectedAnswers([]);
    setQuizTimer(0);
    setQuizResult(null);
  };

  const selectAnswer = (answerIdx) => {
    const updated = [...selectedAnswers];
    updated[currentQ] = answerIdx;
    setSelectedAnswers(updated);
  };

  const nextQuestion = () => {
    const quiz = data.course.lessons[activeLesson].quiz;
    if (currentQ < quiz.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const res = await axios.post('/api/quiz/submit', {
        courseId: id,
        lessonIndex: activeLesson,
        answers: selectedAnswers,
        timeTaken: quizTimer
      });
      setQuizResult(res.data);
      setQuizState('result');
      if (res.data.newBadges?.length) setNewBadgePopup(res.data.newBadges);
      load();
    } catch (err) {
      setMsg('Quiz submission error');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!data) return <div className="page-layout"><Sidebar /><main className="main-content"><p>Course not found</p></main></div>;

  const { course, progress, enrolled } = data;
  const completedLessons = progress?.completedLessons || [];

  const renderContent = (lesson) => {
    if (lesson.contentType === 'video' && lesson.contentUrl) {
      return <video src={lesson.contentUrl} controls className="lesson-video" />;
    }
    if (lesson.contentType === 'youtube' && lesson.contentUrl) {
      const ytId = lesson.contentUrl.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return ytId ? <iframe className="lesson-video" src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen title={lesson.title}></iframe> : null;
    }
    if (lesson.contentType === 'pdf' && lesson.contentUrl) {
      return <iframe src={lesson.contentUrl} className="lesson-pdf" title={lesson.title}></iframe>;
    }
    if (lesson.contentType === 'ppt' && lesson.contentUrl) {
      return (
        <div className="ppt-viewer">
          <div className="ppt-icon">📊</div>
          <h3>{lesson.title}</h3>
          <a href={lesson.contentUrl} download className="btn btn-primary">⬇️ Download Presentation</a>
        </div>
      );
    }
    return <div className="lesson-text-content"><p>{lesson.content || 'No content available.'}</p></div>;
  };

  const renderQuiz = () => {
    const quiz = course.lessons[activeLesson]?.quiz;
    if (!quiz || quiz.length === 0) return null;
    const q = quiz[currentQ];
    const totalQ = quiz.length;

    if (quizState === 'result' && quizResult) {
      return (
        <div className="quiz-result-overlay">
          <div className="quiz-result-card">
            <div className={`quiz-result-icon ${quizResult.passed ? 'passed' : 'failed'}`}>
              {quizResult.passed ? '🎉' : '😅'}
            </div>
            <h2>{quizResult.passed ? 'Quiz Passed!' : 'Not quite!'}</h2>
            <div className="quiz-score-big">
              <span style={{ color: quizResult.passed ? '#10b981' : '#ef4444' }}>{quizResult.score}%</span>
            </div>
            <div className="quiz-result-stats">
              <div className="qr-stat"><span>⚡</span><div><strong>+{quizResult.xpEarned}</strong><span>XP Earned</span></div></div>
              <div className="qr-stat"><span>🎯</span><div><strong>{quizResult.rawScore}/{quizResult.maxScore}</strong><span>Points</span></div></div>
              <div className="qr-stat"><span>⏱</span><div><strong>{quizTimer}s</strong><span>Time</span></div></div>
              <div className="qr-stat"><span>🔄</span><div><strong>#{quizResult.attemptNumber}</strong><span>Attempt</span></div></div>
            </div>

            {quizResult.results && (
              <div className="quiz-answers-review">
                <h3>Answer Review</h3>
                {quizResult.results.map((r, i) => (
                  <div key={i} className={`answer-review-item ${r.correct ? 'correct' : 'wrong'}`}>
                    <div className="ar-q">Q{i+1}: {r.question}</div>
                    <div className="ar-a">
                      {r.options.map((opt, j) => (
                        <div key={j} className={`ar-opt ${j===r.correctAnswer?'correct-opt':''} ${j===r.selectedAnswer&&!r.correct?'wrong-opt':''}`}>
                          {j===r.correctAnswer ? '✓' : j===r.selectedAnswer ? '✗' : '○'} {opt}
                        </div>
                      ))}
                    </div>
                    {r.explanation && <div className="ar-exp">💡 {r.explanation}</div>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
              {!quizResult.passed && (
                <button className="btn btn-primary" onClick={() => startQuiz(activeLesson)}>Retry Quiz 🔄</button>
              )}
              <button className="btn btn-secondary" onClick={() => { setQuizState(null); setActiveLesson(null); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="quiz-overlay">
        <div className="quiz-modal">
          <div className="quiz-header">
            <div className="quiz-progress-info">
              <span className="quiz-q-num">Question {currentQ + 1} of {totalQ}</span>
              <span className="quiz-timer">⏱ {quizTimer}s</span>
            </div>
            <div className="quiz-prog-bar">
              <div className="quiz-prog-fill" style={{ width: `${((currentQ) / totalQ) * 100}%` }}></div>
            </div>
          </div>

          <div className="quiz-body">
            <h2 className="quiz-question">{q.question}</h2>
            <div className="quiz-options">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`quiz-option ${selectedAnswers[currentQ] === i ? 'selected' : ''}`}
                  onClick={() => selectAnswer(i)}
                >
                  <span className="opt-letter">{['A','B','C','D'][i]}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-footer">
            <div className="quiz-xp-hint">⚡ Pass to earn XP! First try = 1.5x bonus</div>
            <button
              className="btn btn-primary"
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQ] === undefined}
            >
              {currentQ < totalQ - 1 ? 'Next Question →' : 'Submit Quiz 🚀'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content" style={{ position: 'relative' }}>
        {/* Badge popup */}
        {newBadgePopup.length > 0 && (
          <div className="badge-popup">
            <div className="badge-popup-inner">
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
              <h3>New Badge{newBadgePopup.length > 1 ? 's' : ''} Earned!</h3>
              {newBadgePopup.map((b, i) => (
                <div key={i} className={`badge-chip badge-${b.tier}`} style={{ marginTop: 8 }}>
                  {b.icon} {b.name}
                </div>
              ))}
              <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => setNewBadgePopup([])}>
                Awesome! 🙌
              </button>
            </div>
          </div>
        )}

        {quizState && renderQuiz()}

        {/* Course header */}
        <div className="card" style={{ padding: '28px', marginBottom: 24, display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className={`level-badge level-${(course.level||'Beginner').toLowerCase()}`}>{course.level}</span>
              <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{course.category}</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>{course.title}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}>{course.description}</p>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16 }}>
              <span>👨‍🏫 {course.instructorName}</span>
              <span>📚 {course.lessons?.length} lessons</span>
              <span>⏱ {course.duration}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>⚡ +{course.xpReward} XP</span>
            </div>
            {msg && <div className="alert alert-info">{msg}</div>}
            {!enrolled ? (
              <button className="btn btn-primary" onClick={enroll} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : '🚀 Enroll Free & Start Learning'}
              </button>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>Your Progress</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{progress?.percentComplete || 0}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress?.percentComplete || 0}%` }}></div></div>
                {progress?.isCompleted && <div className="alert alert-success" style={{ marginTop: 12 }}>🎉 Course Completed! Certificate earned.</div>}
              </div>
            )}
          </div>
          {course.thumbnail && (
            <div style={{ width: 260, height: 180, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Lessons */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: 18 }}>Course Lessons</h2>
          <div className="lessons-list">
            {course.lessons?.map((lesson, idx) => {
              const done = completedLessons.includes(idx);
              const hasQuiz = lesson.quiz && lesson.quiz.length > 0;
              const isOpen = activeLesson === idx && quizState === null;

              return (
                <div key={idx} className={`lesson-item ${done ? 'done' : ''}`}>
                  <div className="lesson-header" onClick={() => {
                    if (!enrolled) return;
                    setActiveLesson(isOpen ? null : idx);
                    setQuizState(null);
                  }}>
                    <div className="lesson-left">
                      <div className={`lesson-num ${done ? 'done' : ''}`}>{done ? '✓' : idx + 1}</div>
                      <div>
                        <div className="lesson-title-text">{lesson.title}</div>
                        <div className="lesson-meta">
                          {lesson.contentType !== 'text' && <span className="content-tag">{lesson.contentType === 'video' ? '📹 Video' : lesson.contentType === 'ppt' ? '📊 PPT' : lesson.contentType === 'pdf' ? '📄 PDF' : lesson.contentType === 'youtube' ? '▶️ YouTube' : '📝 Text'}</span>}
                          <span>⏱ {lesson.duration} min</span>
                          {hasQuiz && <span className="quiz-tag">📝 Quiz ({lesson.quiz.length}Q)</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {done && <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Completed ✅</span>}
                      <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{enrolled ? (isOpen ? '▲' : '▼') : '🔒'}</span>
                    </div>
                  </div>

                  {isOpen && enrolled && (
                    <div className="lesson-body">
                      {renderContent(lesson)}
                      {hasQuiz && (
                        <div className="lesson-quiz-cta">
                          <div className="quiz-cta-info">
                            <span className="quiz-cta-icon">🎮</span>
                            <div>
                              <strong>Lesson Quiz</strong>
                              <span>{lesson.quiz.length} questions • Earn XP by passing!</span>
                            </div>
                          </div>
                          <button className="btn btn-gold" onClick={() => startQuiz(idx)}>
                            {done ? 'Retake Quiz' : 'Start Quiz 🚀'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentCourseDetail;
