import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/shared/Sidebar';
import './InstructorCourseBuilder.css';

const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10 };
const EMPTY_LESSON = { title: '', content: '', contentType: 'text', contentUrl: '', duration: 0, quiz: [], passingScore: 70 };

const InstructorCourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [activeLessonIdx, setActiveLessonIdx] = useState(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [uploading, setUploading] = useState(false);

  // New course form
  const [form, setForm] = useState({ title: '', description: '', category: 'Programming', level: 'Beginner', duration: '', tags: '', xpReward: 100, thumbnail: '' });

  // Lesson form
  const [lessonForm, setLessonForm] = useState({ ...EMPTY_LESSON });
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    if (!isNew && id) {
      axios.get(`/api/instructor/courses/${id}`).then(r => {
        setCourse(r.data.course);
        const c = r.data.course;
        setForm({ title: c.title, description: c.description, category: c.category, level: c.level, duration: c.duration, tags: c.tags?.join(', ') || '', xpReward: c.xpReward, thumbnail: c.thumbnail });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id, isNew]);

  const createCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('/api/instructor/courses', form);
      setCourse(res.data);
      setActiveTab('lessons');
      setMsg('Course created! Now add lessons.');
      navigate(`/instructor/courses/${res.data._id}`, { replace: true });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  const addLesson = async () => {
    if (!lessonForm.title) return setMsg('Lesson title is required');
    setSaving(true);
    try {
      const payload = { ...lessonForm, quiz: quizQuestions };
      const res = await axios.post(`/api/instructor/courses/${course._id}/lessons`, payload);
      setCourse(res.data);
      setLessonForm({ ...EMPTY_LESSON });
      setQuizQuestions([]);
      setShowQuizBuilder(false);
      setMsg('Lesson added!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('content', file);
    try {
      const res = await axios.post(`/api/instructor/courses/${course._id}/lessons/0/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLessonForm(f => ({ ...f, contentUrl: res.data.url, contentType: res.data.contentType }));
      setMsg(`File uploaded: ${res.data.originalName}`);
    } catch (err) {
      setMsg('Upload failed. Check file type/size.');
    } finally { setUploading(false); }
  };

  const publishToggle = async () => {
    try {
      const res = await axios.put(`/api/instructor/courses/${course._id}/publish`);
      setCourse(c => ({ ...c, isPublished: res.data.isPublished }));
      setMsg(res.data.isPublished ? 'Course is now live! 🎉' : 'Course unpublished.');
    } catch (err) { setMsg('Error'); }
  };

  const addQuestion = () => setQuizQuestions(q => [...q, { ...EMPTY_QUESTION, options: ['', '', '', ''] }]);
  const removeQuestion = (i) => setQuizQuestions(q => q.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, val) => {
    setQuizQuestions(q => q.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };
  const updateOption = (qi, oi, val) => {
    setQuizQuestions(q => q.map((item, idx) => idx === qi ? { ...item, options: item.options.map((o, j) => j === oi ? val : o) } : item));
  };

  const deleteLesson = async (idx) => {
    if (!window.confirm('Delete this lesson?')) return;
    await axios.delete(`/api/instructor/courses/${course._id}/lessons/${idx}`);
    const res = await axios.get(`/api/instructor/courses/${course._id}`);
    setCourse(res.data.course);
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="welcome-row" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-heading">{isNew ? '✨ Create New Course' : `Edit: ${course?.title}`}</h1>
            {course && <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{course.lessons?.length} lessons · {course.enrolledCount || 0} students</p>}
          </div>
          {course && (
            <button onClick={publishToggle} className={`btn ${course.isPublished ? 'btn-danger' : 'btn-primary'}`}>
              {course.isPublished ? '⏸ Unpublish' : '🚀 Publish Course'}
            </button>
          )}
        </div>

        {msg && <div className="alert alert-info" style={{ marginBottom: 20 }}>{msg}</div>}

        {/* Tabs */}
        {course && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
            {['info', 'lessons'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn ${activeTab === t ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>
                {t === 'info' ? '📋 Course Info' : '📚 Lessons & Quizzes'}
              </button>
            ))}
          </div>
        )}

        {/* Course Info */}
        {(activeTab === 'info' || isNew) && (
          <div className="card" style={{ padding: '28px', maxWidth: 700 }}>
            <h2 style={{ marginBottom: 22 }}>Course Details</h2>
            <form onSubmit={isNew ? createCourse : (e) => e.preventDefault()}>
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required placeholder="e.g. Full Stack Web Development" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="What will students learn?" rows={4} />
              </div>
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input className="form-input" value={form.thumbnail} onChange={e => setForm(f => ({...f, thumbnail: e.target.value}))} placeholder="https://images.unsplash.com/..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {['Programming', 'Data Science', 'Design', 'Marketing', 'Business', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={form.level} onChange={e => setForm(f => ({...f, level: e.target.value}))}>
                    {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} placeholder="e.g. 10 hours" />
                </div>
                <div className="form-group">
                  <label className="form-label">XP Reward</label>
                  <input type="number" className="form-input" value={form.xpReward} onChange={e => setForm(f => ({...f, xpReward: parseInt(e.target.value)}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="e.g. React, JavaScript, Web" />
              </div>
              {isNew && (
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Course & Add Lessons →'}</button>
              )}
            </form>
          </div>
        )}

        {/* Lessons */}
        {activeTab === 'lessons' && course && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Add Lesson */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ marginBottom: 20 }}>Add New Lesson</h2>
              <div className="form-group">
                <label className="form-label">Lesson Title *</label>
                <input className="form-input" value={lessonForm.title} onChange={e => setLessonForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Introduction to Variables" />
              </div>
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <div className="content-type-grid">
                  {[{v:'text',label:'📝 Text'},{v:'video',label:'📹 Video'},{v:'youtube',label:'▶️ YouTube'},{v:'ppt',label:'📊 PPT'},{v:'pdf',label:'📄 PDF'}].map(ct => (
                    <button key={ct.v} type="button" onClick={() => setLessonForm(f => ({...f, contentType: ct.v, contentUrl: ''}))}
                      className={`content-type-btn ${lessonForm.contentType === ct.v ? 'active' : ''}`}>{ct.label}</button>
                  ))}
                </div>
              </div>

              {lessonForm.contentType === 'text' && (
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-textarea" value={lessonForm.content} onChange={e => setLessonForm(f => ({...f, content: e.target.value}))} placeholder="Write lesson content here..." rows={4} />
                </div>
              )}
              {lessonForm.contentType === 'youtube' && (
                <div className="form-group">
                  <label className="form-label">YouTube URL</label>
                  <input className="form-input" value={lessonForm.contentUrl} onChange={e => setLessonForm(f => ({...f, contentUrl: e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              )}
              {['video', 'ppt', 'pdf'].includes(lessonForm.contentType) && (
                <div className="form-group">
                  <label className="form-label">Upload File {lessonForm.contentType === 'video' ? '(MP4, max 100MB)' : lessonForm.contentType === 'ppt' ? '(PPT, PPTX)' : '(PDF)'}</label>
                  <div className="upload-zone">
                    <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileUpload}
                      accept={lessonForm.contentType === 'video' ? 'video/*' : lessonForm.contentType === 'ppt' ? '.ppt,.pptx' : '.pdf'} />
                    <label htmlFor="file-upload" className="upload-label">
                      {uploading ? '⏳ Uploading...' : lessonForm.contentUrl ? `✅ ${lessonForm.contentUrl.split('/').pop()}` : '📁 Click to upload'}
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <input type="number" className="form-input" value={lessonForm.duration} onChange={e => setLessonForm(f => ({...f, duration: parseInt(e.target.value) || 0}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Score (%)</label>
                  <input type="number" className="form-input" value={lessonForm.passingScore} min={50} max={100} onChange={e => setLessonForm(f => ({...f, passingScore: parseInt(e.target.value) || 70}))} />
                </div>
              </div>

              {/* Quiz Builder Toggle */}
              <div className="quiz-builder-toggle" onClick={() => setShowQuizBuilder(s => !s)}>
                <span>🎮 MCQ Quiz</span>
                <span>{quizQuestions.length > 0 ? `${quizQuestions.length} questions` : 'Add questions'}</span>
                <span>{showQuizBuilder ? '▲' : '▼'}</span>
              </div>

              {showQuizBuilder && (
                <div className="quiz-builder">
                  {quizQuestions.map((q, qi) => (
                    <div key={qi} className="quiz-q-editor">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <strong style={{ fontSize: '0.88rem' }}>Question {qi + 1}</strong>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>✕</button>
                      </div>
                      <input className="form-input" style={{ marginBottom: 8 }} value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} placeholder="Enter question..." />
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                          <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(qi, 'correctAnswer', oi)} />
                          <input className="form-input" style={{ flex: 1 }} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${['A','B','C','D'][oi]}...`} />
                        </div>
                      ))}
                      <input className="form-input" style={{ marginTop: 4, fontSize: '0.82rem' }} value={q.explanation} onChange={e => updateQuestion(qi, 'explanation', e.target.value)} placeholder="Explanation (optional)..." />
                      <input type="number" className="form-input" style={{ marginTop: 6, width: 100 }} value={q.points} onChange={e => updateQuestion(qi, 'points', parseInt(e.target.value) || 10)} placeholder="Points" />
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion} style={{ width: '100%' }}>+ Add Question</button>
                </div>
              )}

              <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={addLesson} disabled={saving}>
                {saving ? 'Adding...' : '+ Add Lesson'}
              </button>
            </div>

            {/* Existing Lessons */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ marginBottom: 20 }}>Course Lessons ({course.lessons?.length})</h2>
              {!course.lessons?.length ? (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <div className="empty-icon">📚</div>
                  <h3>No lessons yet</h3>
                  <p>Add your first lesson using the form.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {course.lessons.map((l, idx) => (
                    <div key={idx} className="lesson-row-item">
                      <div className="lesson-row-num">{idx + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{l.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: 8, marginTop: 3 }}>
                          <span>{l.contentType === 'text' ? '📝' : l.contentType === 'video' ? '📹' : l.contentType === 'youtube' ? '▶️' : l.contentType === 'ppt' ? '📊' : '📄'} {l.contentType}</span>
                          <span>⏱ {l.duration}m</span>
                          {l.quiz?.length > 0 && <span className="quiz-tag">📝 {l.quiz.length}Q</span>}
                        </div>
                      </div>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteLesson(idx)}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorCourseBuilder;
