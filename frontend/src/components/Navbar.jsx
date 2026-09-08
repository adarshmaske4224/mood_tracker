import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo" onClick={() => onNavigate && onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrap">
            <Brain size={22} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1 }}>Campus MindTrack</div>
            <div style={{ fontSize: '0.688rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
              Mental Health & Wellness Care
            </div>
          </div>
        </div>

        {user ? (
          <div className="nav-actions">
            <div className="user-badge">
              <UserIcon size={16} color="#0284c7" />
              <span style={{ fontWeight: 600 }}>{user.fullName}</span>
              {user.rollNumber && (
                <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>({user.rollNumber})</span>
              )}
              {user.department && (
                <span style={{ fontWeight: 600, color: '#0369a1', fontSize: '0.75rem', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                  {user.department.code}
                </span>
              )}
              <span className={`role-pill role-${user.role}`}>
                {user.role}
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={logout} title="Logout">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="nav-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('login')}>
              Sign In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('register')}>
              Student Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
