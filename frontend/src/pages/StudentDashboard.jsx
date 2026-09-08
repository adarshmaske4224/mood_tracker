import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  HeartHandshake, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  Activity,
  Smile
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import confetti from 'canvas-confetti';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MOOD_OPTIONS = [
  { val: 1, emoji: '😢', label: 'Awful' },
  { val: 2, emoji: '😟', label: 'Low' },
  { val: 3, emoji: '😐', label: 'Okay' },
  { val: 4, emoji: '🙂', label: 'Good' },
  { val: 5, emoji: '😄', label: 'Great' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.getStudentDashboard();
      setData(res);
      if (res.todayEntry) {
        setSelectedMood(res.todayEntry.mood);
        setNotes(res.todayEntry.notes || '');
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogMood = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await api.logStudentMood(selectedMood, notes);
      setMessage(res.message);
      if (selectedMood >= 4) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
      fetchDashboard();
    } catch (err) {
      setMessage(err.message || 'Failed to log mood');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap" style={{ textAlign: 'center', padding: '100px 0' }}>
        <Activity size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading your wellness dashboard...</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data?.dates || [],
    datasets: [
      {
        label: 'Stress Level (1-10)',
        data: data?.stressLevels || [],
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#f43f5e',
        pointRadius: 5,
        yAxisID: 'yStress',
      },
      {
        label: 'Mood Level (1-5)',
        data: data?.moods || [],
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0284c7',
        pointRadius: 5,
        yAxisID: 'yMood',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Plus Jakarta Sans', weight: 600 } },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { family: 'Outfit', size: 14 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 13 },
      },
    },
    scales: {
      yMood: {
        type: 'linear',
        position: 'left',
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (val) => {
            const labels = ['', '😢 Awful', '😟 Low', '😐 Okay', '🙂 Good', '😄 Great'];
            return labels[val] || val;
          },
        },
        grid: { color: '#f1f5f9' },
      },
      yStress: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 10,
        ticks: { stepSize: 2 },
        grid: { drawOnChartArea: false },
      },
      x: {
        grid: { color: '#f8fafc' },
      },
    },
  };

  const activeCase = data?.activeCase;
  const todayEntry = data?.todayEntry;

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>Feeling Stressed? We Help You Balance It.</h1>
            <p>
              Welcome back, <strong>{user?.fullName}</strong>! Log your feelings today to receive AI stress scoring 
              and automatic faculty support if high stress persists.
            </p>
            <div className="hero-stats-chips">
              <span className="hero-chip">
                <Calendar size={14} /> Department: {user?.department?.name || 'General'}
              </span>
              <span className="hero-chip">
                <Smile size={14} /> Roll No: {user?.rollNumber}
              </span>
              <span className="hero-chip">
                <Sparkles size={14} /> AI Sentiment Enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="quick-actions-row">
        <div className="action-card action-card-rose" onClick={() => document.getElementById('mood-checkin-card')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="action-card-info">
            <h3>{todayEntry ? 'Today Logged' : 'Log Today\'s Mood'}</h3>
            <p>{todayEntry ? `Recorded stress: ${todayEntry.stressLevel}/10` : 'Takes 15 seconds to check in'}</p>
          </div>
          <div className="action-circle-btn">
            <ArrowRight size={18} />
          </div>
        </div>

        <div className="action-card action-card-emerald">
          <div className="action-card-info">
            <h3>Faculty & Counseling Support</h3>
            <p>{activeCase ? `Status: ${activeCase.status}` : 'Protected 4-tier campus wellness net'}</p>
          </div>
          <div className="action-circle-btn">
            <HeartHandshake size={18} />
          </div>
        </div>
      </div>

      <div className="page-wrap">
        {/* Active Support Alert Banner if flagged / assigned / in progress */}
        {activeCase && (
          <div className="card" style={{ borderLeft: '5px solid #0284c7', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className={`status-badge status-${activeCase.status}`}>
                    {activeCase.status}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Triggered after {activeCase.stressStreakDays} consecutive high stress days
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#0c4a6e', marginBottom: '6px' }}>
                  {activeCase.status === 'FLAGGED' && 'Case Forwarded to Head of Department (HOD)'}
                  {activeCase.status === 'ASSIGNED' && `Assigned to Faculty Advisor: ${activeCase.assignedTeacher?.fullName}`}
                  {activeCase.status === 'IN_PROGRESS' && `Counseling In Progress with ${activeCase.assignedTeacher?.fullName}`}
                  {activeCase.status === 'RESOLVED' && 'Support Case Completed & Resolved'}
                </h3>
                {activeCase.teacherSolution ? (
                  <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', marginTop: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369a1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Teacher's Personalized Solution & Guidance:
                    </div>
                    <p style={{ color: '#1e293b', fontSize: '0.95rem' }}>{activeCase.teacherSolution}</p>
                    {activeCase.trackingEndDate && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> 7-Day Monitoring Active until {activeCase.trackingEndDate}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Your HOD and designated faculty mentor have been notified to provide assistance and adjust workload expectations.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Mood Log & Weekly Trend */}
          <div>
            {/* Mood Log Form */}
            <div className="card" id="mood-checkin-card">
              <div className="card-header">
                <div className="card-title">
                  <Sparkles size={20} color="#0284c7" />
                  Daily Mood & Stress Check-in
                </div>
                {todayEntry && (
                  <span className="status-badge status-RESOLVED">
                    ✓ Completed for Today
                  </span>
                )}
              </div>

              {message && (
                <div className="alert-box alert-info">
                  <AlertCircle size={18} />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleLogMood}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  How are you feeling right now?
                </label>
                <div className="mood-selector">
                  {MOOD_OPTIONS.map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className={`mood-btn ${selectedMood === item.val ? 'selected' : ''}`}
                      onClick={() => setSelectedMood(item.val)}
                    >
                      <span className="mood-emoji">{item.emoji}</span>
                      <span className="mood-name">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Notes or thoughts (What's on your mind?):
                  </label>
                  <textarea
                    className="textarea-field"
                    placeholder="e.g. Overwhelmed with semester assignment deadlines and lab exams..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    💡 AI analyzes mood value and keywords to calculate real-time stress index (1-10).
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <Sparkles size={18} />
                  {submitting ? 'Analyzing & Saving...' : todayEntry ? 'Update Today\'s Entry' : 'Submit & Analyze Stress'}
                </button>
              </form>

              {/* Today's AI Insight if available */}
              {todayEntry && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={16} /> AI Stress Calculation:
                    </div>
                    <span style={{ 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      color: todayEntry.stressLevel >= 7 ? '#f43f5e' : todayEntry.stressLevel >= 4 ? '#f59e0b' : '#10b981' 
                    }}>
                      {todayEntry.stressLevel} / 10
                    </span>
                  </div>
                  <div className="stress-meter-wrap" style={{ marginBottom: '8px' }}>
                    <div className="stress-meter-bar">
                      <div 
                        className={`stress-meter-fill ${todayEntry.stressLevel >= 7 ? 'stress-high' : todayEntry.stressLevel >= 4 ? 'stress-medium' : 'stress-low'}`}
                        style={{ width: `${todayEntry.stressLevel * 10}%` }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                    {todayEntry.aiAnalysis || 'Balanced state maintained. Keep hydrated and take regular study breaks.'}
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Trend Chart */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <TrendingUp size={20} color="#0284c7" />
                  7-Day Mood & Stress Trajectory
                </div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                {data?.dates && data.dates.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>
                    No mood entries logged yet. Log your first mood above!
                  </div>
                )}
              </div>
            </div>

            {/* History Table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Calendar size={20} color="#0284c7" />
                  Recent Check-in Logs
                </div>
              </div>
              <div className="table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Mood</th>
                      <th>AI Stress</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.weeklyEntries && data.weeklyEntries.length > 0 ? (
                      data.weeklyEntries.slice().reverse().map((entry) => (
                        <tr key={entry.id}>
                          <td style={{ fontWeight: 600 }}>{entry.date}</td>
                          <td>
                            <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>
                              {MOOD_OPTIONS.find((m) => m.val === entry.mood)?.emoji}
                            </span>
                            {MOOD_OPTIONS.find((m) => m.val === entry.mood)?.label}
                          </td>
                          <td>
                            <span style={{ 
                              fontWeight: 700, 
                              color: entry.stressLevel >= 7 ? '#e11d48' : entry.stressLevel >= 4 ? '#b45309' : '#15803d',
                              background: entry.stressLevel >= 7 ? '#ffe4e6' : entry.stressLevel >= 4 ? '#fef3c7' : '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {entry.stressLevel} / 10
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '300px' }}>
                            {entry.notes || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '24px' }}>
                          No entries logged in the past week.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Stats & Wellness Tips */}
          <div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Lightbulb size={20} color="#f59e0b" />
                  Wellness Quick Stats
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="stat-box" style={{ background: '#f8fafc' }}>
                  <div>
                    <div className="stat-label">Entries this week</div>
                    <div className="stat-value">{data?.weeklyEntries?.length || 0} / 7</div>
                  </div>
                  <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <Calendar size={22} />
                  </div>
                </div>

                <div className="stat-box" style={{ background: '#f8fafc' }}>
                  <div>
                    <div className="stat-label">Avg Stress Score</div>
                    <div className="stat-value">
                      {data?.stressLevels?.length
                        ? (data.stressLevels.reduce((a, b) => a + b, 0) / data.stressLevels.length).toFixed(1)
                        : '—'}
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                    <Activity size={22} />
                  </div>
                </div>

                <div className="stat-box" style={{ background: '#f8fafc' }}>
                  <div>
                    <div className="stat-label">Faculty Care Tier</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0369a1', marginTop: '4px' }}>
                      Active Protection
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                    <HeartHandshake size={22} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Sparkles size={16} />
                </div>
                <h4 style={{ color: '#0c4a6e', fontSize: '1.05rem' }}>Campus Wellness Tip</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#0369a1', lineHeight: 1.6 }}>
                "High stress for 3 or more consecutive days automatically activates our caring faculty delegation. 
                You are never alone on campus — help is always within reach."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
