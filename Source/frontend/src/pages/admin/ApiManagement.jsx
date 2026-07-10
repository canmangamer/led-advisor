import React from 'react';
import { Settings, Key, Link2, Shield, AlertCircle, CheckCircle2, Copy, Map } from 'lucide-react';

const ApiCard = ({ title, description, isConnected, icon }) => (
  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#475569' }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{description}</p>
        </div>
      </div>
      {isConnected ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.8rem', fontWeight: 600 }}>
          <CheckCircle2 size={14} /> Active
        </span>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', fontWeight: 600 }}>
          <AlertCircle size={14} /> Disconnected
        </span>
      )}
    </div>
    
    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>API Key</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="password" 
          defaultValue={isConnected ? "sk_live_1234567890abcdef" : ""} 
          placeholder="Enter API Key here..."
          style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
        />
        <button style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' }} title="Copy">
          <Copy size={16} />
        </button>
      </div>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
      <button style={{ backgroundColor: isConnected ? 'white' : '#3b82f6', color: isConnected ? '#ef4444' : 'white', border: isConnected ? '1px solid #fca5a5' : 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
        {isConnected ? 'Revoke Access' : 'Connect API'}
      </button>
    </div>
  </div>
);

const ApiManagement = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings color="#3b82f6" size={32} /> API Management
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', margin: 0 }}>ตั้งค่าการเชื่อมต่อ API ของระบบและ Third-party Integrations</p>
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Shield size={24} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.25rem' }}>Security First</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af', lineHeight: 1.5 }}>
            API Keys ทั้งหมดจะถูกเข้ารหัสก่อนบันทึกลงในฐานข้อมูล โปรดเก็บรักษา API Keys ของคุณเป็นความลับและไม่ควรแชร์ให้ผู้อื่น หากพบว่า Key รั่วไหล กรุณากด Revoke Access และสร้าง Key ใหม่ทันที
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>System Integrations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <ApiCard 
          title="LED Data Scraper API" 
          description="ระบบดึงข้อมูลอสังหาริมทรัพย์อัตโนมัติจากเว็บไซต์กรมบังคับคดี"
          isConnected={true}
          icon={<Link2 size={24} />}
        />
        <ApiCard 
          title="Google Maps Geocoding API" 
          description="แปลงที่อยู่เป็นพิกัดละติจูด/ลองจิจูดสำหรับแสดงผลบนแผนที่"
          isConnected={true}
          icon={<Map size={24} />} // We don't have Map imported here, using generic key
        />
        <ApiCard 
          title="Line Notify API" 
          description="สำหรับส่งแจ้งเตือนเมื่อมีอสังหาริมทรัพย์ใหม่เข้าระบบ หรือเมื่อมีผู้ใช้แจ้งโอนเงิน"
          isConnected={false}
          icon={<Key size={24} />}
        />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Webhook Endpoints</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Event Type</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Endpoint URL</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>Payment Received</td>
              <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>https://yokpai.com/api/webhook/payment</td>
              <td style={{ padding: '1rem 1.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                  Testing
                </span>
              </td>
              <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiManagement;
