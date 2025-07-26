// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import Navbar from './Navbar';

const API = 'https://codinghub-r3bn.onrender.com/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [newSection, setNewSection] = useState({ title: '', description: '', courseId: '' });
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'text',
    text: '',
    content: '',
    courseId: '',
    sectionIndex: ''
  });
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err.message);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      return alert('Please fill in both title and description for the course.');
    }
    try {
      await axios.post(`${API}/courses`, newCourse, getAuthHeaders());
      alert('✅ Course added successfully!');
      setNewCourse({ title: '', description: '' });
      fetchCourses();
    } catch (err) {
      alert('❌ Failed to add course: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddSection = async () => {
    if (!newSection.courseId || !newSection.title.trim() || !newSection.description.trim()) {
      return alert('Please fill in all section fields.');
    }
    try {
      await axios.post(`${API}/courses/${newSection.courseId}/sections`, {
        title: newSection.title,
        description: newSection.description
      }, getAuthHeaders());
      alert('✅ Section added successfully!');
      setNewSection({ title: '', description: '', courseId: '' });
      fetchCourses();
    } catch (err) {
      alert('❌ Failed to add section: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddLesson = async () => {
    const { courseId, sectionIndex, title, type, text, content } = newLesson;
    if (!courseId || sectionIndex === '' || !title.trim()) {
      return alert('Please fill in all required fields for the lesson.');
    }

    let steps = [];

    if (type === 'quiz') {
      if (quizQuestions.length === 0) {
        return alert('Please add at least one quiz question.');
      }
      steps = quizQuestions.map(q => ({
        type: 'quiz',
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        topic: q.topic
      }));
    } else {
      if (!text.trim()) {
        return alert('Please enter text/code/video content.');
      }
      steps = [{ type, text, content }];
    }

    try {
      await axios.post(`${API}/lessons`, {
        courseId,
        sectionIndex: parseInt(sectionIndex),
        title,
        steps
      }, getAuthHeaders());
      alert('✅ Lesson added successfully!');
      setNewLesson({
        title: '', type: 'text', text: '', content: '', courseId: '', sectionIndex: ''
      });
      setQuizQuestions([]);
      fetchCourses();
    } catch (err) {
      alert('❌ Failed to add lesson: ' + (err.response?.data?.error || err.message));
    }
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      question: '',
      options: ['', '', '', ''],
      answer: '',
      explanation: '',
      topic: ''
    }]);
  };

  const updateQuizQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const updateQuizOption = (qIndex, optIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIndex] = value;
    setQuizQuestions(updated);
  };

  const removeQuizQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <p>Manage Courses, Sections, and Lessons</p>

        <div className="cards-grid">
          {/* Add Course */}
          <div className="card">
            <h2>Add Course</h2>
            <input value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="Course title" />
            <input value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Course description" />
            <button onClick={handleAddCourse}>Add Course</button>
          </div>

          {/* Add Section */}
          <div className="card">
            <h2>Add Section</h2>
            <select value={newSection.courseId} onChange={e => setNewSection({ ...newSection, courseId: e.target.value })}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <input value={newSection.title} onChange={e => setNewSection({ ...newSection, title: e.target.value })} placeholder="Section title" />
            <input value={newSection.description} onChange={e => setNewSection({ ...newSection, description: e.target.value })} placeholder="Section description" />
            <button onClick={handleAddSection}>Add Section</button>
          </div>

          {/* Add Lesson */}
          <div className="card">
            <h2>Add Lesson</h2>
            <select value={newLesson.courseId} onChange={e => setNewLesson({ ...newLesson, courseId: e.target.value })}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <select value={newLesson.sectionIndex} onChange={e => setNewLesson({ ...newLesson, sectionIndex: e.target.value })}>
              <option value="">Select section</option>
              {courses.find(c => c._id === newLesson.courseId)?.sections.map((s, i) => (
                <option key={i} value={i}>{s.title}</option>
              ))}
            </select>
            <input value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} placeholder="Lesson title" />
            <select value={newLesson.type} onChange={e => setNewLesson({ ...newLesson, type: e.target.value })}>
              <option value="text">text</option>
              <option value="text-code">text-code</option>
              <option value="text-video">text-video</option>
              <option value="quiz">quiz</option>
            </select>

            {newLesson.type !== 'quiz' && (
              <>
                <input value={newLesson.text} onChange={e => setNewLesson({ ...newLesson, text: e.target.value })} placeholder="Text / Code / Video Description" />
                <input value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} placeholder="Code or URL" />
              </>
            )}

            {newLesson.type === 'quiz' && (
              <div className="quiz-builder">
                <h4>Quiz Questions</h4>
                {quizQuestions.map((q, i) => (
                  <div key={i} className="quiz-item">
                    <input placeholder="Question" value={q.question} onChange={e => updateQuizQuestion(i, 'question', e.target.value)} />
                    {q.options.map((opt, j) => (
                      <input key={j} placeholder={`Option ${j + 1}`} value={opt} onChange={e => updateQuizOption(i, j, e.target.value)} />
                    ))}
                    <input placeholder="Correct Answer" value={q.answer} onChange={e => updateQuizQuestion(i, 'answer', e.target.value)} />
                    <input placeholder="Explanation" value={q.explanation} onChange={e => updateQuizQuestion(i, 'explanation', e.target.value)} />
                    <input placeholder="Topic (e.g. useEffect)" value={q.topic} onChange={e => updateQuizQuestion(i, 'topic', e.target.value)} />
                    <button onClick={() => removeQuizQuestion(i)}>Remove</button>
                  </div>
                ))}
                <button onClick={addQuizQuestion}>+ Add Question</button>
              </div>
            )}

            <button onClick={handleAddLesson}>Add Lesson</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;