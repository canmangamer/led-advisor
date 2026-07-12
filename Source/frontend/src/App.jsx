import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
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
import { useContext, useEffect, useState } from 'react';
import './index.css';
import { Briefcase, Crown, Settings, Heart, LogOut, Search, User } from 'lucide-react';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [allowRegistration, setAllowRegistration] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/settings/public`)
      .then(res => res.json())
      .then(data => setAllowRegistration(data.allow_registration))
      .catch(console.error);
  }, []);

  const hideHeaderPaths = ['/login', '/register'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <div className="main-layout">
      {/* HEADER */}
      {showHeader && (
        <header className="top-header">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="brand-area">
            <div className="brand-logo">
              YokPai
            </div>
            <div className="brand-slogan desktop-only">
              แพลตฟอร์มวิเคราะห์ประมูลอสังหาฯ สำหรับนักลงทุนตัวจริง
            </div>
          </div>
        </Link>
        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link 
                to="/" 
                style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#059669', backgroundColor: '#ecfdf5', border: '1px solid #059669', padding: '0 10px', borderRadius: '100px', fontWeight: 500, fontSize: '13px', textDecoration: 'none', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                title="ค้นหาหลัก"
              >
                <Search size={16} color="#059669" /> <span className="desktop-only">ค้นหา</span>
              </Link>
              <Link 
                to="/portfolio" 
                style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#1a73e8', backgroundColor: '#e8f0fe', border: '1px solid #1a73e8', padding: '0 10px', borderRadius: '100px', fontWeight: 500, fontSize: '13px', textDecoration: 'none', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d2e3fc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f0fe'}
                title="พอร์ตประมูล"
              >
                <Briefcase size={16} color="#1a73e8" /> <span className="desktop-only">พอร์ต</span>
              </Link>
              {user.is_vip ? (
                <span style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: '#fef7e0', color: '#b06000', border: '1px solid transparent', padding: '0 10px', borderRadius: '100px', fontSize: '13px', fontWeight: 500 }} title="VIP">
                  <Crown size={16} color="#ea8600" /> <span className="desktop-only">VIP</span>
                </span>
              ) : (
                <button 
                  onClick={() => navigate('/pricing')}
                  style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: '#fbbc04', color: '#202124', border: '1px solid transparent', padding: '0 10px', borderRadius: '100px', fontWeight: 500, fontSize: '13px', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 1px rgba(60,64,67,0.15), 0 1px 2px 0 rgba(60,64,67,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3)'}
                  title="อัปเกรด VIP"
                >
                  <Crown size={16} color="#202124" /> <span className="desktop-only">VIP</span>
                </button>
              )}
              {user.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: '#e8f0fe', color: '#1967d2', border: '1px solid transparent', padding: '0 10px', borderRadius: '100px', fontWeight: 500, fontSize: '13px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d2e3fc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f0fe'}
                  title="Admin"
                >
                  <Settings size={16} color="#4285f4" /> <span className="desktop-only">Admin</span>
                </button>
              )}
              <Link 
                to="/profile" 
                style={{ boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#1a73e8', backgroundColor: 'transparent', border: '1px solid transparent', padding: '0 8px', borderRadius: '100px', fontWeight: 500, fontSize: '13px', textDecoration: 'none', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8f0fe'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="โปรไฟล์"
              >
                <User size={18} color="#1a73e8" />
              </Link>
              <button title="ออกจากระบบ" className="btn-login" onClick={() => { logout(); navigate('/'); }} style={{ borderRadius: '100px', padding: '0 10px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                <LogOut size={16} /> <span className="desktop-only">ออก</span>
              </button>
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
              {allowRegistration && (
                <button className="btn-signup" onClick={() => navigate('/register')}>สมัครสมาชิก</button>
              )}
            </>
          )}
        </div>
      </header>
      )}

      {/* DYNAMIC CONTENT (ROUTES) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
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
