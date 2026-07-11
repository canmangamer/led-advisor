import React, { useState, useEffect } from 'react';
import API_BASE from '../../config';
import { Search, MoreVertical, Shield, User, X, CheckCircle, Crown, Star, Zap } from 'lucide-react';

const PricingCard = ({ title, price, durationDays, description, isPopular, selected, onClick, icon }) => (
  <div 
    onClick={onClick}
    style={{ 
      border: selected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
      backgroundColor: selected ? '#eff6ff' : 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s ease',
      boxShadow: selected ? '0 10px 15px -3px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}
  >
    {isPopular && (
      <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#3b82f6', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Best Value
      </div>
    )}
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ color: selected ? '#3b82f6' : '#64748b' }}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      </div>
      {selected && <CheckCircle size={20} color="#3b82f6" />}
    </div>
    
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>฿{price}</span>
      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>/ {durationDays >= 3650 ? 'ตลอดชีพ' : `${durationDays} วัน`}</span>
    </div>
    
    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>{description}</p>
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTier, setSelectedTier] = useState(365);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // System Settings State
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [isSettingLoading, setIsSettingLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings/public`);
      if (res.ok) {
        const data = await res.json();
        setAllowRegistration(data.allow_registration);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const toggleRegistration = async () => {
    setIsSettingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ key: 'allow_registration', value: !allowRegistration ? 'true' : 'false' })
      });
      if (res.ok) {
        setAllowRegistration(!allowRegistration);
      }
    } catch (err) {
      console.error('Error updating setting:', err);
      alert('Error updating setting');
    } finally {
      setIsSettingLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedUser) return;
    setIsUpgrading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/users/${selectedUser.id}/upgrade`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan_type: 'vip', days_to_add: selectedTier })
      });
      if (res.ok) {
        alert('✅ อัปเกรดแพ็กเกจสำเร็จเรียบร้อย!');
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเกรด');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  const packages = [
    { days: 30, title: 'Starter', price: '990', desc: 'เหมาะสำหรับผู้เริ่มต้นใช้งาน', icon: <User size={20} /> },
    { days: 90, title: 'Pro', price: '2,590', desc: 'ประหยัด 12% เหมาะสำหรับนักลงทุนทั่วไป', icon: <Zap size={20} /> },
    { days: 365, title: 'Elite VIP', price: '8,900', desc: 'คุ้มค่าที่สุด! ประหยัดกว่า 25%', icon: <Crown size={20} />, popular: true },
    { days: 3650, title: 'Lifetime', price: '29,000', desc: 'จ่ายครั้งเดียว ใช้งานได้ตลอดชีพ', icon: <Star size={20} /> }
  ];

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>กำลังโหลดข้อมูลสมาชิก...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>User Management</h1>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>จัดการข้อมูลสมาชิกและสิทธิ์การเข้าถึงทั้งหมด</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <button 
            onClick={toggleRegistration}
            disabled={isSettingLoading}
            style={{ 
              marginBottom: '1rem', 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 600, 
              backgroundColor: allowRegistration ? '#ef4444' : '#10b981', 
              color: 'white', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: isSettingLoading ? 0.7 : 1
            }}
          >
            {isSettingLoading ? 'กำลังบันทึก...' : allowRegistration ? 'ปิดรับสมัครสมาชิก' : 'เปิดรับสมัครสมาชิก'}
          </button>

          <div style={{ position: 'absolute', top: '75%', left: '1rem', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาอีเมลสมาชิก..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
              borderRadius: '12px', border: '1px solid #cbd5e1', 
              outline: 'none', fontSize: '0.95rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expires At</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>ไม่พบข้อมูลสมาชิก</td></tr>
            ) : filteredUsers.map(u => {
              const isVipActive = u.plan_type === 'vip' && u.status === 'active' && new Date(u.end_date) > new Date();
              
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b', fontWeight: 'bold' }}>
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.email}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {u.role === 'admin' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Shield size={14} /> Admin
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                        <User size={14} /> User
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {isVipActive ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Crown size={14} /> VIP Active
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                        Free Plan
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                    {u.end_date ? new Date(u.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedUser(u)}
                      style={{ 
                        backgroundColor: 'white', color: '#3b82f6', border: '1px solid #cbd5e1', 
                        padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', 
                        fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#f8fafc'; }}
                      onMouseOut={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = 'white'; }}
                    >
                      Manage Plan
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Premium Upgrade Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '800px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button 
              onClick={() => setSelectedUser(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={24} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1rem auto', color: '#3b82f6' }}>
                <Crown size={28} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>อัปเกรดสมาชิก VIP</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>เลือกแพ็กเกจที่ต้องการต่ออายุให้กับบัญชี <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedUser.email}</span></p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
              {packages.map((pkg, idx) => (
                <PricingCard 
                  key={idx}
                  title={pkg.title}
                  price={pkg.price}
                  durationDays={pkg.days}
                  description={pkg.desc}
                  isPopular={pkg.popular}
                  icon={pkg.icon}
                  selected={selectedTier === pkg.days}
                  onClick={() => setSelectedTier(pkg.days)}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
              <button 
                onClick={() => setSelectedUser(null)}
                style={{ padding: '0.875rem 2rem', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                style={{ padding: '0.875rem 3rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isUpgrading ? 0.7 : 1, boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)' }}
                onMouseOver={e => !isUpgrading && (e.currentTarget.style.backgroundColor = '#2563eb')}
                onMouseOut={e => !isUpgrading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
              >
                {isUpgrading ? 'กำลังดำเนินการ...' : 'ยืนยันการต่ออายุ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
