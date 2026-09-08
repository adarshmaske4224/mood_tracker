import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Brain, UserPlus, ArrowLeft } from 'lucide-react';

export default function Register({ onNavigate }) {
  const { register } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    username: '',
    password: '',
    departmentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getDepartments()
      .then((data) => {
        setDepartments(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, departmentId: data[0].id }));
        }
      })
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        rollNumber: formData.rollNumber,
        username: formData.username,
        password: formData.password,
        departmentId: Number(formData.departmentId),
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon-wrap" style={{ margin: '0 auto 12px', width: '52px', height: '52px' }}>
            <Brain size={28} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Student Registration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track daily moods and receive personalized faculty mental care
          </p>
        </div>

        {error && (
          <div className="alert-box alert-warning" style={{ padding: '10px 14px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert-box alert-success" style={{ padding: '10px 14px', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              className="input-field"
              placeholder="e.g. Adarsh Sharma"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                className="input-field"
                placeholder="e.g. 21CS099"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Department
              </label>
              <select
                name="departmentId"
                className="select-field"
                value={formData.departmentId}
                onChange={handleChange}
                required
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} — {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              className="input-field"
              placeholder="Unique campus username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}
