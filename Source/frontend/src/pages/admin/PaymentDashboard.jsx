import React, { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, Download, ArrowUpRight, CheckCircle, Clock, Search, Settings } from 'lucide-react';

const formatCurrency = (num) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{title}</p>
        <h3 style={{ margin: '0.5rem 0', fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{value}</h3>
      </div>
      <div style={{ padding: '0.75rem', backgroundColor: `${color}15`, borderRadius: '12px', color: color }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
      <ArrowUpRight size={16} /> <span>{subtitle}</span>
    </div>
  </div>
);

const mockTransactions = [
  { id: 'TXN-001', user: 'investor_pro@yokpai.com', amount: 8900, plan: 'Elite VIP (1 ปี)', date: '2026-07-05 10:30', status: 'completed', method: 'PromptPay' },
  { id: 'TXN-002', user: 'new_user22@gmail.com', amount: 990, plan: 'Starter (1 เดือน)', date: '2026-07-05 09:15', status: 'completed', method: 'Credit Card' },
  { id: 'TXN-003', user: 'wealth_builder@hotmail.com', amount: 2590, plan: 'Pro (3 เดือน)', date: '2026-07-04 18:45', status: 'completed', method: 'Bank Transfer' },
  { id: 'TXN-004', user: 'somchai.inv@yokpai.com', amount: 29000, plan: 'Lifetime', date: '2026-07-04 14:20', status: 'pending', method: 'Bank Transfer' },
  { id: 'TXN-005', user: 'demo_acc@yokpai.com', amount: 8900, plan: 'Elite VIP (1 ปี)', date: '2026-07-03 11:10', status: 'completed', method: 'PromptPay' },
];

const PaymentDashboard = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [search, setSearch] = useState('');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard color="#3b82f6" size={32} /> Payments & Revenue
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>จัดการระบบชำระเงินและดูรายงานรายได้ทั้งหมด</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard 
          title="รายได้รวม (Total Revenue)" 
          value={formatCurrency(452800)} 
          subtitle="+12.5% จากเดือนที่แล้ว" 
          icon={<DollarSign size={28} />} 
          color="#10b981" 
        />
        <StatCard 
          title="รายรับประจำเดือน (MRR)" 
          value={formatCurrency(125000)} 
          subtitle="+5.2% จากเดือนที่แล้ว" 
          icon={<TrendingUp size={28} />} 
          color="#3b82f6" 
        />
        <StatCard 
          title="ยอดขายวันนี้ (Today)" 
          value={formatCurrency(12480)} 
          subtitle="+2 รายการใหม่" 
          icon={<CreditCard size={28} />} 
          color="#f59e0b" 
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('transactions')}
          style={{ background: 'none', border: 'none', padding: '0 0 1rem 0', fontWeight: 600, fontSize: '1rem', color: activeTab === 'transactions' ? '#3b82f6' : '#64748b', borderBottom: activeTab === 'transactions' ? '3px solid #3b82f6' : '3px solid transparent', cursor: 'pointer' }}
        >
          ประวัติการชำระเงิน (Transactions)
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ background: 'none', border: 'none', padding: '0 0 1rem 0', fontWeight: 600, fontSize: '1rem', color: activeTab === 'settings' ? '#3b82f6' : '#64748b', borderBottom: activeTab === 'settings' ? '3px solid #3b82f6' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Settings size={18} /> ตั้งค่าช่องทางรับเงิน
        </button>
      </div>

      {activeTab === 'transactions' && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>รายการล่าสุด (Recent Transactions)</h2>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="ค้นหา Transaction ID..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Transaction ID</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>User & Plan</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((t, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{t.id}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{t.user}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{t.plan} • {t.method}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(t.amount)}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{t.date}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {t.status === 'completed' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> สำเร็จ
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Clock size={14} /> รอตรวจสอบ
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div> PromptPay (QR Code)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>หมายเลขพร้อมเพย์ (เบอร์โทร/บัตรประชาชน)</label>
                <input type="text" defaultValue="081-234-5678" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>ชื่อบัญชี</label>
                <input type="text" defaultValue="บจก. หยกไพ พร็อพเพอร์ตี้" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <button style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>บันทึกการตั้งค่า PromptPay</button>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', opacity: 0.8 }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div> Stripe Integration (Credit Card)
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>เชื่อมต่อระบบชำระเงินผ่านบัตรเครดิตด้วย Stripe (รองรับเร็วๆ นี้)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Stripe Publishable Key</label>
                <input type="text" placeholder="pk_test_..." disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Stripe Secret Key</label>
                <input type="password" placeholder="sk_test_..." disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
              </div>
              <button disabled style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#cbd5e1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'not-allowed' }}>เชื่อมต่อ Stripe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;
