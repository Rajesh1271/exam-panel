import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function QuestionView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ questionText: '', options: [], correctAnswer: '' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3300/api/questions/${id}`);
        setQuestion(res.data);
        setForm({ questionText: res.data.questionText || '', options: res.data.options || [], correctAnswer: res.data.correctAnswer || '' });
      } catch (err) {
        console.error('Load question failed', err);
        alert('Failed to load question');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleChangeOption = (index, value) => {
    setForm(prev => {
      const opts = [...prev.options];
      opts[index] = value;
      return { ...prev, options: opts };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      await axios.put(`http://localhost:3300/api/questions/${id}`, payload);
      alert('Updated');
      setEditing(false);
      const res = await axios.get(`http://localhost:3300/api/questions/${id}`);
      setQuestion(res.data);
    } catch (err) {
      console.error('Update failed', err);
      alert('Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`http://localhost:3300/api/questions/${id}`);
      alert('Deleted');
      navigate('/questions-list');
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  if (loading) return <div className="m-6">Loading...</div>;
  if (!question) return <div className="m-6">Question not found</div>;

  return (
    <div className="m-6">
      <h2 className="text-2xl font-bold mb-4">Question Details</h2>

      {!editing ? (
        <div className="bg-white p-4 rounded shadow max-w-3xl">
          <p className="font-semibold mb-2">{question.questionText}</p>
          <ol className="list-decimal ml-5 mb-2">
            {(question.options || []).map((o, i) => (
              <li key={i} className={o === question.correctAnswer ? 'font-bold text-green-700' : ''}>{o}</li>
            ))}
          </ol>
          <div className="mt-4">
            <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Edit</button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-4 rounded shadow max-w-3xl">
          <div className="mb-3">
            <label className="block mb-1 font-medium">Question</label>
            <input value={form.questionText} onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))} className="w-full border p-2 rounded" />
          </div>

          {(form.options || []).map((opt, i) => (
            <div key={i} className="mb-2">
              <label className="block text-sm mb-1">Option {i+1}</label>
              <input value={opt} onChange={e => handleChangeOption(i, e.target.value)} className="w-full border p-2 rounded" />
            </div>
          ))}

          <div className="mb-3">
            <label className="block mb-1 font-medium">Correct Answer</label>
            <input value={form.correctAnswer} onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))} className="w-full border p-2 rounded" />
          </div>

          <div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mr-2">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
