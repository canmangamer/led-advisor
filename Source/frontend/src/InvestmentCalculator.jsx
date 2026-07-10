import React, { useState, useEffect } from 'react';
import { Calculator, Save, TrendingUp, DollarSign, Percent, BarChart2, CheckCircle2, Search, AlertCircle, ChevronDown, ChevronUp, Home, Banknote, ShieldCheck, Target } from 'lucide-react';

const CurrencyInput = ({ value, onChange, label, disabled = false, placeholder = "0", rightElement = null }) => {
  const step = value >= 10000000 ? 500000 : value >= 1000000 ? 100000 : value >= 100000 ? 10000 : 1000;
  
  const handleInputChange = (e) => {
    let numericStr = e.target.value.replace(/,/g, '');
    if (numericStr === '') numericStr = '0';
    if (!isNaN(numericStr)) {
      onChange(Number(numericStr));
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>{label}</label>
        {rightElement}
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <button disabled={disabled} onClick={() => onChange(Math.max(0, value - step))} style={{ padding: '0.5rem 1rem', backgroundColor: disabled ? '#f8f9fa' : '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '6px 0 0 6px', color: '#475569', cursor: disabled ? 'not-allowed' : 'pointer' }}>-</button>
        <input 
          type="text" 
          placeholder={placeholder}
          value={value === 0 ? '' : value.toLocaleString(undefined, {maximumFractionDigits:0})} 
          onChange={handleInputChange} 
          disabled={disabled}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderLeft: 'none', borderRight: 'none', textAlign: 'center', outline: 'none', width: '100%', minWidth: '0', fontSize: '1rem', fontWeight: 600, color: disabled ? '#9aa0a6' : '#0f172a', backgroundColor: disabled ? '#f8f9fa' : '#ffffff' }}
        />
        <button disabled={disabled} onClick={() => onChange(value + step)} style={{ padding: '0.5rem 1rem', backgroundColor: disabled ? '#f8f9fa' : '#f1f5f9', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', color: '#475569', cursor: disabled ? 'not-allowed' : 'pointer' }}>+</button>
      </div>
    </div>
  );
};

const CustomSlider = ({ label, value, min, max, onChange, step, format = 'currency', color = '#1a73e8' }) => {
  return (
    <div style={{ marginBottom: '1.25rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{label}</label>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: color }}>
          {format === 'currency' ? `฿${value.toLocaleString()}` : `${value}%`}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))} 
        style={{ width: '100%', accentColor: color, height: '6px', cursor: 'pointer' }} 
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
        <span>{format === 'currency' ? `฿${min.toLocaleString()}` : `${min}%`}</span>
        <span>{format === 'currency' ? `฿${max.toLocaleString()}` : `${max}%`}</span>
      </div>
    </div>
  );
};

const Accordion = ({ title, icon, summary, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', border: 'none', borderBottom: isOpen ? '1px solid #e2e8f0' : 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
            {icon} {title}
          </div>
          {summary && !isOpen && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', paddingLeft: '26px' }}>{summary}</div>
          )}
        </div>
        {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
      </button>
      {isOpen && (
        <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const InvestmentCalculator = ({ asset, onSave }) => {
  const initialData = asset.investment_data ? JSON.parse(asset.investment_data) : {};
  
  const appraisalStr = String(asset['ราคาประเมินของเจ้าพนักงานบังคับคดี'] || asset['ราคาประเมินของเจ้าพนักงานประเมินราคาทรัพย์'] || '0').replace(/,/g, '');
  const appraisal = !isNaN(Number(appraisalStr)) ? Number(appraisalStr) : 0;

  const sellCondition = String(asset['จะทำการขายโดย'] || '');
  let noBidCount = 0;
  for (let i = 1; i <= 8; i++) {
      const st = asset[`สถานะนัดที่ ${i}`];
      if (st === 3 || st === '3' || (st && String(st).includes('ไม่มีผู้สู้ราคา'))) noBidCount++;
  }
  let discountPercent = 0;
  if (sellCondition.includes('จำนองติดไป') || sellCondition.includes('จำนำติดไป') || sellCondition.includes('ติดไป')) {
    discountPercent = 0;
  } else {
    if (noBidCount === 1) discountPercent = 10;
    else if (noBidCount === 2) discountPercent = 20;
    else if (noBidCount >= 3) discountPercent = 30;
  }
  const discountedPrice = appraisal * (1 - (discountPercent / 100));
  
  const mortgageStr = String(asset['ยอดหนี้จำนอง'] || '0').replace(/,/g, '');
  const mortgage = !isNaN(Number(mortgageStr)) ? Number(mortgageStr) : 0;

  let defaultTargetPrice = appraisal;
  if (sellCondition.includes('จำนองติดไป') || sellCondition.includes('จำนำติดไป') || sellCondition.includes('ติดไป')) {
    const depositStr = String(asset['วางหลักประกันเป็นจำนวน'] || '0').replace(/,/g, '');
    const depositAmount = !isNaN(Number(depositStr)) ? Number(depositStr) : 0;
    if (appraisal < mortgage) {
      defaultTargetPrice = depositAmount;
    } else {
      defaultTargetPrice = Math.max(0, appraisal - mortgage);
    }
  }

  const minTargetPrice = defaultTargetPrice;

  // State
  const [marketPrice, setMarketPrice] = useState(initialData.marketPrice || initialData.resalePrice || Math.max(appraisal * 1.3, discountedPrice * 1.5));
  const [targetPrice, setTargetPrice] = useState(initialData.targetPrice !== undefined ? initialData.targetPrice : defaultTargetPrice);
  const [walkawayPrice, setWalkawayPrice] = useState(initialData.walkawayPrice || defaultTargetPrice * 1.1);
  
  // Expenses
  const [renovationCost, setRenovationCost] = useState(initialData.renovationCost || 0);
  const [evictionCost, setEvictionCost] = useState(initialData.evictionCost || 0);
  
  // Taxes & Fees
  const [transferFeePercent, setTransferFeePercent] = useState(initialData.transferFeePercent !== undefined ? initialData.transferFeePercent : 2.0);
  const [hasSpecificBusinessTax, setHasSpecificBusinessTax] = useState(initialData.hasSpecificBusinessTax !== undefined ? initialData.hasSpecificBusinessTax : true);
  const [incomeTaxPercent, setIncomeTaxPercent] = useState(initialData.incomeTaxPercent !== undefined ? initialData.incomeTaxPercent : 1.0);
  
  // Financing
  const [useLoan, setUseLoan] = useState(initialData.useLoan || false);
  const [ltv, setLtv] = useState(initialData.ltv || 80);
  const [interestRate, setInterestRate] = useState(initialData.interestRate || 4.5);
  const [holdingMonths, setHoldingMonths] = useState(initialData.holdingMonths || 6);
  const [loanTermYears, setLoanTermYears] = useState(initialData.loanTermYears || 30); // New field

  // Rental
  const [monthlyRent, setMonthlyRent] = useState(initialData.monthlyRent || 0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving'

  // Slider common max based on all values to keep them aligned visually
  const maxPriceValue = Math.max(appraisal * 2.5, marketPrice * 1.2, targetPrice * 1.5, walkawayPrice * 1.5);
  // Round to nearest 100,000
  const sliderMax = Math.ceil(maxPriceValue / 100000) * 100000;

  // Enforce Constraints for target and walkaway
  useEffect(() => {
    let newTarget = targetPrice;
    let newWalkaway = walkawayPrice;
    let changed = false;

    if (newTarget < minTargetPrice) {
      newTarget = minTargetPrice;
      changed = true;
    }
    if (newWalkaway < newTarget) {
      newWalkaway = newTarget;
      changed = true;
    }

    if (changed) {
      setTargetPrice(newTarget);
      setWalkawayPrice(newWalkaway);
    }
  }, [minTargetPrice, targetPrice, walkawayPrice]);

  // Debounced Auto-save
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
        handleSave(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [marketPrice, targetPrice, walkawayPrice, renovationCost, evictionCost, transferFeePercent, hasSpecificBusinessTax, incomeTaxPercent, useLoan, ltv, interestRate, holdingMonths, loanTermYears, monthlyRent]);

  // Derived Calculations
  // 1. Buying Costs
  const calculatedTransferFee = (appraisal * (transferFeePercent / 100)); // Transfer fee is based on appraisal
  
  // Cost based on Target Price
  const purchaseCostTarget = targetPrice + mortgage;
  const totalCapitalNeededTarget = useLoan ? (purchaseCostTarget * (1 - ltv/100)) + renovationCost + evictionCost + calculatedTransferFee : purchaseCostTarget + renovationCost + evictionCost + calculatedTransferFee;
  const totalCostTarget = purchaseCostTarget + renovationCost + evictionCost + calculatedTransferFee;
  
  // Cost based on Walkaway Price
  const purchaseCostWalkaway = walkawayPrice + mortgage;
  const totalCapitalNeededWalkaway = useLoan ? (purchaseCostWalkaway * (1 - ltv/100)) + renovationCost + evictionCost + calculatedTransferFee : purchaseCostWalkaway + renovationCost + evictionCost + calculatedTransferFee;
  const totalCostWalkaway = purchaseCostWalkaway + renovationCost + evictionCost + calculatedTransferFee;

  // 2. Selling Fees
  const taxSBTorDuty = hasSpecificBusinessTax ? (marketPrice * 0.033) : (marketPrice * 0.005);
  const incomeTax = marketPrice * (incomeTaxPercent / 100);
  const totalSellingFees = taxSBTorDuty + incomeTax;

  // 3. Financing Costs (Holding interest & Mortgage Payment)
  const loanAmountTarget = useLoan ? purchaseCostTarget * (ltv / 100) : 0;
  const holdingInterestTarget = loanAmountTarget * (interestRate / 100) * (holdingMonths / 12);
  
  const loanAmountWalkaway = useLoan ? purchaseCostWalkaway * (ltv / 100) : 0;
  const holdingInterestWalkaway = loanAmountWalkaway * (interestRate / 100) * (holdingMonths / 12);

  // Mortgage Payment Formula (Monthly)
  const calculateMonthlyPayment = (principal, annualRate, years) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    const numberOfPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };
  
  const monthlyMortgageTarget = calculateMonthlyPayment(loanAmountTarget, interestRate, loanTermYears);

  // 4. Net Profit
  const netProfitTarget = marketPrice - totalCostTarget - totalSellingFees - holdingInterestTarget;
  const netProfitWalkaway = marketPrice - totalCostWalkaway - totalSellingFees - holdingInterestWalkaway;

  // 5. ROI & Profit Margin
  const roiTarget = totalCapitalNeededTarget > 0 ? (netProfitTarget / totalCapitalNeededTarget) * 100 : 0;
  const roiWalkaway = totalCapitalNeededWalkaway > 0 ? (netProfitWalkaway / totalCapitalNeededWalkaway) * 100 : 0;
  
  const profitMarginTarget = marketPrice > 0 ? (netProfitTarget / marketPrice) * 100 : 0;
  const profitMarginWalkaway = marketPrice > 0 ? (netProfitWalkaway / marketPrice) * 100 : 0;

  // 6. Rental Yield & Cash Flow
  const grossRentalYieldTarget = totalCostTarget > 0 ? ((monthlyRent * 12) / totalCostTarget) * 100 : 0;
  const cashFlowTarget = monthlyRent - (useLoan ? monthlyMortgageTarget : 0);

  const handleSave = async (auto = false) => {
    if (!auto) setIsSaving(true);
    const data = {
      marketPrice,
      targetPrice,
      walkawayPrice,
      renovationCost,
      evictionCost,
      transferFeePercent,
      hasSpecificBusinessTax,
      incomeTaxPercent,
      useLoan,
      ltv,
      interestRate,
      holdingMonths,
      loanTermYears,
      monthlyRent,
      
      // Backward compatibility fields
      resalePrice: marketPrice,
      netProfit: netProfitTarget,
      roi: roiTarget.toFixed(2),
      cutLossPrice: walkawayPrice,
      profit: netProfitTarget,
      profitMargin: roiTarget.toFixed(2),
      
      // Walkaway specifics
      netProfitWalkaway,
      roiWalkaway: roiWalkaway.toFixed(2),
      
      timestamp: new Date().toISOString()
    };
    
    if (onSave) {
      await onSave(data, auto);
    }
    setSaveStatus('saved');
    if (!auto) {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  
  const getFallbackLocation = () => {
    const parts = [];
    const isBkk = asset['จังหวัด'] === 'กรุงเทพมหานคร';
    const subPrefix = isBkk ? 'แขวง' : 'ต.';
    const distPrefix = isBkk ? 'เขต' : 'อ.';
    
    const subdistrict = asset['แขวง/ตำบล'] ? `${subPrefix}${String(asset['แขวง/ตำบล']).replace(/^(ตำบล|แขวง)\s*/, '')}` : '';
    const district = asset['เขต/อำเภอ'] ? `${distPrefix}${String(asset['เขต/อำเภอ']).replace(/^(อำเภอ|เขต)\s*/, '')}` : '';

    if (asset.latitude && asset.longitude) {
      if (asset['ประเภททรัพย์']) parts.push(String(asset['ประเภททรัพย์']));
      if (asset['ซอย']) parts.push(`ซ.${String(asset['ซอย']).replace(/^ซอย\s*/, '')}`);
      if (asset['ถนน']) parts.push(`ถ.${String(asset['ถนน']).replace(/^ถนน\s*/, '')}`);
      if (subdistrict) parts.push(subdistrict);
      if (district) parts.push(district);
    } else {
      if (subdistrict) parts.push(subdistrict);
      if (district) parts.push(district);
    }
    return parts.join(' ');
  };
  const displayProjectName = asset['ชื่อโครงการ (ซอย/หมู่บ้าน)'] || asset.project_name || getFallbackLocation();

  const assetSizeText = asset['ประเภททรัพย์']?.includes('ห้องชุด') 
    ? `${asset['เนื้อที่ (ตร.วา/ตร.ม.)'] || ''} ตร.ม.`
    : `${asset['เนื้อที่ (ไร่)'] || 0} ไร่ ${asset['เนื้อที่ (งาน)'] || 0} งาน ${asset['เนื้อที่ (ตร.วา/ตร.ม.)'] || 0} ตร.ว.`;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={20} style={{ color: '#0369a1' }} />
          คำนวณกำไร/ขาดทุนแบบนักลงทุน (Advanced)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: saveStatus === 'saved' ? '#10b981' : '#f59e0b', fontWeight: 500 }}>
          {saveStatus === 'saved' ? <CheckCircle2 size={16} /> : <TrendingUp size={16} />}
          {saveStatus === 'saved' ? 'บันทึกแล้ว' : 'กำลังคำนวณ...'}
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {mortgage > 0 && (
          <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '0.85rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} /> <span>ทรัพย์นี้มีภาระจำนอง <b>฿{mortgage.toLocaleString()}</b> (ระบบนำมารวมในต้นทุนแล้ว)</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Main Summary Board */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Target Card */}
            <div style={{ 
              backgroundColor: netProfitTarget > 0 ? '#ecfdf5' : '#fef2f2', 
              padding: '1.5rem', borderRadius: '12px', 
              border: `1px solid ${netProfitTarget > 0 ? '#a7f3d0' : '#fecaca'}`, 
              display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: '-10px', left: '16px', backgroundColor: netProfitTarget > 0 ? '#10b981' : '#ef4444', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>กรณีได้ราคาเป้าหมาย</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>กำไรสุทธิ</span>
                <div style={{ textAlign: 'right' }}>
                  {roiTarget !== 0 && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: netProfitTarget > 0 ? '#059669' : '#dc2626', backgroundColor: netProfitTarget > 0 ? '#d1fae5' : '#fee2e2', padding: '2px 8px', borderRadius: '8px', marginBottom: '4px', display: 'inline-block' }}>
                      {roiTarget > 0 ? '+' : ''}{roiTarget.toFixed(1)}% ROI
                    </div>
                  )}
                  {profitMarginTarget !== 0 && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: netProfitTarget > 0 ? '#047857' : '#b91c1c' }}>
                      Margin {profitMarginTarget.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: netProfitTarget > 0 ? '#059669' : '#dc2626', lineHeight: 1 }}>
                ฿{Math.abs(netProfitTarget).toLocaleString(undefined, {maximumFractionDigits:0})}
              </span>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>ทุนที่ต้องเตรียม: ฿{totalCapitalNeededTarget.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <span>ต้นทุนรวม: ฿{totalCostTarget.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
            </div>

            {/* Walkaway Card */}
            <div style={{ 
              backgroundColor: netProfitWalkaway > 0 ? '#eff6ff' : '#fef2f2', 
              padding: '1.5rem', borderRadius: '12px', 
              border: `1px solid ${netProfitWalkaway > 0 ? '#bfdbfe' : '#fecaca'}`, 
              display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: '-10px', left: '16px', backgroundColor: netProfitWalkaway > 0 ? '#3b82f6' : '#ef4444', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>กรณีได้ราคาสู้สุด (Walkaway)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>กำไรสุทธิขั้นต่ำ</span>
                <div style={{ textAlign: 'right' }}>
                  {roiWalkaway !== 0 && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: netProfitWalkaway > 0 ? '#1d4ed8' : '#dc2626', backgroundColor: netProfitWalkaway > 0 ? '#dbeafe' : '#fee2e2', padding: '2px 8px', borderRadius: '8px', marginBottom: '4px', display: 'inline-block' }}>
                      {roiWalkaway > 0 ? '+' : ''}{roiWalkaway.toFixed(1)}% ROI
                    </div>
                  )}
                  {profitMarginWalkaway !== 0 && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: netProfitWalkaway > 0 ? '#1e40af' : '#b91c1c' }}>
                      Margin {profitMarginWalkaway.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: netProfitWalkaway > 0 ? '#1d4ed8' : '#dc2626', lineHeight: 1 }}>
                ฿{Math.abs(netProfitWalkaway).toLocaleString(undefined, {maximumFractionDigits:0})}
              </span>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>ทุนที่ต้องเตรียม: ฿{totalCapitalNeededWalkaway.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <span>ต้นทุนรวม: ฿{totalCostWalkaway.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />

          {/* Core Price Inputs */}
          <div>
            <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={18}/> ราคาหลัก</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>ราคาที่คาดว่าจะขายได้ (Market Price)</label>
                  {displayProjectName && (
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(displayProjectName + ' ราคาตลาด ' + assetSizeText)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#1a73e8', textDecoration: 'none', fontWeight: 500 }}>
                      <Search size={14} /> ค้นหาราคาตลาด
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <button onClick={() => setMarketPrice(Math.max(0, marketPrice - 100000))} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '6px 0 0 6px', color: '#475569', cursor: 'pointer' }}>-</button>
                  <input 
                    type="text" 
                    value={marketPrice === 0 ? '' : marketPrice.toLocaleString(undefined, {maximumFractionDigits:0})} 
                    onChange={(e) => {
                      let numericStr = e.target.value.replace(/,/g, '');
                      if (numericStr === '') numericStr = '0';
                      if (!isNaN(numericStr)) setMarketPrice(Number(numericStr));
                    }} 
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderLeft: 'none', borderRight: 'none', textAlign: 'center', outline: 'none', width: '100%', minWidth: '0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}
                  />
                  <button onClick={() => setMarketPrice(marketPrice + 100000)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', color: '#475569', cursor: 'pointer' }}>+</button>
                </div>
              </div>
              
              <div>
                <CustomSlider 
                  label="ราคาเป้าหมายประมูล (Target Bid)" 
                  value={targetPrice} 
                  min={minTargetPrice} 
                  max={sliderMax} 
                  step={10000} 
                  onChange={setTargetPrice} 
                  color="#10b981" 
                />
              </div>

              <div>
                <CustomSlider 
                  label="ราคาสู้สูงสุด (Walkaway Price)" 
                  value={walkawayPrice} 
                  min={targetPrice} 
                  max={sliderMax} 
                  step={10000} 
                  onChange={setWalkawayPrice} 
                  color="#3b82f6" 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <Accordion 
              title="ค่าใช้จ่ายเพิ่มเติม (Expenses)" 
              icon={<Banknote size={18} color="#0284c7" />}
              summary={`รวม: ฿${(renovationCost + evictionCost).toLocaleString()}`}
            >
              <CurrencyInput label="ค่าซ่อมแซม (Renovation Cost)" value={renovationCost} onChange={setRenovationCost} />
              <CurrencyInput label="ค่าฟ้องขับไล่ / ค่าจ้างย้ายออก (Eviction/Move-out)" value={evictionCost} onChange={setEvictionCost} />
            </Accordion>

            <Accordion 
              title="ภาษีและค่าธรรมเนียม (Taxes & Fees)" 
              icon={<ShieldCheck size={18} color="#0284c7" />}
              summary={`รวมประมาณ: ฿${(totalSellingFees + calculatedTransferFee).toLocaleString(undefined, {maximumFractionDigits:0})}`}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasSpecificBusinessTax} onChange={(e) => setHasSpecificBusinessTax(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1a73e8' }} />
                  เสียภาษีธุรกิจเฉพาะตอนขาย (3.3%)
                </label>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '24px', marginTop: '4px' }}>
                  {hasSpecificBusinessTax ? 'หากไม่เสีย จะถูกคิดอากรแสตมป์ 0.5% แทน' : 'จะถูกคิดอากรแสตมป์ 0.5% ตอนขาย'}
                </div>
              </div>
              <CustomSlider label="ค่าโอนกรรมสิทธิ์ (% ของราคาประเมิน)" value={transferFeePercent} min={0} max={2} step={0.5} format="percent" onChange={setTransferFeePercent} color="#8b5cf6" />
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>ค่าโอนโดยประมาณ: ฿{calculatedTransferFee.toLocaleString()}</div>
              
              <CustomSlider label="ภาษีเงินได้หัก ณ ที่จ่ายตอนขาย (%)" value={incomeTaxPercent} min={0} max={5} step={0.5} format="percent" onChange={setIncomeTaxPercent} color="#ec4899" />
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ภาษีโดยประมาณ: ฿{incomeTax.toLocaleString()}</div>
            </Accordion>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <Accordion 
              title="สินเชื่อ (Financing)" 
              icon={<DollarSign size={18} color="#0284c7" />}
              summary={useLoan ? `กู้ ${ltv}% | ดอกเบี้ย ${interestRate}% | ผ่อน ฿${monthlyMortgageTarget.toLocaleString(undefined, {maximumFractionDigits:0})}/ด` : 'เงินสด (ไม่ใช้สินเชื่อ)'}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useLoan} onChange={(e) => setUseLoan(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1a73e8' }} />
                  ใช้สินเชื่อ (กู้ธนาคาร)
                </label>
              </div>
              
              <div style={{ opacity: useLoan ? 1 : 0.5, pointerEvents: useLoan ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                <CustomSlider label="สัดส่วนการกู้ LTV (%)" value={ltv} min={0} max={100} step={5} format="percent" onChange={setLtv} color="#f59e0b" />
                <CustomSlider label="ดอกเบี้ย (%)" value={interestRate} min={1} max={10} step={0.1} format="percent" onChange={setInterestRate} color="#ef4444" />
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>สัญญากู้ (ปี)</label>
                    <select 
                      value={loanTermYears} 
                      onChange={(e) => setLoanTermYears(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      {[5, 10, 15, 20, 25, 30, 35, 40].map(y => (
                        <option key={y} value={y}>{y} ปี</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>ถือครองก่อนขาย (เดือน)</label>
                    <select 
                      value={holdingMonths} 
                      onChange={(e) => setHoldingMonths(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      {[3, 6, 9, 12, 18, 24, 36].map(m => (
                        <option key={m} value={m}>{m} เดือน ({m/12} ปี)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ยอดผ่อนต่อเดือน (เป้าหมาย):</span>
                    <b style={{ color: '#0f172a' }}>฿{monthlyMortgageTarget.toLocaleString(undefined, {maximumFractionDigits:0})}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ดอกเบี้ยจ่ายระหว่างถือครอง:</span>
                    <b style={{ color: '#ef4444' }}>฿{holdingInterestTarget.toLocaleString(undefined, {maximumFractionDigits:0})}</b>
                  </div>
                </div>
              </div>
            </Accordion>

            <Accordion 
              title="การปล่อยเช่า (Rental Yield)" 
              icon={<Home size={18} color="#0284c7" />}
              summary={monthlyRent > 0 ? `ค่าเช่า ฿${monthlyRent.toLocaleString()}/ด | Yield ${grossRentalYieldTarget.toFixed(1)}%` : 'ยังไม่ได้ระบุค่าเช่า'}
            >
              <CurrencyInput 
                label="ค่าเช่าคาดหวังต่อเดือน (Monthly Rent)" 
                value={monthlyRent} 
                onChange={setMonthlyRent} 
                rightElement={
                  displayProjectName && (
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(displayProjectName + ' ราคาเช่า ' + assetSizeText)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#1a73e8', textDecoration: 'none', fontWeight: 500 }}>
                      <Search size={14} /> ค้นหาราคาเช่า
                    </a>
                  )
                }
              />
              
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600, marginBottom: '4px' }}>Gross Rental Yield (อิงตามราคาเป้าหมาย)</div>
                <div style={{ fontSize: '1.5rem', color: '#15803d', fontWeight: 700 }}>
                  {grossRentalYieldTarget.toFixed(2)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>รายได้ต่อปี: ฿{(monthlyRent * 12).toLocaleString()}</span>
                </div>
              </div>

              {useLoan && monthlyRent > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${cashFlowTarget >= 0 ? '#a7f3d0' : '#fecaca'}`, backgroundColor: cashFlowTarget >= 0 ? '#ecfdf5' : '#fef2f2' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: cashFlowTarget >= 0 ? '#059669' : '#dc2626' }}>
                    กระแสเงินสดหลังหักผ่อน (Cash Flow)
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: cashFlowTarget >= 0 ? '#059669' : '#dc2626', marginTop: '4px' }}>
                    {cashFlowTarget >= 0 ? '+' : ''}฿{cashFlowTarget.toLocaleString(undefined, {maximumFractionDigits:0})} / เดือน
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    (ค่าเช่า ฿{monthlyRent.toLocaleString()} - ยอดผ่อน ฿{monthlyMortgageTarget.toLocaleString(undefined, {maximumFractionDigits:0})})
                  </div>
                </div>
              )}
            </Accordion>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;
