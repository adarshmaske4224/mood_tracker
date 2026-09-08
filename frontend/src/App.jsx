import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import HodDashboard from './pages/HodDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import { Activity } from 'lucide-react';

function MainLayout() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Activity size={44} color="#0284c7" style={{ animation: 'spin 1.2s linear infinite' }} />
        <p style={{ marginTop: '16px', fontWeight: 600, color: '#0369a1', fontFamily: 'Outfit, sans-serif' }}>
          Initializing Campus MindTrack...
        </p>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) {
      if (authView === 'register') {
        return <Register onNavigate={(view) => setAuthView(view)} />;
      }
      return <Login onNavigate={(view) => setAuthView(view)} />;
    }

    switch (user.role) {
      case 'STUDENT':
        return <StudentDashboard />;
      case 'TEACHER':
        return <TeacherDashboard />;
      case 'HOD':
        return <HodDashboard />;
      case 'PRINCIPAL':
        return <PrincipalDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navbar onNavigate={(view) => setAuthView(view)} />
      <main className="main-content">
        {renderDashboard()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
