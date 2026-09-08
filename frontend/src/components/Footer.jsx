import React from 'react';
import { Heart, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '8px' }}>Campus MindTrack Support</h3>
          <p style={{ maxWidth: '480px', fontSize: '0.875rem' }}>
            Empowering students, faculty, and leadership to detect high stress patterns early. 
            All mood data is processed with privacy and care by campus faculty counselors.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>24/7 Helpline</div>
            <div style={{ fontSize: '0.813rem' }}>Campus Wellness: 1800-CAMPUS-CARE</div>
            <div style={{ fontSize: '0.813rem' }}>Tele-Counseling: Ext. 404</div>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>Framework</div>
            <div style={{ fontSize: '0.813rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#38bdf8" /> Principal & HOD Triage
            </div>
            <div style={{ fontSize: '0.813rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} color="#34d399" /> 7-Day Faculty Tracking
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} Campus MindTrack. Confidential & Compassionate Student Support.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Made with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for Student Mental Health
        </div>
      </div>
    </footer>
  );
}
