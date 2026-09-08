import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  AlertOctagon, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  Activity,
  X,
  Users,
  ArrowRight,
  Eye,
  Shield,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function HodDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCaseToAssign, setSelectedCaseToAssign] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'all' | 'teachers'

  const fetchDashboard = async () => {
    try {
      const res = await api.getHodDashboard();
      setData(res);
      if (res.teachers && res.teachers.length > 0) {
        setSelectedTeacherId(res.teachers[0].id);
      }
    } catch (err) {
      console.error('Error fetching HOD dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleOpenAssignModal = (caseItem) => {
    setSelectedCaseToAssign(caseItem);
    setMessage('');
    if (data?.teachers && data.teachers.length > 0) {
      setSelectedTeacherId(data.teachers[0].id);
    }
  };

  const handleCloseAssignModal = () => setSelectedCaseToAssign(null);

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedCaseToAssign) return;
    setAssigning(true);
    try {
      const res = await api.assignHodCase(selectedCaseToAssign.id, Number(selectedTeacherId));
      setMessage(res.message);
      fetchDashboard();
      setTimeout(() => handleCloseAssignModal(), 1200);
    } catch (err) {
      setMessage(err.message || 'Failed to assign teacher');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap" style={{ textAlign: 'center', padding: '100px 0' }}>
        <Activity size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading department triage dashboard...</p>
      </div>
    );
  }

  const activeCases = data?.activeCases || [];
  const allCases = data?.allCases || [];
  const teachers = data?.teachers || [];
  const flaggedCases = activeCases.filter((c) => c.status === 'FLAGGED');
  const assignedCases = activeCases.filter((c) => c.status === 'ASSIGNED');
  const inProgressCases = activeCases.filter((c) => c.status === 'IN_PROGRESS');

  // count cases per teacher
  const teacherCaseCount = {};
  allCases.forEach((c) => {
    if (c.assignedTeacher) {
      teacherCaseCount[c.assignedTeacher.id] = (teacherCaseCount[c.assignedTeacher.id] || 0) + 1;
    }
  });

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>{data?.department?.name} — HOD Triage Dashboard</h1>
            <p>
              Welcome, <strong>Dr. {user?.fullName}</strong> (Head of Department, {data?.department?.code}).
              When students are flagged for consecutive high stress, their cases arrive here.
              Your role is to review and <strong>delegate each case to a department teacher</strong> who will
              personally reach out, counsel, and track the student's recovery.
            </p>
            <div className="hero-stats-chips">
              <span className="hero-chip"><AlertOctagon size={14} /> Urgent Unassigned: {flaggedCases.length}</span>
              <span className="hero-chip"><UserCheck size={14} /> Assigned to Faculty: {data?.assignedCount || 0}</span>
              <span className="hero-chip"><Clock size={14} /> In-Progress Counseling: {data?.inProgressCount || 0}</span>
              <span className="hero-chip"><CheckCircle2 size={14} /> Resolved: {data?.resolvedCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="quick-actions-row">
        <div className="action-card action-card-rose" onClick={() => setActiveTab('triage')}>
          <div className="action-card-info">
            <h3>🚨 Urgent Triage Queue</h3>
            <p>{flaggedCases.length} student{flaggedCases.length !== 1 ? 's' : ''} need immediate delegation to faculty</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#be123c' }}>{flaggedCases.length}</div>
        </div>
        <div className="action-card action-card-emerald" onClick={() => setActiveTab('all')}>
          <div className="action-card-info">
            <h3>📋 Department Case Overview</h3>
            <p>View all student wellness cases across your department</p>
          </div>
          <div className="action-circle-btn"><ArrowRight size={18} /></div>
        </div>
        <div className="action-card action-card-amber" onClick={() => setActiveTab('teachers')}>
          <div className="action-card-info">
            <h3>👩‍🏫 Faculty Members</h3>
            <p>{teachers.length} teachers available in your department</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#92400e' }}>{teachers.length}</div>
        </div>
      </div>

      <div className="page-wrap">
        {/* Stats */}
        <div className="stats-cards-grid">
          <div className="stat-box">
            <div>
              <div className="stat-label">🔴 Flagged (Urgent)</div>
              <div className="stat-value" style={{ color: '#e11d48' }}>{data?.flaggedCount || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}><AlertOctagon size={22} /></div>
          </div>
          <div className="stat-box">
            <div>
              <div className="stat-label">🟠 Delegated to Faculty</div>
              <div className="stat-value" style={{ color: '#b45309' }}>{data?.assignedCount || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}><UserCheck size={22} /></div>
          </div>
          <div className="stat-box">
            <div>
              <div className="stat-label">🔵 Counseling In-Progress</div>
              <div className="stat-value" style={{ color: '#0284c7' }}>{data?.inProgressCount || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Clock size={22} /></div>
          </div>
          <div className="stat-box">
            <div>
              <div className="stat-label">🟢 Resolved</div>
              <div className="stat-value" style={{ color: '#166534' }}>{data?.resolvedCount || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><CheckCircle2 size={22} /></div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          {[
            { key: 'triage', label: `🚨 Triage Queue (${flaggedCases.length})` },
            { key: 'all', label: `📋 All Cases (${allCases.length})` },
            { key: 'teachers', label: `👩‍🏫 Faculty (${teachers.length})` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              background: activeTab === tab.key ? 'white' : 'transparent',
              color: activeTab === tab.key ? '#0c4a6e' : '#64748b',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ===== TRIAGE TAB: Flagged cases needing delegation ===== */}
        {activeTab === 'triage' && (
          <>
            {flaggedCases.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#166534', marginBottom: '8px' }}>No Urgent Cases!</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
                  All high-stress student alerts have been delegated to faculty counselors. 
                  When a new student triggers the 3+ day stress streak, their case will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {flaggedCases.map((c) => (
                  <div key={c.id} className="card" style={{ margin: 0, borderTop: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{c.student?.fullName}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span>🎫 {c.student?.rollNumber}</span>
                          {c.student?.phoneNumber && <span>📞 {c.student?.phoneNumber}</span>}
                          <span>🏛️ {c.student?.department?.code}</span>
                        </div>
                      </div>
                      <span className="status-badge status-FLAGGED">⚠️ FLAGGED</span>
                    </div>

                    <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#991b1b', marginBottom: '4px' }}>Student's Problem:</div>
                      <p style={{ fontSize: '0.9rem', color: '#7f1d1d', fontWeight: 600, marginBottom: '6px', lineHeight: 1.5 }}>
                        "{c.problemDescription || 'Consistently high stress detected across daily check-ins.'}"
                      </p>
                      <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                        🔥 Stress Streak: <strong>{c.stressStreakDays} day{c.stressStreakDays !== 1 ? 's' : ''}</strong> • Needs faculty counseling
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '14px' }}>
                      📅 Submitted: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently'}
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleOpenAssignModal(c)}>
                      <UserPlus size={16} /> Delegate to Faculty Counselor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== ALL CASES TAB ===== */}
        {activeTab === 'all' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Building2 size={20} color="#0284c7" /> All Department Wellness Cases ({allCases.length})</div>
            </div>
            {allCases.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-subtle)' }}>No cases have been registered in your department yet.</div>
            ) : (
              <div className="table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Stress Days</th>
                      <th>Assigned Faculty</th>
                      <th>Status</th>
                      <th>Teacher's Solution</th>
                      <th>Tracking Period</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCases.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.student?.fullName}</td>
                        <td>{c.student?.rollNumber}</td>
                        <td><span style={{ background: '#ffe4e6', color: '#e11d48', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>🔥 {c.stressStreakDays}d</span></td>
                        <td>{c.assignedTeacher ? <span style={{ fontWeight: 600, color: '#0369a1' }}>Prof. {c.assignedTeacher.fullName}</span> : <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>Unassigned</span>}</td>
                        <td><span className={`status-badge status-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '220px' }}>{c.teacherSolution ? c.teacherSolution.substring(0, 80) + (c.teacherSolution.length > 80 ? '…' : '') : <span style={{ fontStyle: 'italic' }}>Pending</span>}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.trackingStartDate ? `${c.trackingStartDate} → ${c.trackingEndDate}` : '—'}</td>
                        <td>{c.status === 'FLAGGED' && <button className="btn btn-primary btn-sm" onClick={() => handleOpenAssignModal(c)}><UserPlus size={14} /> Delegate</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== TEACHERS TAB ===== */}
        {activeTab === 'teachers' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {teachers.map((t) => {
                const caseCount = teacherCaseCount[t.id] || 0;
                const activeForTeacher = allCases.filter((c) => c.assignedTeacher?.id === t.id && (c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS')).length;
                const resolvedForTeacher = allCases.filter((c) => c.assignedTeacher?.id === t.id && c.status === 'RESOLVED').length;

                return (
                  <div key={t.id} className="card" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>
                        {t.fullName?.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', marginBottom: '2px' }}>Prof. {t.fullName}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{t.username} • {data?.department?.code}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#fef3c7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>ACTIVE</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>{activeForTeacher}</div>
                      </div>
                      <div style={{ flex: 1, background: '#dcfce7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534' }}>RESOLVED</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{resolvedForTeacher}</div>
                      </div>
                      <div style={{ flex: 1, background: '#e0f2fe', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#075985' }}>TOTAL</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1' }}>{caseCount}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== ASSIGNMENT MODAL ===== */}
      {selectedCaseToAssign && (
        <div className="modal-overlay" onClick={handleCloseAssignModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0c4a6e' }}>Delegate Student to Faculty Counselor</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleCloseAssignModal}><X size={16} /></button>
            </div>

            {/* Student info */}
            <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '14px', marginBottom: '16px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#991b1b', marginBottom: '4px' }}>Student Requiring Support:</div>
              <div style={{ fontSize: '0.9rem', color: '#7f1d1d', marginBottom: '8px' }}>
                <strong>{selectedCaseToAssign.student?.fullName}</strong> ({selectedCaseToAssign.student?.rollNumber}) — {selectedCaseToAssign.student?.department?.code}
                {selectedCaseToAssign.student?.phoneNumber && (
                  <span style={{ marginLeft: '10px', color: '#0284c7', fontWeight: 600 }}>📞 {selectedCaseToAssign.student?.phoneNumber}</span>
                )}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#991b1b', background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <strong>Reported Problem:</strong> "{selectedCaseToAssign.problemDescription || 'Elevated stress reported.'}"
              </div>
            </div>

            {message && (
              <div className="alert-box alert-success" style={{ padding: '10px 14px', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} /> {message}
              </div>
            )}

            <form onSubmit={handleAssignTeacher}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                  Select Faculty Counselor from {data?.department?.name}:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {teachers.map((t) => {
                    const activeForT = allCases.filter((c) => c.assignedTeacher?.id === t.id && (c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS')).length;
                    const isSelected = String(selectedTeacherId) === String(t.id);
                    return (
                      <label key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                        border: `2px solid ${isSelected ? '#0284c7' : 'var(--border)'}`,
                        background: isSelected ? '#f0f9ff' : 'white',
                      }}>
                        <input type="radio" name="teacherId" value={t.id} checked={isSelected} onChange={(e) => setSelectedTeacherId(e.target.value)} style={{ display: 'none' }} />
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isSelected ? '#0284c7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : '#64748b', fontWeight: 800 }}>
                          {t.fullName?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Prof. {t.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{t.username} • Currently handling: {activeForT} case{activeForT !== 1 ? 's' : ''}</div>
                        </div>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`, background: isSelected ? '#0284c7' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseAssignModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={assigning}>
                  <UserCheck size={16} />
                  {assigning ? 'Delegating...' : 'Confirm Delegation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
