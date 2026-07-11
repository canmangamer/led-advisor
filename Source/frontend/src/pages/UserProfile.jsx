import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Heart, Briefcase, Bookmark, History, 
  TrendingUp, Award, MapPin, Search, Calendar, ChevronRight, Star,
  Settings, Shield, CreditCard, Bell, HelpCircle, Activity, LayoutDashboard,
  Save, Upload, AlertCircle, CheckCircle, Mail, Smartphone, Key, Lock, Clock, FileText, MessageSquare, ChevronDown
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { AuthContext } from '../context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState({
    favorites: 0,
    portfolio: 0,
    savedFilters: 0,
    recentlyViewed: 12
  });
  
  // Data for preview lists
  const [favoritesList, setFavoritesList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for charts & features
  const assetTypeData = [
    { name: 'ที่ดินเปล่า', value: 35 },
    { name: 'บ้านเดี่ยว', value: 25 },
    { name: 'ห้องชุด', value: 20 },
    { name: 'ทาวน์เฮ้าส์', value: 15 },
    { name: 'อื่นๆ', value: 5 },
  ];

  const priceRangeData = [
    { name: '< 1 ลบ.', value: 10 },
    { name: '1-3 ลบ.', value: 45 },
    { name: '3-5 ลบ.', value: 30 },
    { name: '5-10 ลบ.', value: 12 },
    { name: '> 10 ลบ.', value: 3 },
  ];

  const recentAssets = [
    { id: 1, type: 'บ้านเดี่ยว', location: 'บางเขน, กทม.', price: '3,200,000', label: 'ดูล่าสุด' },
    { id: 2, type: 'ที่ดินเปล่า', location: 'สันทราย, เชียงใหม่', price: '1,500,000', label: 'ดูล่าสุด' },
    { id: 3, type: 'ห้องชุด', location: 'เมือง, นนทบุรี', price: '2,100,000', label: 'ดูล่าสุด' },
  ];

  const recentSearches = [
    "บ้านเดี่ยว นนทบุรี ไม่เกิน 3 ล้าน",
    "ที่ดินเปล่า เชียงใหม่ 100 ตร.ว.",
    "คอนโด ใกล้ BTS สุขุมวิท"
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch portfolio count & list
        const portRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets?portfolioOnly=true`);
        const portData = await portRes.json();
        
        // Fetch favorites count & list
        const favRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets?favoritesOnly=true`);
        const favData = await favRes.json();
        
        // Get saved filters count
        const savedFilters = JSON.parse(localStorage.getItem('led_saved_filters') || '[]');

        setStats({
          favorites: favData.data?.length || 0,
          portfolio: portData.data?.length || 0,
          savedFilters: savedFilters.length,
          recentlyViewed: Math.floor(Math.random() * 20) + 15 // Mock
        });

        // Set top 3 lists
        if (favData.data) {
          setFavoritesList(favData.data.slice(0, 3));
        }
        if (portData.data) {
          // Mock sorting by upcoming date by just taking the first 3 for now
          setPortfolioList(portData.data.slice(0, 3));
        }

      } catch (err) {
        console.error('Error fetching user stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, user, authLoading]);

  if (authLoading || !user || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '1.25rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'ทรัพย์ที่ถูกใจ', value: stats.favorites, icon: <Heart size={24} color="#ef4444" />, bg: '#fef2f2', border: '#fecaca', link: '/portfolio' },
    { title: 'ทรัพย์ในพอร์ต', value: stats.portfolio, icon: <Briefcase size={24} color="#3b82f6" />, bg: '#eff6ff', border: '#bfdbfe', link: '/portfolio' },
    { title: 'ตัวกรองที่บันทึก', value: stats.savedFilters, icon: <Bookmark size={24} color="#8b5cf6" />, bg: '#f5f3ff', border: '#ddd6fe', link: '/saved-searches' },
    { title: 'เข้าชมล่าสุด', value: stats.recentlyViewed, icon: <History size={24} color="#10b981" />, bg: '#ecfdf5', border: '#a7f3d0', link: '#' },
  ];

  // Helper to format price
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '-';
    return `฿${Number(price).toLocaleString(undefined, {maximumFractionDigits:0})}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '4rem' }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hover-lift { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(226, 232, 240, 0.8); }
        .sidebar-item { display: flex; items-center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; color: #475569; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .sidebar-item:hover { background-color: #f1f5f9; color: #1e293b; }
        .sidebar-item.active { background-color: #eff6ff; color: #2563eb; font-weight: 600; }
        .heatmap-cell { width: 12px; height: 12px; border-radius: 3px; background-color: #e2e8f0; transition: transform 0.1s; }
        .heatmap-cell:hover { transform: scale(1.2); }
        .heatmap-cell.level-1 { background-color: #dbeafe; }
        .heatmap-cell.level-2 { background-color: #93c5fd; }
        .heatmap-cell.level-3 { background-color: #3b82f6; }
        .heatmap-cell.level-4 { background-color: #1d4ed8; }
      `}</style>
      
      {/* Premium Header */}
      <div style={{ 
        height: '240px', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)', transform: 'rotate(-20deg)' }}></div>
        <div style={{ position: 'absolute', bottom: '-30%', right: '-5%', width: '40%', height: '150%', background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)', transform: 'rotate(20deg)' }}></div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '-80px auto 0', padding: '0 1.5rem', display: 'flex', gap: '2rem', position: 'relative', zIndex: 10, alignItems: 'flex-start' }}>
        
        {/* Left Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          {/* User Info Card */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '2rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'white', 
              padding: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center',
              position: 'absolute', top: '-50px'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <User size={48} color="#2563eb" />
              </div>
            </div>
            
            <h2 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700, margin: '40px 0 0 0', textAlign: 'center', wordBreak: 'break-all' }}>
              {user.email}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} fill="#d97706" color="#d97706" /> {user.role === 'admin' ? 'Administrator' : 'VIP Member'}
              </span>
            </div>

            {/* Persona Badge */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', width: '100%', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Investor Persona</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 700 }}>
                <div style={{ backgroundColor: '#dcfce7', padding: '6px', borderRadius: '8px' }}><MapPin size={16} color="#16a34a" /></div>
                นักลงทุนสายทำเลทอง
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> ภาพรวม (Dashboard)
            </div>
            <div className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={20} /> ตั้งค่าบัญชี
            </div>
            <div className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Shield size={20} /> ความปลอดภัย
            </div>
            <div className={`sidebar-item ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => setActiveTab('subscription')}>
              <CreditCard size={20} /> แพ็กเกจและการชำระเงิน
            </div>
            <div className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={20} /> การแจ้งเตือน
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
            <div className={`sidebar-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>
              <HelpCircle size={20} /> ศูนย์ช่วยเหลือ
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, marginTop: '100px' }}>
          
          {activeTab === 'dashboard' ? (
            <>
              {/* Smart Alert */}
              <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '0 12px 12px 0', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#3b82f6', borderRadius: '50%', padding: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', animation: 'pulse 2s infinite' }}>
                  <Bell size={18} />
                </div>
                <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }`}</style>
                <div>
                  <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '1rem', fontWeight: 700 }}>แจ้งเตือนสำคัญ!</h4>
                  <p style={{ margin: '2px 0 0 0', color: '#3b82f6', fontSize: '0.9rem' }}>คุณมีทรัพย์ในพอร์ตที่กำลังจะเปิดประมูล <strong style={{ color: '#1d4ed8' }}>2 รายการ</strong> ในสัปดาห์นี้</p>
                </div>
              </div>

              {/* Stat Cards - Hyperlinked */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {statCards.map((stat, idx) => (
                  <Link key={idx} to={stat.link} style={{ textDecoration: 'none' }}>
                    <div className="hover-lift glass-panel" style={{ 
                      borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden'
                    }}>
                      <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05, transform: 'scale(2.5)' }}>{stat.icon}</div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: stat.bg, border: `1px solid ${stat.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        {stat.icon}
                      </div>
                      <div style={{ zIndex: 1 }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{stat.title}</p>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Quick Access Top 3 Lists */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                {/* 1. Top 3 Favorites */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>
                      <Heart size={18} color="#ef4444" fill="#fecaca" /> โปรดล่าสุด (Top 3)
                    </h3>
                    <Link to="/portfolio" style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      ดูทั้งหมด <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {favoritesList.length > 0 ? favoritesList.map((asset, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: i < 2 ? '1px dashed #e2e8f0' : 'none' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{asset['ประเภททรัพย์']}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}><MapPin size={10} /> {asset['จังหวัด']}</div>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{formatPrice(asset['ราคาประเมิน'])}</div>
                      </div>
                    )) : <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>ไม่มีรายการโปรด</div>}
                  </div>
                </div>

                {/* 2. Top 3 Upcoming */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderTop: '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>
                      <Calendar size={18} color="#3b82f6" /> ใกล้ประมูล (Top 3)
                    </h3>
                    <Link to="/portfolio" style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      ดูพอร์ต <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {portfolioList.length > 0 ? portfolioList.map((asset, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: i < 2 ? '1px dashed #e2e8f0' : 'none' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{asset['ประเภททรัพย์']} ({asset['คดีหมายเลขแดงที่']})</div>
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>กำลังจะมาถึง!</div>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{formatPrice(asset['ราคาประเมิน'])}</div>
                      </div>
                    )) : <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>ไม่มีทรัพย์ในพอร์ต</div>}
                  </div>
                </div>

                {/* 3. Top 3 Recently Viewed */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>
                      <History size={18} color="#10b981" /> เพิ่งเปิดดู (Top 3)
                    </h3>
                    <Link to="/" style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      ค้นหาต่อ <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentAssets.map((asset, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: i < 2 ? '1px dashed #e2e8f0' : 'none' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{asset.type}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}><MapPin size={10} /> {asset.location}</div>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>฿{asset.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Charts & Analytics Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>
                    <TrendingUp size={18} color="#3b82f6" /> สัดส่วนประเภททรัพย์ในพอร์ต
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={assetTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                          {assetTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'สัดส่วน']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>
                    <Award size={18} color="#f59e0b" /> ช่วงราคายอดนิยมที่ค้นหา
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priceRangeData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Gamification: Activity Heatmap & Recent Searches */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                
                {/* Heatmap */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.1rem' }}>
                    <Activity size={18} color="#8b5cf6" /> กิจกรรมการเข้าใช้งาน (30 วัน)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '4px', maxWidth: '300px' }}>
                    {/* Render random heatmap cells for demonstration */}
                    {Array.from({ length: 45 }).map((_, i) => {
                      const level = Math.floor(Math.random() * 5); // 0-4
                      return (
                        <div key={i} className={`heatmap-cell ${level > 0 ? `level-${level}` : ''}`} title={`กิจกรรมระดับ ${level}`}></div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>น้อย</span>
                    <div className="heatmap-cell"></div>
                    <div className="heatmap-cell level-1"></div>
                    <div className="heatmap-cell level-2"></div>
                    <div className="heatmap-cell level-3"></div>
                    <div className="heatmap-cell level-4"></div>
                    <span>มาก</span>
                  </div>
                </div>

                {/* Recent Searches */}
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>
                      <Search size={18} color="#ec4899" /> ประวัติการค้นหาล่าสุด
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {recentSearches.map((search, i) => (
                      <div key={i} className="hover-lift" style={{ 
                        padding: '6px 12px', backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', color: '#be185d', 
                        borderRadius: '100px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Search size={12} /> {search}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </>
          ) : activeTab === 'settings' ? (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '2rem', minHeight: '400px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>
                <Settings size={22} color="#3b82f6" /> ตั้งค่าบัญชี
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Profile Picture Upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #cbd5e1' }}>
                    <User size={32} color="#94a3b8" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>รูปโปรไฟล์</h4>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', color: '#475569' }}>
                        <Upload size={14} /> อัปโหลดรูปภาพ
                      </button>
                      <button style={{ padding: '6px 12px', backgroundColor: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', color: '#ef4444' }}>ลบรูปภาพ</button>
                    </div>
                  </div>
                </div>

                {/* Personal Info Form */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>ชื่อจริง</label>
                    <input type="text" placeholder="ชื่อของคุณ" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>นามสกุล</label>
                    <input type="text" placeholder="นามสกุลของคุณ" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>อีเมล (ไม่สามารถเปลี่ยนได้)</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="email" value={user.email} disabled style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>เบอร์โทรศัพท์</label>
                    <div style={{ position: 'relative' }}>
                      <Smartphone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="tel" placeholder="08X-XXX-XXXX" style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}>
                    <Save size={16} /> บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'security' ? (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '2rem', minHeight: '400px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>
                <Shield size={22} color="#10b981" /> ความปลอดภัย
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Change Password */}
                <div>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Key size={18} color="#64748b" /> เปลี่ยนรหัสผ่าน
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: '500px' }}>
                    <div>
                      <input type="password" placeholder="รหัสผ่านปัจจุบัน" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <input type="password" placeholder="รหัสผ่านใหม่" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
                      อัปเดตรหัสผ่าน
                    </button>
                  </div>
                </div>

                {/* 2FA */}
                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={18} color="#64748b" /> ยืนยันตัวตนแบบสองขั้นตอน (2FA)
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>เพิ่มความปลอดภัยให้บัญชีของคุณด้วยการยืนยันตัวตนผ่าน SMS หรือ App</p>
                    </div>
                    <div style={{ width: '48px', height: '24px', backgroundColor: '#e2e8f0', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'subscription' ? (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '2rem', minHeight: '400px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>
                <CreditCard size={22} color="#f59e0b" /> แพ็กเกจและการชำระเงิน
              </h3>

              {/* Current Plan */}
              <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', borderRadius: '16px', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Plan</div>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star fill="#fcd34d" color="#fcd34d" size={28} /> {user.role === 'admin' ? 'Administrator' : 'VIP Member'}
                  </h2>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>แพ็กเกจของคุณจะหมดอายุในวันที่ 31 ธ.ค. 2026</p>
                </div>
                <button 
                  onClick={() => navigate('/pricing')}
                  style={{ padding: '10px 24px', backgroundColor: '#f59e0b', color: '#78350f', border: 'none', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                >
                  อัปเกรดแพ็กเกจ
                </button>
              </div>

              {/* Billing History */}
              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="#64748b" /> ประวัติการชำระเงิน
                </h4>
                <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>วันที่</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>รายการ</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>จำนวนเงิน</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>สถานะ</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>ใบเสร็จ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155' }}>01 ม.ค. 2026</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155' }}>VIP Member (รายปี)</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155' }}>฿9,900</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>สำเร็จ</span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                          <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><FileText size={16} /></button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '2rem', minHeight: '400px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>
                <Bell size={22} color="#8b5cf6" /> การแจ้งเตือน
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>แจ้งเตือนทรัพย์ใกล้ประมูล</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>รับอีเมลแจ้งเตือนเมื่อทรัพย์ในพอร์ตใกล้ถึงวันประมูล (ล่วงหน้า 3 วัน)</p>
                  </div>
                  <div style={{ width: '48px', height: '24px', backgroundColor: '#10b981', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>แจ้งเตือนตัวกรองใหม่</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>รับอีเมลเมื่อมีทรัพย์ใหม่ที่ตรงกับ "ตัวกรองที่บันทึกไว้"</p>
                  </div>
                  <div style={{ width: '48px', height: '24px', backgroundColor: '#10b981', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#22c55e', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>LINE</div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#166534' }}>Line Notify</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>รับการแจ้งเตือนผ่านทาง Line ส่วนตัวของคุณได้ทันที</p>
                    </div>
                  </div>
                  <button style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    เชื่อมต่อบัญชี
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'help' ? (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '2rem', minHeight: '400px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>
                <HelpCircle size={22} color="#ec4899" /> ศูนย์ช่วยเหลือ
              </h3>

              {/* LINE Contact Banner - Full Width */}
              <div style={{
                background: 'linear-gradient(135deg, #06c755 0%, #00b347 100%)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '2.5rem',
                color: 'white',
                boxShadow: '0 10px 25px -5px rgba(6, 199, 85, 0.4)'
              }}>
                {/* QR Code Card */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <img
                    src="/line_qr.jpg"
                    alt="LINE QR Code"
                    style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <p style={{ margin: 0, color: '#06c755', fontWeight: 700, fontSize: '1rem' }}>@YokPai</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>สแกนเพื่อเพิ่มเพื่อน</p>
                </div>

                {/* Text + Button */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: '10px',
                      padding: '6px 10px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '1px'
                    }}>LINE</div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>ติดต่อผ่าน LINE</h2>
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                    ทีมงานพร้อมให้บริการทุกวัน <strong>08:00 – 20:00 น.</strong><br />
                    ตอบกลับภายใน <strong>15 นาที</strong> ในช่วงเวลาทำการ
                  </p>
                  <p style={{ margin: '0 0 1.25rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                    สแกน QR Code ด้านซ้าย หรือกดปุ่มด้านล่างเพื่อเพิ่มเพื่อนได้เลยครับ
                  </p>
                  <a
                    href="https://line.me/ti/p/~@YokPai"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '12px 28px',
                      backgroundColor: 'white',
                      color: '#06c755',
                      borderRadius: '100px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>LINE</span> เพิ่มเพื่อน
                  </a>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Contact Form */}
                <div>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={18} color="#64748b" /> ส่งข้อความหาทีมงาน
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <input type="text" placeholder="หัวข้อ" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <textarea placeholder="รายละเอียดปัญหา หรือข้อเสนอแนะ..." rows={4} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                    </div>
                    <button style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      ส่งข้อความ
                    </button>
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={18} color="#64748b" /> คำถามที่พบบ่อย (FAQ)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>วิธีเพิ่มทรัพย์ลงในพอร์ต?</span>
                      <ChevronDown size={16} color="#64748b" />
                    </div>
                    <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>ระบบอัปเดตข้อมูลทุกวันเวลาไหน?</span>
                      <ChevronDown size={16} color="#64748b" />
                    </div>
                    <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>เปลี่ยนอีเมลบัญชีผู้ใช้ได้อย่างไร?</span>
                      <ChevronDown size={16} color="#64748b" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '3rem', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Settings size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>หน้านี้อยู่ในระหว่างการพัฒนา</h3>
              <p style={{ color: '#64748b', margin: 0 }}>จำลองหน้าต่างสำหรับเมนู {activeTab} โปรดติดตามการอัปเดตเร็วๆ นี้!</p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                style={{ marginTop: '1.5rem', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                กลับไปที่หน้าภาพรวม
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
