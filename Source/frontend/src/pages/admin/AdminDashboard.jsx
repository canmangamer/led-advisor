import React, { useState, useEffect } from 'react';
import { Users, Crown, Clock, ArrowUpRight, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon, gradientFrom, gradientTo, trend }) => (
  <div style={{ 
    backgroundColor: 'white', 
    padding: '1.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)', 
    display: 'flex', 
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }} />
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
        <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{value}</h3>
      </div>
      <div style={{ 
        padding: '1rem', 
        background: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}22)`, 
        borderRadius: '12px', 
        color: gradientFrom 
      }}>
        {icon}
      </div>
    </div>
    
    {trend && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#10b981', marginTop: '0.5rem' }}>
        <ArrowUpRight size={16} />
        <span>{trend} เพิ่มขึ้นจากสัปดาห์ที่แล้ว</span>
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_users: 0, active_vips: 0, expiring_soon: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
      <Activity size={32} className="animate-spin" style={{ marginRight: '1rem' }} />
      <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>กำลังดึงข้อมูล...</span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>Dashboard Overview</h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>ยินดีต้อนรับสู่ระบบจัดการหลักของ YokPai ตรวจสอบข้อมูลสถิติที่สำคัญได้ที่นี่</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard 
          title="ผู้ใช้งานทั้งหมด" 
          value={stats.total_users.toLocaleString()} 
          icon={<Users size={28} />} 
          gradientFrom="#3b82f6" 
          gradientTo="#2563eb"
          trend="+12%"
        />
        <StatCard 
          title="สมาชิก VIP (Active)" 
          value={stats.active_vips.toLocaleString()} 
          icon={<Crown size={28} />} 
          gradientFrom="#f59e0b" 
          gradientTo="#d97706"
          trend="+5%"
        />
        <StatCard 
          title="VIP ใกล้หมดอายุ (7 วัน)" 
          value={stats.expiring_soon.toLocaleString()} 
          icon={<Clock size={28} />} 
          gradientFrom="#ef4444" 
          gradientTo="#dc2626"
        />
      </div>

      {/* Mock Recent Activity Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>ความเคลื่อนไหวล่าสุด (Recent Activity)</h2>
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>ดูทั้งหมด</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { id: 1, action: 'อัปเกรดเป็น VIP (1 ปี)', user: 'user1@example.com', time: '10 นาทีที่แล้ว', color: '#10b981' },
            { id: 2, action: 'สมัครสมาชิกใหม่', user: 'new_investor@gmail.com', time: '1 ชั่วโมงที่แล้ว', color: '#3b82f6' },
            { id: 3, action: 'อัปเกรดเป็น VIP (3 เดือน)', user: 'john.doe@hotmail.com', time: '3 ชั่วโมงที่แล้ว', color: '#10b981' },
            { id: 4, action: 'สมาชิก VIP หมดอายุ', user: 'test_expired@yokpai.com', time: 'เมื่อวานนี้', color: '#ef4444' }
          ].map(activity => (
            <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activity.color }}></div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>{activity.action}</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>{activity.user}</p>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
