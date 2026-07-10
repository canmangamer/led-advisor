import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import UserProfile from './pages/UserProfile';
import { Login, Register } from './pages/AuthPages';
import { About, Terms, Privacy, Contact } from './pages/StaticPages';
import { Pricing } from './pages/Pricing';
import { Checkout } from './pages/Checkout';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DataAnalytics from './pages/admin/DataAnalytics';
import PaymentDashboard from './pages/admin/PaymentDashboard';
import ApiManagement from './pages/admin/ApiManagement';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import './index.css';
import { Briefcase, Crown, Settings, Heart } from 'lucide-react';

const AppContent = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="main-layout">
      {/* HEADER */}
      <header className="top-header">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="brand-area">
            <div className="brand-logo">
              YokPai
            </div>
            <div className="brand-slogan">
              แพลตฟอร์มวิเคราะห์ประมูลอสังหาฯ สำหรับนักลงทุนตัวจริง
            </div>
          </div>
        </Link>
        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link 
                to="/portfolio" 
                style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#1a73e8', backgroundColor: '#e8f0fe', border: '1px solid #1a73e8', padding: '0 16px', borderRadius: '100px', fontWeight: 500, fontSize: '14px', textDecoration: 'none', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d2e3fc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f0fe'}
              >
                <Briefcase size={16} color="#1a73e8" /> พอร์ตประมูล
              </Link>
              <Link 
                to="/portfolio" 
                style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#d93025', backgroundColor: '#ffffff', border: '1px solid #d93025', padding: '0 16px', borderRadius: '100px', fontWeight: 500, fontSize: '14px', textDecoration: 'none', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fce8e6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <Heart size={16} color="#d93025" /> รายการโปรด
              </Link>
              {user.is_vip ? (
                <span style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#fef7e0', color: '#b06000', border: '1px solid transparent', padding: '0 16px', borderRadius: '100px', fontSize: '14px', fontWeight: 500 }}>
                  <Crown size={16} color="#ea8600" /> VIP
                </span>
              ) : (
                <button 
                  onClick={() => navigate('/pricing')}
                  style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#fbbc04', color: '#202124', border: '1px solid transparent', padding: '0 16px', borderRadius: '100px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 1px rgba(60,64,67,0.15), 0 1px 2px 0 rgba(60,64,67,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3)'}
                >
                  👑 อัปเกรด VIP
                </button>
              )}
              {user.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#e8f0fe', color: '#1967d2', border: '1px solid transparent', padding: '0 16px', borderRadius: '100px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d2e3fc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f0fe'}
                >
                  <Settings size={16} color="#4285f4" /> Admin
                </button>
              )}
              <Link 
                to="/profile" 
                style={{ fontSize: '14px', color: '#1a73e8', fontWeight: 600, marginLeft: '8px', marginRight: '8px', textDecoration: 'none', padding: '6px 12px', borderRadius: '100px', transition: 'background-color 0.2s' }} 
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#e8f0fe'} 
                onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}
                title="ดูข้อมูลบัญชีผู้ใช้"
              >
                {user.email}
              </Link>
              <button className="btn-login" onClick={() => { logout(); navigate('/'); }} style={{ borderRadius: '100px', padding: '6px 16px', fontSize: '14px', fontWeight: 500 }}>ออกจากระบบ</button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate('/pricing')}
                style={{ backgroundColor: '#fbbf24', color: '#78350f', border: 'none', padding: '0.4rem 1.25rem', borderRadius: '20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                👑 อัปเกรด VIP
              </button>
              <button className="btn-login" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
              <button className="btn-signup" onClick={() => navigate('/register')}>สมัครสมาชิก</button>
            </>
          )}
        </div>
      </header>

      {/* DYNAMIC CONTENT (ROUTES) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/profile" element={<UserProfile />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<DataAnalytics />} />
            <Route path="payments" element={<PaymentDashboard />} />
            <Route path="api-settings" element={<ApiManagement />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>

      {/* FOOTER */}
      <footer className="footer-area">
        <div className="footer-links">
          <Link to="/">หน้าแรก</Link>
          <Link to="/about">เกี่ยวกับเรา</Link>
          <Link to="/terms">เงื่อนไขการให้บริการ</Link>
          <Link to="/privacy">นโยบายความเป็นส่วนตัว</Link>
          <Link to="/contact">ติดต่อทีมงาน</Link>
        </div>
        <div>
          &copy; {new Date().getFullYear()} YokPai - แพลตฟอร์มวิเคราะห์ประมูลอสังหาฯ สำหรับนักลงทุนตัวจริง. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
