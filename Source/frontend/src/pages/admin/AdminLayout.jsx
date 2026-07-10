import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Users, ShieldAlert, LogOut, ChevronRight, BarChart2, CreditCard, Settings } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
      <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>กำลังตรวจสอบสิทธิ์...</div>
    </div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงส่วนนี้ได้</p>
          <button 
            onClick={() => navigate('/')} 
            style={{ padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'background-color 0.2s' }}
            onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard Overview' },
    { path: '/admin/analytics', icon: <BarChart2 size={20} />, label: 'Data Analytics' },
    { path: '/admin/payments', icon: <CreditCard size={20} />, label: 'Payments & Revenue' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'User Management' },
    { path: '/admin/api-settings', icon: <Settings size={20} />, label: 'API Management' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' }}>
      {/* Premium Sidebar */}
      <div style={{ 
        width: '280px', 
        backgroundColor: '#0f172a', 
        color: 'white', 
        padding: '2rem 1.5rem', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>Y</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>YokPai Admin</h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>Professional Dashboard</p>
          </div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Menu</p>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', 
                  padding: '0.75rem 1rem', borderRadius: '10px', 
                  color: isActive ? 'white' : '#94a3b8', 
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                  position: 'relative'
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                {isActive && <div style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '0 4px 4px 0' }} />}
                <div style={{ color: isActive ? '#3b82f6' : 'inherit' }}>
                  {item.icon}
                </div>
                <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#3b82f6' }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <Users size={18} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>● Online</p>
            </div>
          </div>
          
          <button 
            onClick={() => { logout(); navigate('/'); }}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
              width: '100%', padding: '0.75rem', borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', 
              border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', 
              fontWeight: 600, transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header inside Admin */}
        <header style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 2rem', justifyContent: 'flex-end', position: 'sticky', top: 0, zIndex: 5 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}>
            ไปที่หน้าแอปพลิเคชัน
          </button>
        </header>
        
        <div style={{ padding: '2rem 3rem', flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
