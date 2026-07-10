import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, Map, Home, Activity, PieChart, BarChart2, Heart, Edit3, Filter } from 'lucide-react';

const formatCurrency = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + ' ล้านบาท';
  return (num / 1000).toFixed(0) + ' พันบาท';
};

const DataAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
      <Activity size={32} className="animate-spin" style={{ marginRight: '1rem' }} />
      <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>กำลังดึงข้อมูลวิเคราะห์เชิงลึก...</span>
    </div>
  );

  if (!data) return <div>ไม่สามารถโหลดข้อมูลได้</div>;

  const maxTypeCount = data.asset_types.length ? Math.max(...data.asset_types.map(t => t.count)) : 1;
  const maxProvinceCount = data.top_provinces.length ? Math.max(...data.top_provinces.map(p => p.count)) : 1;

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database color="#3b82f6" size={32} /> Data Analytics
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>วิเคราะห์ข้อมูลเชิงลึกของทรัพย์สินในระบบ (Database Analytics)</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>จำนวนทรัพย์ทั้งหมด</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{data.total_assets.toLocaleString()}</h3>
            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>รายการ</span>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>มูลค่ารวมประเมิน (Market Value)</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(data.total_value)}</h3>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>ราคาเฉลี่ยต่อรายการ</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{data.total_assets ? formatCurrency(data.total_value / data.total_assets) : 0}</h3>
          </div>
        </div>

        {/* User Activity Stats */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #ec4899' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Heart size={16} color="#ec4899" /> ทรัพย์ที่ถูกใจ</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{data.total_favorites?.toLocaleString() || 0}</h3>
            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>รายการ</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit3 size={16} color="#f59e0b" /> บันทึกการวิเคราะห์</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{data.total_notes?.toLocaleString() || 0}</h3>
            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>รายการ</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #14b8a6' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter size={16} color="#14b8a6" /> ตัวกรองที่บันทึกไว้</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{data.total_filters?.toLocaleString() || 0}</h3>
            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>ชุด</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* Asset Type Breakdown */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={20} color="#3b82f6" /> สัดส่วนประเภททรัพย์
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.asset_types.map((type, idx) => {
              const percentage = (type.count / data.total_assets) * 100;
              const width = (type.count / maxTypeCount) * 100;
              const color = colors[idx % colors.length];
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{type.type}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{type.count.toLocaleString()} <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>({percentage.toFixed(1)}%)</span></span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                    <div style={{ width: `${width}%`, backgroundColor: color, height: '100%', borderRadius: '8px', transition: 'width 1s ease-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Provinces */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Map size={20} color="#10b981" /> 5 อันดับจังหวัดที่มีทรัพย์เยอะที่สุด
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.top_provinces.map((prov, idx) => {
              const width = (prov.count / maxProvinceCount) * 100;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{prov.province}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{prov.count.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${width}%`, backgroundColor: '#10b981', height: '100%', borderRadius: '8px' }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Round Breakdown */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#f59e0b" /> สถิติความยากง่ายในการประมูล
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {data.round_breakdown.map((round, idx) => {
              const percentage = (round.count / data.total_assets) * 100;
              return (
                <div key={idx} style={{ flex: '1 1 45%', padding: '1.5rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600, marginBottom: '0.5rem' }}>{round.status}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#92400e' }}>{round.count.toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 500, marginTop: '0.25rem' }}>{percentage.toFixed(1)}% ของทั้งหมด</div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem', fontStyle: 'italic', lineHeight: 1.5 }}>
            *ข้อมูลนี้ช่วยวิเคราะห์ได้ว่าทรัพย์ประเภทต่างๆ ส่วนใหญ่มักจะถูกประมูลไปในรอบแรก หรือต้องรอมูลค่าลดลงในรอบถัดๆ ไป (ประมูลหลายรอบ)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataAnalytics;
