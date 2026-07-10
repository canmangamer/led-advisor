import React from 'react';

const PageContainer = ({ title, children }) => (
  <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a', borderBottom: '4px solid #38bdf8', paddingBottom: '0.5rem', display: 'inline-block' }}>
      {title}
    </h1>
      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', lineHeight: 1.8, fontSize: '1.05rem', color: '#334155' }}>
        {children}
      </div>
    </div>
  </div>
);

export const About = () => (
  <PageContainer title="เกี่ยวกับเรา (About Us)">
    <p style={{ marginBottom: '1rem' }}>
      <strong>YokPai (ยกป้าย)</strong> ถือกำเนิดขึ้นจากความตั้งใจที่จะปฏิวัติวงการประมูลอสังหาริมทรัพย์ในประเทศไทย เราเข้าใจดีว่าการลงทุนในทรัพย์บังคับคดีนั้นเต็มไปด้วยโอกาส แต่ก็แฝงไปด้วยความเสี่ยงและข้อมูลที่กระจัดกระจาย
    </p>
    <p style={{ marginBottom: '1rem' }}>
      แพลตฟอร์มของเราถูกพัฒนาขึ้นโดยทีมวิศวกรและนักลงทุนอสังหาริมทรัพย์ตัวจริง เพื่อให้คุณสามารถค้นหา วิเคราะห์ และตัดสินใจลงทุนได้อย่างแม่นยำ ด้วยเครื่องมือคำนวณที่ครอบคลุมทุกค่าใช้จ่ายแอบแฝง
    </p>
    <p>
      มาร่วมสร้างผลตอบแทนที่ยั่งยืนไปกับ YokPai แพลตฟอร์มที่ตอบโจทย์นักลงทุนอย่างแท้จริง
    </p>
  </PageContainer>
);

export const Terms = () => (
  <PageContainer title="เงื่อนไขการให้บริการ (Terms of Service)">
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. การยอมรับเงื่อนไข</h3>
    <p style={{ marginBottom: '1rem' }}>การใช้งานแพลตฟอร์ม YokPai ถือว่าท่านยอมรับเงื่อนไขการให้บริการเหล่านี้ทั้งหมด</p>
    
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. ข้อมูลและการวิเคราะห์</h3>
    <p style={{ marginBottom: '1rem' }}>ข้อมูลที่แสดงบนแพลตฟอร์มนี้เป็นข้อมูลที่รวบรวมเพื่อประกอบการตัดสินใจ การคำนวณค่าใช้จ่ายและกำไรเป็นเพียงการประมาณการเท่านั้น ทางเราไม่รับผิดชอบต่อความสูญเสียหรือความเสียหายใดๆ ที่เกิดจากการตัดสินใจลงทุนของท่าน</p>
    
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. บัญชีผู้ใช้งาน</h3>
    <p>ท่านต้องรักษาความลับของรหัสผ่านและข้อมูลบัญชีของท่าน ทางเราสงวนสิทธิ์ในการระงับบัญชีหากพบการใช้งานที่ผิดวัตถุประสงค์</p>
  </PageContainer>
);

export const Privacy = () => (
  <PageContainer title="นโยบายความเป็นส่วนตัว (Privacy Policy)">
    <p style={{ marginBottom: '1rem' }}>เราให้ความสำคัญอย่างยิ่งกับการปกป้องข้อมูลส่วนบุคคลของคุณ</p>
    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <li><strong>การเก็บข้อมูล:</strong> เราจัดเก็บเฉพาะข้อมูลที่จำเป็นต่อการให้บริการ เช่น อีเมล, ข้อมูลการค้นหา, และรายการโปรดที่คุณบันทึกไว้</li>
      <li><strong>การใช้ข้อมูล:</strong> ข้อมูลของคุณจะถูกใช้เพื่อปรับปรุงประสบการณ์การใช้งานแพลตฟอร์มให้ดียิ่งขึ้นเท่านั้น</li>
      <li><strong>การแบ่งปันข้อมูล:</strong> เราจะไม่นำข้อมูลส่วนตัวของคุณไปขายหรือส่งต่อให้บุคคลที่สามโดยเด็ดขาด ยกเว้นกรณีที่กฎหมายกำหนด</li>
    </ul>
  </PageContainer>
);

export const Contact = () => (
  <PageContainer title="ติดต่อทีมงาน (Contact Us)">
    <p style={{ marginBottom: '1.5rem' }}>หากคุณมีข้อเสนอแนะ แจ้งปัญหาการใช้งาน หรือต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเราได้ผ่านช่องทางดังนี้:</p>
    
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <strong style={{ display: 'block', color: '#0f172a' }}>อีเมล (Email)</strong>
        support@yokpai.com
      </div>
      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <strong style={{ display: 'block', color: '#0f172a' }}>เฟซบุ๊ก (Facebook)</strong>
        fb.com/YokPaiInvestor
      </div>
      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <strong style={{ display: 'block', color: '#0f172a' }}>โทรศัพท์ (Phone)</strong>
        02-XXX-XXXX (จันทร์-ศุกร์ 09:00 - 18:00)
      </div>
    </div>
  </PageContainer>
);
