import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Send, 
  FileText, 
  AlertTriangle,
  HeartHandshake,
  Activity,
  X,
  Phone,
  MessageSquare,
  ClipboardList,
  Eye,
  Calendar,
  ArrowRight,
  Brain,
  Sparkles,
  BookOpen,
  Star,
  BarChart3,
  Shield
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const MOOD_LABELS = ['', '😢 Awful', '😟 Low', '😐 Okay', '🙂 Good', '😄 Great'];
const MOOD_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [guidanceNotice, setGuidanceNotice] = useState(null);
  const [confirmResolving, setConfirmResolving] = useState(false);
  const [dashboardToast, setDashboardToast] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [contactNotes, setContactNotes] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.getTeacherDashboard();
      setData(res);
    } catch (err) {
      console.error('Error loading teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleOpenDetail = async (caseItem) => {
    setSelectedCase(caseItem);
    setDetailLoading(true);
    setActionMessage('');
    setGuidanceNotice(null);
    setConfirmResolving(false);
    setSolutionText(caseItem.teacherSolution || '');
    setContactNotes('');
    try {
      const res = await api.getTeacherStudentDetail(caseItem.id);
      setStudentDetail(res);
    } catch (err) {
      console.error('Failed to get student detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCase(null);
    setStudentDetail(null);
    setGuidanceNotice(null);
    setConfirmResolving(false);
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solutionText || !solutionText.trim()) return;
    setActionLoading(true);
    setGuidanceNotice(null);
    try {
      const trimmedSolution = solutionText.trim();
      const res = await api.submitTeacherSolution(selectedCase.id, trimmedSolution);
      setGuidanceNotice({
        type: 'success',
        message: res.message || 'Guidance updated successfully! 7-day mood recovery tracking is active.'
      });

      // Update current selectedCase state immediately
      const updatedCase = {
        ...selectedCase,
        teacherSolution: trimmedSolution,
        status: selectedCase.status === 'ASSIGNED' ? 'IN_PROGRESS' : selectedCase.status
      };
      setSelectedCase(updatedCase);

      // Update dashboard cases in-place
      setData((prev) => {
        if (!prev) return prev;
        const updateCaseInList = (list) => (list || []).map((c) =>
          c.id === selectedCase.id ? { ...c, teacherSolution: trimmedSolution, status: c.status === 'ASSIGNED' ? 'IN_PROGRESS' : c.status } : c
        );
        return {
          ...prev,
          activeCases: updateCaseInList(prev.activeCases),
          allCases: updateCaseInList(prev.allCases),
        };
      });

      // Also refresh student detail and full dashboard
      api.getTeacherStudentDetail(selectedCase.id).then((updated) => {
        if (updated) {
          setStudentDetail(updated);
          if (updated.studentCase) setSelectedCase(updated.studentCase);
        }
      }).catch(console.error);

      fetchDashboard();
    } catch (err) {
      setGuidanceNotice({
        type: 'error',
        message: err.message || 'Failed to submit guidance'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveCase = async () => {
    setActionLoading(true);
    setGuidanceNotice(null);
    try {
      const res = await api.resolveTeacherCase(selectedCase.id);
      const studentName = selectedCase.student?.fullName || 'Student';

      // Update local state: remove from activeCases, update in allCases
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          activeCases: (prev.activeCases || []).filter((c) => c.id !== selectedCase.id),
          allCases: (prev.allCases || []).map((c) =>
            c.id === selectedCase.id ? { ...c, status: 'RESOLVED' } : c
          ),
        };
      });

      setDashboardToast({
        type: 'success',
        message: `Case for ${studentName} marked as RESOLVED! It has moved to Complete Case History.`,
      });

      handleCloseDetail();
      fetchDashboard();
    } catch (err) {
      setGuidanceNotice({
        type: 'error',
        message: err.message || 'Failed to resolve case'
      });
    } finally {
      setActionLoading(false);
      setConfirmResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap" style={{ textAlign: 'center', padding: '100px 0' }}>
        <Activity size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading faculty counselor dashboard...</p>
      </div>
    );
  }

  const activeCases = data?.activeCases || [];
  const allCases = data?.allCases || [];
  const pendingSolutionCount = activeCases.filter((c) => c.status === 'ASSIGNED').length;
  const inProgressCount = activeCases.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = allCases.filter((c) => c.status === 'RESOLVED').length;

  // Helpers for student detail modal
  const getStressColor = (val) => val >= 7 ? '#ef4444' : val >= 4 ? '#f59e0b' : '#10b981';
  const getStressBg = (val) => val >= 7 ? '#fef2f2' : val >= 4 ? '#fffbeb' : '#f0fdf4';
  const getStressLabel = (val) => val >= 7 ? '🔴 High' : val >= 4 ? '🟡 Moderate' : '🟢 Low';

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>Faculty Counselor Dashboard</h1>
            <p>
              Welcome, <strong>{user?.fullName}</strong> — {user?.department?.name} Department.
              You are the frontline mental health support for students assigned to you by your HOD.
              Review their issues, reach out, guide them, and track their mood recovery for 7 days.
            </p>
            <div className="hero-stats-chips">
              <span className="hero-chip"><Users size={14} /> Active Cases: {activeCases.length}</span>
              <span className="hero-chip"><AlertTriangle size={14} /> Awaiting Your Action: {pendingSolutionCount}</span>
              <span className="hero-chip"><Clock size={14} /> 7-Day Tracking: {inProgressCount}</span>
              <span className="hero-chip"><CheckCircle size={14} /> Resolved: {resolvedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="quick-actions-row">
        <div className="action-card action-card-rose">
          <div className="action-card-info">
            <h3>🚨 Needs Your Attention</h3>
            <p>{pendingSolutionCount} student{pendingSolutionCount !== 1 ? 's' : ''} waiting for guidance</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#be123c' }}>{pendingSolutionCount}</div>
        </div>
        <div className="action-card action-card-emerald">
          <div className="action-card-info">
            <h3>📊 Active Monitoring</h3>
            <p>{inProgressCount} student{inProgressCount !== 1 ? 's' : ''} in 7-day mood recovery tracking</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>{inProgressCount}</div>
        </div>
        <div className="action-card action-card-amber">
          <div className="action-card-info">
            <h3>✅ Successfully Helped</h3>
            <p>{resolvedCount} student{resolvedCount !== 1 ? 's' : ''} recovered & resolved</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#92400e' }}>{resolvedCount}</div>
        </div>
      </div>

      <div className="page-wrap">
        {/* Dashboard Toast / Alert */}
        {dashboardToast && (
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              padding: '14px 20px', 
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              color: '#065f46',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={22} color="#059669" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dashboardToast.message}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {activeTab !== 'history' && (
                <button 
                  className="btn btn-sm" 
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => { setActiveTab('history'); setDashboardToast(null); }}
                >
                  View Case History →
                </button>
              )}
              <button 
                onClick={() => setDashboardToast(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              background: activeTab === 'active' ? 'white' : 'transparent',
              color: activeTab === 'active' ? '#0c4a6e' : '#64748b',
              boxShadow: activeTab === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <span style={{ marginRight: '8px' }}>🔥</span> Active Cases ({activeCases.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              background: activeTab === 'history' ? 'white' : 'transparent',
              color: activeTab === 'history' ? '#0c4a6e' : '#64748b',
              boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <span style={{ marginRight: '8px' }}>📋</span> All Cases ({allCases.length})
          </button>
        </div>

        {/* Active Cases — Student Cards */}
        {activeTab === 'active' && (
          <>
            {activeCases.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#166534', marginBottom: '8px' }}>All Clear!</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                  No students currently need your attention. You'll be notified when the HOD delegates new cases.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {activeCases.map((c) => (
                  <div key={c.id} className="card" style={{ margin: 0, cursor: 'pointer', borderLeft: `4px solid ${c.status === 'ASSIGNED' ? '#f59e0b' : '#0284c7'}`, transition: 'transform 0.15s' }} onClick={() => handleOpenDetail(c)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{c.student?.fullName}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span>🎫 {c.student?.rollNumber}</span>
                          <span>🏛️ {c.student?.department?.code}</span>
                          {c.student?.phoneNumber && (
                            <span style={{ color: '#0284c7', fontWeight: 600 }}>📞 {c.student?.phoneNumber}</span>
                          )}
                        </div>
                      </div>
                      <span className={`status-badge status-${c.status}`}>{c.status.replace('_', ' ')}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ flex: 1, background: '#fef2f2', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Stress Streak</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>🔥 {c.stressStreakDays}d</div>
                      </div>
                      <div style={{ flex: 1, background: c.status === 'ASSIGNED' ? '#fef3c7' : '#e0f2fe', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: c.status === 'ASSIGNED' ? '#92400e' : '#075985', textTransform: 'uppercase' }}>Action</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: c.status === 'ASSIGNED' ? '#b45309' : '#0369a1' }}>
                          {c.status === 'ASSIGNED' ? 'Provide Guidance' : 'Monitoring'}
                        </div>
                      </div>
                    </div>

                    {c.teacherSolution && (
                      <div style={{ fontSize: '0.85rem', color: '#0369a1', background: '#f0f9ff', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                        <strong>Your guidance:</strong> {c.teacherSolution.substring(0, 100)}{c.teacherSolution.length > 100 ? '...' : ''}
                      </div>
                    )}

                    {c.trackingStartDate && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Tracking: {c.trackingStartDate} → {c.trackingEndDate}
                      </div>
                    )}

                    <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '12px' }} onClick={(e) => { e.stopPropagation(); handleOpenDetail(c); }}>
                      <Eye size={16} /> Review Student's Situation
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title"><FileText size={20} color="#0284c7" /> Complete Case History</div>
            </div>
            <div className="table-wrap">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Department</th>
                    <th>Stress Streak</th>
                    <th>Status</th>
                    <th>Tracking Period</th>
                    <th>Solution</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allCases.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-subtle)' }}>No cases assigned yet.</td></tr>
                  ) : allCases.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.student?.fullName}</td>
                      <td>{c.student?.rollNumber}</td>
                      <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>{c.student?.department?.code}</span></td>
                      <td><span style={{ background: '#ffe4e6', color: '#e11d48', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>🔥 {c.stressStreakDays}d</span></td>
                      <td><span className={`status-badge status-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.trackingStartDate ? `${c.trackingStartDate} → ${c.trackingEndDate}` : '—'}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{c.teacherSolution ? c.teacherSolution.substring(0, 80) + (c.teacherSolution.length > 80 ? '…' : '') : '—'}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => handleOpenDetail(c)}><Eye size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========== STUDENT DETAIL MODAL (Full Case Review) ========== */}
      {selectedCase && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '92vh' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.5rem', color: '#0c4a6e' }}>{selectedCase.student?.fullName}</h2>
                  <span className={`status-badge status-${selectedCase.status}`}>{selectedCase.status.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>🎫 Roll No: <strong>{selectedCase.student?.rollNumber}</strong></span>
                  <span>📞 Phone: <strong style={{ color: '#0284c7' }}>{selectedCase.student?.phoneNumber || 'Not provided'}</strong></span>
                  <span>🏛️ Department: <strong>{selectedCase.student?.department?.code}</strong></span>
                  <span>🔥 Consecutive high-stress days: <strong style={{ color: '#dc2626' }}>{selectedCase.stressStreakDays}</strong></span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}><X size={18} /></button>
            </div>

            {actionMessage && (
              <div className="alert-box alert-success" style={{ padding: '10px 14px', fontSize: '0.875rem' }}>
                <CheckCircle size={18} /> <span>{actionMessage}</span>
              </div>
            )}

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Activity size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Loading student's mood history & details...</p>
              </div>
            ) : (
              <div>
                {/* ===== SECTION 1: Student's Problem Summary ===== */}
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <AlertTriangle size={18} /> Student's Problem & Issue Summary
                  </h4>
                  {selectedCase.problemDescription && (
                    <div style={{ background: 'white', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Student's Reported Problem:
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#7f1d1d' }}>
                        "{selectedCase.problemDescription}"
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.6 }}>
                    This student has shown high stress for <strong>{selectedCase.stressStreakDays} consecutive day{selectedCase.stressStreakDays !== 1 ? 's' : ''}</strong>.
                    Below are their complete mood logs and contact details. Please listen to their situation, contact them, and submit your guidance.
                  </p>
                </div>

                {/* ===== SECTION 2: 7-Day Mood & Stress Chart ===== */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <BarChart3 size={18} /> 7-Day Mood & AI Stress Trajectory
                  </h4>
                  <div style={{ height: '250px' }}>
                    <Line
                      data={{
                        labels: studentDetail?.dates || [],
                        datasets: [
                          {
                            label: 'AI Stress Score (1-10)',
                            data: studentDetail?.stressLevels || [],
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            fill: true, tension: 0.35, pointRadius: 6, pointBackgroundColor: '#ef4444',
                          },
                          {
                            label: 'Mood Level (1-5)',
                            data: studentDetail?.moods || [],
                            borderColor: '#0284c7',
                            backgroundColor: 'rgba(2, 132, 199, 0.08)',
                            fill: true, tension: 0.35, pointRadius: 6, pointBackgroundColor: '#0284c7',
                          },
                        ],
                      }}
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } } },
                          tooltip: { backgroundColor: '#0f172a', padding: 12 },
                        },
                        scales: {
                          y: { min: 0, max: 10, grid: { color: '#e2e8f0' } },
                          x: { grid: { color: '#f1f5f9' } },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* ===== SECTION 3: Daily Log Breakdown (student's words) ===== */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <ClipboardList size={18} /> Daily Mood Logs — Student's Own Words
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {studentDetail?.weeklyEntries && studentDetail.weeklyEntries.length > 0 ? (
                      studentDetail.weeklyEntries.slice().reverse().map((entry, idx) => (
                        <div key={entry.id || idx} style={{
                          background: getStressBg(entry.stressLevel),
                          border: `1px solid ${getStressColor(entry.stressLevel)}20`,
                          borderRadius: '10px', padding: '14px 16px', borderLeft: `4px solid ${getStressColor(entry.stressLevel)}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '1.3rem' }}>{MOOD_LABELS[entry.mood]?.split(' ')[0]}</span>
                              <strong style={{ fontSize: '0.9rem' }}>{entry.date}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Mood: {MOOD_LABELS[entry.mood]}</span>
                            </div>
                            <span style={{
                              fontWeight: 800, fontSize: '0.85rem', color: getStressColor(entry.stressLevel),
                              background: 'white', padding: '3px 10px', borderRadius: '8px', border: `1px solid ${getStressColor(entry.stressLevel)}30`
                            }}>
                              {getStressLabel(entry.stressLevel)} — {entry.stressLevel}/10
                            </span>
                          </div>
                          {entry.notes && (
                            <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, marginTop: '6px', fontStyle: 'italic' }}>
                              "{entry.notes}"
                            </p>
                          )}
                          {entry.aiAnalysis && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <Brain size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> AI Assessment: {entry.aiAnalysis}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-subtle)' }}>No mood entries found for this student.</div>
                    )}
                  </div>
                </div>

                {/* ===== SECTION 4: Contact & Outreach Actions ===== */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Phone size={18} /> Reach Out to This Student
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#1e3a5f', marginBottom: '12px' }}>
                    Based on their entries, please personally reach out to the student. 
                    Schedule a 1-on-1 counseling session, visit them during office hours, 
                    or send them a supportive message through your college portal.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '160px', background: 'white', borderRadius: '10px', padding: '12px 16px', border: '1px solid #dbeafe' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e40af', marginBottom: '2px' }}>Student Username</div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{selectedCase.student?.username}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '160px', background: 'white', borderRadius: '10px', padding: '12px 16px', border: '1px solid #dbeafe' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e40af', marginBottom: '2px' }}>Roll Number</div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{selectedCase.student?.rollNumber}</div>
                    </div>
                    <div style={{ flex: 1.5, minWidth: '220px', background: 'white', borderRadius: '10px', padding: '12px 16px', border: '2px solid #93c5fd' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e40af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} /> Student Phone / Contact
                      </div>
                      {selectedCase.student?.phoneNumber ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <a
                            href={`tel:${selectedCase.student.phoneNumber}`}
                            style={{ fontWeight: 700, color: '#0284c7', fontSize: '1.05rem', textDecoration: 'none' }}
                          >
                            📞 {selectedCase.student.phoneNumber}
                          </a>
                          <a
                            href={`https://wa.me/${selectedCase.student.phoneNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: '#22c55e',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                            }}
                          >
                            WhatsApp Chat
                          </a>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                          No phone number recorded
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '160px', background: 'white', borderRadius: '10px', padding: '12px 16px', border: '1px solid #dbeafe' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e40af', marginBottom: '2px' }}>Department</div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{selectedCase.student?.department?.name}</div>
                    </div>
                  </div>
                </div>

                {/* ===== SECTION 5: Provide Guidance / Solution ===== */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <BookOpen size={18} /> Your Guidance & Solution
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    After hearing and understanding the student's problems, write your counseling advice below. 
                    Submitting guidance will start a <strong>7-day mood recovery tracking period</strong> — you can monitor
                    if the student's mood improves over the coming week.
                  </p>

                  {guidanceNotice && (
                    <div 
                      style={{ 
                        padding: '12px 16px', 
                        marginBottom: '14px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        background: guidanceNotice.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${guidanceNotice.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                        color: guidanceNotice.type === 'success' ? '#065f46' : '#991b1b'
                      }}
                    >
                      {guidanceNotice.type === 'success' ? <CheckCircle size={18} color="#059669" /> : <AlertTriangle size={18} color="#dc2626" />}
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{guidanceNotice.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitSolution}>
                    <textarea
                      className="textarea-field"
                      style={{ minHeight: '120px' }}
                      placeholder="e.g. I've discussed the workload issues with the student. Recommended reduced assignment load for 2 weeks, referred to campus counselor, and scheduled bi-weekly check-ins..."
                      value={solutionText}
                      onChange={(e) => setSolutionText(e.target.value)}
                      required
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                        <Send size={16} />
                        {actionLoading ? 'Saving...' : (selectedCase.teacherSolution ? 'Update Guidance' : 'Submit Guidance & Start 7-Day Tracking')}
                      </button>

                      {selectedCase.status !== 'RESOLVED' && !confirmResolving && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ borderColor: '#10b981', color: '#059669', background: '#ecfdf5', fontWeight: 600 }} 
                          onClick={() => setConfirmResolving(true)} 
                          disabled={actionLoading}
                        >
                          <CheckCircle size={16} />
                          Mark as Resolved
                        </button>
                      )}

                      {confirmResolving && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                          <span style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>Mark this case as resolved?</span>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10b981', borderColor: '#10b981', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
                            onClick={handleResolveCase}
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Resolving...' : 'Yes, Confirm Resolve'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => setConfirmResolving(false)}
                            disabled={actionLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {selectedCase.status === 'RESOLVED' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px' }}>
                          <CheckCircle size={16} /> Case Status: Resolved
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* Tracking Timeline if active */}
                {selectedCase.trackingStartDate && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                      <Shield size={16} /> 7-Day Monitoring Period Active
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '6px' }}>
                      Tracking from <strong>{selectedCase.trackingStartDate}</strong> to <strong>{selectedCase.trackingEndDate}</strong>.
                      The student's daily mood logs during this window will appear above. Review them regularly to assess recovery.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
