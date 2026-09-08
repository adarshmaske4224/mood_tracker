import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Filter, 
  Activity,
  ShieldCheck,
  TrendingUp,
  Eye,
  BarChart3,
  ArrowRight,
  BookOpen,
  Brain
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cases' | 'departments'

  const fetchDashboard = async () => {
    try {
      const res = await api.getPrincipalDashboard();
      setData(res);
    } catch (err) {
      console.error('Error fetching principal dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <div className="page-wrap" style={{ textAlign: 'center', padding: '100px 0' }}>
        <Activity size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading campus executive dashboard...</p>
      </div>
    );
  }

  const departments = data?.departments || [];
  const departmentStats = data?.departmentStats || {};
  const allActiveCases = data?.allActiveCases || [];

  const filteredCases = allActiveCases.filter((c) => {
    if (deptFilter === 'ALL') return true;
    return c.student?.department?.code === deptFilter;
  });

  const totalActive = (data?.totalFlagged || 0) + (data?.totalInProgress || 0);

  // Prepare bar chart data from department stats
  const deptNames = departments.map((d) => d.code);
  const deptFlagged = departments.map((d) => {
    const stats = departmentStats[d.name] || {};
    return stats.flagged || 0;
  });
  const deptActive = departments.map((d) => {
    const stats = departmentStats[d.name] || {};
    return (stats.assigned || 0) + (stats.inProgress || 0);
  });
  const deptResolved = departments.map((d) => {
    const stats = departmentStats[d.name] || {};
    return stats.resolved || 0;
  });

  const barChartData = {
    labels: deptNames,
    datasets: [
      { label: 'Flagged', data: deptFlagged, backgroundColor: '#fecaca', borderColor: '#ef4444', borderWidth: 1.5, borderRadius: 6 },
      { label: 'In-Progress', data: deptActive, backgroundColor: '#bfdbfe', borderColor: '#3b82f6', borderWidth: 1.5, borderRadius: 6 },
      { label: 'Resolved', data: deptResolved, backgroundColor: '#bbf7d0', borderColor: '#22c55e', borderWidth: 1.5, borderRadius: 6 },
    ],
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>Campus Mental Wellness — Principal's Office</h1>
            <p>
              Welcome, <strong>Principal {user?.fullName}</strong>.
              This is your institution-wide view of student mental health and stress support operations
              across all {departments.length} departments. Track every student issue, monitor faculty response rates, 
              and ensure no student falls through the cracks.
            </p>
            <div className="hero-stats-chips">
              <span className="hero-chip"><GraduationCap size={14} /> Students: {data?.totalStudents || 0}</span>
              <span className="hero-chip"><AlertTriangle size={14} /> Flagged: {data?.totalFlagged || 0}</span>
              <span className="hero-chip"><Clock size={14} /> Active Care: {data?.totalInProgress || 0}</span>
              <span className="hero-chip"><CheckCircle2 size={14} /> Resolved: {data?.totalResolved || 0}</span>
              <span className="hero-chip"><Building2 size={14} /> Departments: {departments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="quick-actions-row">
        <div className="action-card action-card-rose" onClick={() => setActiveTab('cases')}>
          <div className="action-card-info">
            <h3>🚨 Students Requiring Attention</h3>
            <p>{data?.totalFlagged || 0} flagged cases awaiting HOD delegation</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#be123c' }}>{data?.totalFlagged || 0}</div>
        </div>
        <div className="action-card action-card-emerald" onClick={() => setActiveTab('overview')}>
          <div className="action-card-info">
            <h3>📊 Campus Analytics</h3>
            <p>Department-wise stress distribution & resolution metrics</p>
          </div>
          <div className="action-circle-btn"><BarChart3 size={18} /></div>
        </div>
        <div className="action-card action-card-amber" onClick={() => setActiveTab('departments')}>
          <div className="action-card-info">
            <h3>🏛️ Department Breakdown</h3>
            <p>Deep dive into each department's student wellness data</p>
          </div>
          <div className="action-circle-btn"><ArrowRight size={18} /></div>
        </div>
      </div>

      <div className="page-wrap">
        {/* Stats Grid */}
        <div className="stats-cards-grid">
          <div className="stat-box">
            <div>
              <div className="stat-label">Total Enrolled Students</div>
              <div className="stat-value">{data?.totalStudents || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Users size={22} /></div>
          </div>
          <div className="stat-box">
            <div>
              <div className="stat-label">🔴 Flagged High-Stress</div>
              <div className="stat-value" style={{ color: '#e11d48' }}>{data?.totalFlagged || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}><AlertTriangle size={22} /></div>
          </div>
          <div className="stat-box">
            <div>
              <div className="stat-label">🟠 Active Faculty Care</div>
              <div className="stat-value" style={{ color: '#b45309' }}>{data?.totalInProgress || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}><Clock size={22} /></div>
          </div>
          <div className="stat-box">
            <div>
              <div className="stat-label">🟢 Successfully Resolved</div>
              <div className="stat-value" style={{ color: '#166534' }}>{data?.totalResolved || 0}</div>
            </div>
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><CheckCircle2 size={22} /></div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          {[
            { key: 'overview', label: '📊 Campus Analytics' },
            { key: 'cases', label: `🔥 All Active Cases (${allActiveCases.length})` },
            { key: 'departments', label: `🏛️ Department Details (${departments.length})` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              background: activeTab === tab.key ? 'white' : 'transparent',
              color: activeTab === tab.key ? '#0c4a6e' : '#64748b',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="dashboard-grid">
            <div>
              {/* Bar Chart */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><BarChart3 size={20} color="#0284c7" /> Department-wise Case Distribution</div>
                </div>
                <div style={{ height: '320px' }}>
                  <Bar data={barChartData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } } },
                      tooltip: { backgroundColor: '#0f172a', padding: 12 },
                    },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                      x: { grid: { display: false } },
                    },
                  }} />
                </div>
              </div>

              {/* Pipeline summary */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><TrendingUp size={20} color="#0284c7" /> Student Care Pipeline</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Student Logs Mood', icon: '📝', color: '#e0f2fe' },
                    { label: 'AI Detects High Stress (3+ days)', icon: '🤖', color: '#fef3c7' },
                    { label: 'Auto-Flagged to HOD', icon: '🚨', color: '#ffe4e6' },
                    { label: 'HOD Delegates to Teacher', icon: '👨‍🏫', color: '#ede9fe' },
                    { label: 'Teacher Counsels & Guides', icon: '💬', color: '#e0f2fe' },
                    { label: '7-Day Mood Tracking', icon: '📊', color: '#fef3c7' },
                    { label: 'Case Resolved ✅', icon: '🎉', color: '#dcfce7' },
                  ].map((step, i) => (
                    <React.Fragment key={i}>
                      <div style={{ background: step.color, borderRadius: '10px', padding: '10px 14px', textAlign: 'center', flex: '1', minWidth: '110px' }}>
                        <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{step.icon}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e293b' }}>{step.label}</div>
                      </div>
                      {i < 6 && <ArrowRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: quick department tiles */}
            <div>
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><Building2 size={20} color="#0284c7" /> Quick Department Summary</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {departments.map((dept) => {
                    const stats = departmentStats[dept.name] || {};
                    return (
                      <div key={dept.id} style={{
                        background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }} onClick={() => { setDeptFilter(dept.code); setActiveTab('cases'); }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0c4a6e' }}>{dept.code}</span>
                          <span style={{ fontSize: '0.75rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>{dept.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                          <span style={{ color: '#ef4444' }}>🔴 {stats.flagged || 0}</span>
                          <span style={{ color: '#f59e0b' }}>🟠 {(stats.assigned || 0) + (stats.inProgress || 0)}</span>
                          <span style={{ color: '#22c55e' }}>🟢 {stats.resolved || 0}</span>
                          <span style={{ color: '#64748b' }}>👥 {stats.totalStudents || 0} students</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Brain size={16} />
                  </div>
                  <h4 style={{ color: '#0c4a6e', fontSize: '1rem' }}>How It Works</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.6 }}>
                  Students log daily moods and notes → AI calculates real-time stress scores → 
                  3+ consecutive high-stress days triggers automatic alert → HOD receives flagged case →
                  HOD delegates to department teacher → Teacher reaches out, counsels, and provides solution →
                  7-day mood tracking monitors recovery → Case resolved when student stabilizes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== CASES TAB ===== */}
        {activeTab === 'cases' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title"><ShieldCheck size={20} color="#0284c7" /> Campus-Wide Active Student Cases ({filteredCases.length})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="var(--text-subtle)" />
                <select className="select-field" style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
                </select>
              </div>
            </div>

            {filteredCases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)' }}>
                <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 600, color: '#15803d' }}>No active cases {deptFilter !== 'ALL' ? `in ${deptFilter}` : 'across campus'}.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Dept</th>
                      <th>Student</th>
                      <th>Roll Number</th>
                      <th>Student Problem</th>
                      <th>Stress Days</th>
                      <th>Assigned HOD</th>
                      <th>Assigned Faculty</th>
                      <th>Status</th>
                      <th>Teacher's Solution</th>
                      <th>Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((c) => (
                      <tr key={c.id}>
                        <td><span style={{ fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{c.student?.department?.code}</span></td>
                        <td style={{ fontWeight: 600 }}>{c.student?.fullName}</td>
                        <td>{c.student?.rollNumber}</td>
                        <td style={{ fontSize: '0.85rem', color: '#0f172a', maxWidth: '220px' }}>
                          {c.problemDescription ? (
                            <span style={{ fontWeight: 600, color: '#991b1b' }}>"{c.problemDescription.substring(0, 75)}{c.problemDescription.length > 75 ? '…' : ''}"</span>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>High stress streak</span>
                          )}
                        </td>
                        <td><span style={{ background: '#ffe4e6', color: '#e11d48', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>🔥 {c.stressStreakDays}d</span></td>
                        <td>{c.assignedBy ? <span style={{ fontWeight: 600 }}>Dr. {c.assignedBy.fullName}</span> : <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>Pending HOD</span>}</td>
                        <td>{c.assignedTeacher ? <span style={{ fontWeight: 600, color: '#0369a1' }}>Prof. {c.assignedTeacher.fullName}</span> : <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>Unassigned</span>}</td>
                        <td><span className={`status-badge status-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{c.teacherSolution ? c.teacherSolution.substring(0, 80) + (c.teacherSolution.length > 80 ? '…' : '') : <span style={{ fontStyle: 'italic' }}>Pending</span>}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.trackingStartDate ? `${c.trackingStartDate} → ${c.trackingEndDate}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== DEPARTMENTS TAB ===== */}
        {activeTab === 'departments' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {departments.map((dept) => {
              const stats = departmentStats[dept.name] || {};
              const total = (stats.flagged || 0) + (stats.assigned || 0) + (stats.inProgress || 0) + (stats.resolved || 0);
              const resolvedPct = total > 0 ? Math.round(((stats.resolved || 0) / total) * 100) : 0;

              return (
                <div key={dept.id} className="card" style={{ margin: 0, borderTop: '4px solid #0284c7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: '#0c4a6e' }}>{dept.code}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dept.name}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '8px' }}>
                      👥 {stats.totalStudents || 0} students
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991b1b' }}>FLAGGED</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>{stats.flagged || 0}</div>
                    </div>
                    <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>ASSIGNED</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>{stats.assigned || 0}</div>
                    </div>
                    <div style={{ background: '#e0f2fe', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#075985' }}>IN PROGRESS</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{stats.inProgress || 0}</div>
                    </div>
                    <div style={{ background: '#dcfce7', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534' }}>RESOLVED</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>{stats.resolved || 0}</div>
                    </div>
                  </div>

                  {/* Resolution rate bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Resolution Rate</span>
                      <span style={{ color: resolvedPct >= 50 ? '#15803d' : '#b45309' }}>{resolvedPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${resolvedPct}%`, height: '100%', borderRadius: '4px', background: resolvedPct >= 50 ? '#22c55e' : '#f59e0b', transition: 'width 0.3s' }} />
                    </div>
                  </div>

                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '12px' }} onClick={() => { setDeptFilter(dept.code); setActiveTab('cases'); }}>
                    <Eye size={14} /> View {dept.code} Cases
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
