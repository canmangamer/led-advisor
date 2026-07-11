import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthContainer = ({ title, children }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem', backgroundColor: 'var(--bg-color)' }}>
    <div style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 'bold' }}>{title}</h2>
      {children}
    </div>
  </div>
);

const SocialButtons = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
    <button style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.target.style.backgroundColor = '#ffffff'}>
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
      ดำเนินการต่อด้วย Google
    </button>
  </div>
);

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
    <span style={{ padding: '0 1rem' }}>หรือใช้อีเมล</span>
    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
  </div>
);

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'เข้าสู่ระบบล้มเหลว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="เข้าสู่ระบบ YokPai">
      <SocialButtons />
      <Divider />
      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleLogin}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>อีเมล</label>
          <input 
            type="email" 
            placeholder="example@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>รหัสผ่าน</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ backgroundColor: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, marginTop: '0.5rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        ยังไม่มีบัญชี? <Link to="/register" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>สมัครสมาชิก</Link>
      </div>
    </AuthContainer>
  );
};

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('รหัสผ่านไม่ตรงกัน');
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'สมัครสมาชิกล้มเหลว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="สมัครสมาชิก YokPai">
      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{success}</div>}
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleRegister}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>อีเมล</label>
          <input 
            type="email" 
            placeholder="example@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>รหัสผ่าน</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>ยืนยันรหัสผ่าน</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ backgroundColor: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, marginTop: '0.5rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
      </div>
    </AuthContainer>
  );
};
