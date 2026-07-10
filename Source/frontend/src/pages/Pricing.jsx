import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Shield, Star, Crown } from 'lucide-react';

const PricingCard = ({ title, price, period, icon: Icon, description, features, buttonText, recommended, onSelect }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: recommended ? '0 20px 25px -5px rgba(56, 189, 248, 0.2), 0 10px 10px -5px rgba(56, 189, 248, 0.1)' : 'var(--shadow-md)',
      border: recommended ? '2px solid #38bdf8' : '1px solid var(--border-color)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transform: recommended ? 'scale(1.05)' : 'none',
      zIndex: recommended ? 10 : 1
    }}>
      {recommended && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#38bdf8',
          color: '#0f172a',
          padding: '0.25rem 1rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          แนะนำสำหรับนักลงทุน
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ backgroundColor: recommended ? '#e0f2fe' : '#f1f5f9', padding: '0.75rem', borderRadius: '12px', color: recommended ? '#0284c7' : '#64748b' }}>
          <Icon size={24} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{title}</h3>
      </div>
      
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px' }}>{description}</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{price === '0' ? 'ฟรี' : `฿${price}`}</span>
        {price !== '0' && <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}> / {period}</span>}
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {features.map((feature, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: feature.included ? '#334155' : '#cbd5e1' }}>
            <div style={{ marginTop: '2px' }}>
              {feature.included ? <Check size={18} color={recommended ? '#0ea5e9' : '#10b981'} /> : <X size={18} color="#cbd5e1" />}
            </div>
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={() => onSelect(title, price)}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          border: 'none',
          backgroundColor: recommended ? '#0f172a' : '#f1f5f9',
          color: recommended ? 'white' : '#0f172a',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = recommended ? '#1e293b' : '#e2e8f0';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = recommended ? '#0f172a' : '#f1f5f9';
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

export const Pricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = React.useState(false);

  const handleSelectPlan = (planName, price) => {
    if (price === '0') {
      navigate('/register');
    } else {
      // Pass plan data to checkout via URL state
      navigate('/checkout', { state: { planName, price } });
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '100%', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>ลงทุนอย่างชาญฉลาด ด้วยเครื่องมือระดับโปร</h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6 }}>
          เลือกแพ็กเกจที่เหมาะสมกับเป้าหมายการลงทุนของคุณ ไม่ว่าคุณจะเป็นมือใหม่หรือนักลงทุนมืออาชีพ YokPai มีเครื่องมือที่พร้อมช่วยคุณทำกำไร
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <span style={{ fontWeight: !isYearly ? 700 : 400, color: !isYearly ? '#0f172a' : '#94a3b8' }}>รายเดือน</span>
        <button 
          onClick={() => setIsYearly(!isYearly)}
          style={{ width: '60px', height: '32px', backgroundColor: '#38bdf8', borderRadius: '16px', position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '4px', left: isYearly ? '32px' : '4px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
        </button>
        <span style={{ fontWeight: isYearly ? 700 : 400, color: isYearly ? '#0f172a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          รายปี <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>ประหยัด 16%</span>
        </span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        alignItems: 'center'
      }}>
        {/* Tier 1: Free */}
        <PricingCard
          title="Free"
          price="0"
          icon={Shield}
          description="เหมาะสำหรับผู้เริ่มต้นค้นหาและศึกษาข้อมูลทรัพย์บังคับคดี"
          buttonText="เริ่มต้นใช้งานฟรี"
          onSelect={handleSelectPlan}
          features={[
            { text: 'ค้นหาและดูข้อมูลทรัพย์เบื้องต้น', included: true },
            { text: 'บันทึกรายการโปรดได้ 5 รายการ', included: true },
            { text: 'เครื่องมือคำนวณ ROI เบื้องต้น', included: true },
            { text: 'ดูราคาประเมินและประวัติการประมูล', included: false },
            { text: 'แจ้งเตือนทรัพย์ใหม่เข้าตลาด', included: false },
            { text: 'ส่งออกข้อมูลรายงาน (PDF/Excel)', included: false },
            { text: 'ข้อมูลเจาะลึก (AI Market Insights)', included: false },
          ]}
        />

        {/* Tier 2: Advanced (Recommended) */}
        <PricingCard
          title="Advanced"
          price={isYearly ? "4,900" : "490"}
          period={isYearly ? "ปี" : "เดือน"}
          icon={Star}
          recommended={true}
          description="ปลดล็อกเครื่องมือวิเคราะห์เชิงลึก สำหรับนักลงทุนที่ต้องการความแม่นยำ"
          buttonText="อัปเกรดเป็น Advanced"
          onSelect={(name, price) => handleSelectPlan(`${name} (${isYearly ? 'รายปี' : 'รายเดือน'})`, price)}
          features={[
            { text: 'ค้นหาและดูข้อมูลทรัพย์เบื้องต้น', included: true },
            { text: 'บันทึกรายการโปรดไม่จำกัด', included: true },
            { text: 'เครื่องมือคำนวณ ROI ระดับโปร', included: true },
            { text: 'ดูราคาประเมินและประวัติการประมูล', included: true },
            { text: 'แจ้งเตือนทรัพย์ใหม่ (Email Alerts)', included: true },
            { text: 'ส่งออกข้อมูลรายงาน (PDF/Excel)', included: false },
            { text: 'ข้อมูลเจาะลึก (AI Market Insights)', included: false },
          ]}
        />

        {/* Tier 3: VIP */}
        <PricingCard
          title="VIP"
          price={isYearly ? "19,900" : "1,990"}
          period={isYearly ? "ปี" : "เดือน"}
          icon={Crown}
          description="สำหรับนักลงทุนตัวจริง ที่ต้องการข้อมูลวงในและผู้ช่วยส่วนตัว"
          buttonText="สมัคร VIP ทันที"
          onSelect={(name, price) => handleSelectPlan(`${name} (${isYearly ? 'รายปี' : 'รายเดือน'})`, price)}
          features={[
            { text: 'ค้นหาและดูข้อมูลทรัพย์เบื้องต้น', included: true },
            { text: 'บันทึกรายการโปรดไม่จำกัด', included: true },
            { text: 'เครื่องมือคำนวณ ROI ระดับโปร', included: true },
            { text: 'ดูราคาประเมินและประวัติการประมูล', included: true },
            { text: 'แจ้งเตือนทรัพย์ใหม่ (Line/SMS ก่อนใคร)', included: true },
            { text: 'ส่งออกข้อมูลรายงาน (PDF/Excel)', included: true },
            { text: 'ข้อมูลเจาะลึก (AI Market Insights)', included: true },
          ]}
        />
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b', fontSize: '0.9rem' }}>
        * ราคาดังกล่าวยังไม่รวมภาษีมูลค่าเพิ่ม 7%<br/>
        ** สามารถยกเลิกการต่ออายุอัตโนมัติได้ตลอดเวลา
      </div>
    </div>
  );
};
