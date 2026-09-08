import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in both fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon-wrap" style={{ margin: '0 auto 12px', width: '52px', height: '52px' }}>
            <Brain size={28} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Log in to your Campus MindTrack account
          </p>
        </div>

        {error && (
          <div className="alert-box alert-warning" style={{ padding: '10px 14px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Username or Roll Number
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. student_cse, principal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '8px' }}>
            Quick 1-Click Test Accounts:
          </div>
          <div className="demo-account-pills">
            <button
              type="button"
              className="demo-pill"
              onClick={() => setDemoUser('rahul_cse', 'password')}
            >
              👨‍🎓 Student
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => setDemoUser('teacher_cse1', 'password')}
            >
              👩‍🏫 Teacher
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => setDemoUser('hod_cse', 'password')}
            >
              🏛️ HOD
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => setDemoUser('principal', 'password')}
            >
              🎓 Principal
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem' }}>
          New student on campus?{' '}
          <span
            onClick={() => onNavigate('register')}
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Register here
          </span>
        </div>
      </div>
    </div>
  );
}
