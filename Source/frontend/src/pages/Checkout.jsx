import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CreditCard, QrCode, Lock, CheckCircle } from 'lucide-react';

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get state from navigation (from Pricing.jsx)
  const planName = location.state?.planName || 'Advanced';
  const price = location.state?.price || '490';
  const numericPrice = parseInt(price.replace(/,/g, ''));
  const tax = numericPrice * 0.07;
  const total = numericPrice + tax;

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API Call to Payment Gateway
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Auto redirect to dashboard after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', height: '100%', overflowY: 'auto', padding: '2rem', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', textAlign: 'center', maxWidth: '500px', width: '100%', margin: 'auto' }}>
          <div style={{ color: '#10b981', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle size={80} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>ชำระเงินสำเร็จ!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
            ยินดีต้อนรับสู่แพ็กเกจ <strong>{planName}</strong><br/>คุณสามารถเริ่มใช้งานฟีเจอร์ทั้งหมดได้ทันที
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>กำลังพากลับไปยังหน้าหลัก...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/pricing" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>&larr; กลับไปหน้าเลือกแพ็กเกจ</Link>
        </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Payment Form Column */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>เลือกวิธีชำระเงิน</h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => setPaymentMethod('credit_card')}
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: paymentMethod === 'credit_card' ? '2px solid #38bdf8' : '1px solid #cbd5e1', backgroundColor: paymentMethod === 'credit_card' ? '#f0f9ff' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: paymentMethod === 'credit_card' ? '#0284c7' : '#64748b', fontWeight: 600 }}
            >
              <CreditCard size={28} />
              บัตรเครดิต/เดบิต
            </button>
            <button 
              onClick={() => setPaymentMethod('promptpay')}
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: paymentMethod === 'promptpay' ? '2px solid #38bdf8' : '1px solid #cbd5e1', backgroundColor: paymentMethod === 'promptpay' ? '#f0f9ff' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: paymentMethod === 'promptpay' ? '#0284c7' : '#64748b', fontWeight: 600 }}
            >
              <QrCode size={28} />
              พร้อมเพย์ (QR Code)
            </button>
          </div>

          <form onSubmit={handlePayment}>
            {paymentMethod === 'credit_card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>ชื่อบนบัตร</label>
                  <input type="text" placeholder="JOHN DOE" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>หมายเลขบัตร</label>
                  <input type="text" placeholder="0000 0000 0000 0000" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>วันหมดอายุ</label>
                    <input type="text" placeholder="MM/YY" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>CVC</label>
                    <input type="text" placeholder="123" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '200px', height: '200px', backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                  <QrCode size={100} color="#94a3b8" />
                </div>
                <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>เปิดแอปธนาคารเพื่อสแกน QR Code</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isProcessing}
              style={{ 
                width: '100%', 
                backgroundColor: isProcessing ? '#94a3b8' : '#0ea5e9', 
                color: 'white', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                marginTop: '2rem', 
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isProcessing ? 'กำลังดำเนินการ...' : `ชำระเงิน ฿${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
              {!isProcessing && <Lock size={18} />}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Shield size={14} /> ชำระเงินปลอดภัยด้วยมาตรฐาน SSL 256-bit
            </p>
          </form>
        </div>

        {/* Order Summary Column */}
        <div>
          <div style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>สรุปคำสั่งซื้อ</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#334155' }}>
              <span>แพ็กเกจ {planName} (1 เดือน)</span>
              <span>฿{numericPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
              <span>ภาษีมูลค่าเพิ่ม (7%)</span>
              <span>฿{tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            
            <div style={{ height: '1px', backgroundColor: '#cbd5e1', margin: '1.5rem 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>ยอดชำระสุทธิ</span>
              <span style={{ fontWeight: 800, color: '#0ea5e9', fontSize: '1.5rem' }}>฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '0.9rem', display: 'flex', gap: '0.75rem' }}>
            <div style={{ marginTop: '2px' }}><Shield size={20} /></div>
            <div>
              <strong>รับประกันความพึงพอใจ</strong>
              <p style={{ margin: 0, marginTop: '0.25rem' }}>หากคุณไม่พอใจ ยินดีคืนเงินเต็มจำนวนภายใน 7 วันแรกของการใช้งาน (เฉพาะแพ็กเกจ Advanced ขึ้นไป)</p>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};
