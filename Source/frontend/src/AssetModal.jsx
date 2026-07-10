import React, { useState, useEffect } from 'react';
import API_BASE from './config';
import { LEDFormGenerator } from './LEDFormGenerator';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Heart, MapPin, X, Bot, Save, ExternalLink, Calendar, Home, Maximize, FileText, Scale, User, DollarSign, AlertCircle, Phone, Landmark, Hash, Building, Map, Train, GraduationCap, ShoppingBag, Stethoscope, Compass, Crosshair, Search, TrendingUp, CalendarPlus, Globe, MonitorSmartphone, Copy, Check, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import InvestmentCalculator from './InvestmentCalculator';


const AUCTION_STATUS_MAP = {
  0: "-",
  1: "ขายได้",
  2: "โจทก์จำเลยค้าน (มีผู้ผูกพันราคา)",
  3: "งดขายไม่มีผู้สู้ราคา",
  4: "งดขายส่งประกาศมิชอบ",
  5: "งดขายค้านราคาต่ำ",
  6: "ถอนการยึด",
  7: "โจทก์แถลงงดขาย",
  8: "เจ้าพนักงานงดขาย",
  9: "งดขายขาดคำสั่งศาล",
  10: "งดขาย",
  11: "จำเลยตาย",
  12: "งดขาย (ป.วิ.แพ่ง มาตรา 309)",
  13: "งดขาย",
  14: "งดขาย",
  15: "งดขาย",
  16: "งดขาย",
  17: "งดขาย*",
  18: "งดขายส่งประกาศมิชอบ",
  19: "งดการบังคับคดี",
  20: "ถอนทรัพย์",
  21: "งดขาย*",
  22: "งดขาย",
  23: "งดขาย",
  24: "งดขาย",
  25: "งดขาย คู่ความงดนัด 1-5",
  26: "งดขายในนัดที่เหลือ",
  27: "งดตามคำสั่งศาล",
  28: "งดขาย"
};

export const API_BASE_URL = API_BASE;

const LIVE_LINKS = {
  "ส่วนกลาง": "https://live.led.go.th/?branch=center",
  "แพ่งกรุงเทพมหานคร 3": "https://live.led.go.th/?branch=bkk3",
  "กำแพงเพชร": "https://live.led.go.th/?branch=kamphaengphet",
  "ชัยภูมิ": "https://live.led.go.th/?branch=chaiyaphum",
  "นครนายก": "https://live.led.go.th/?branch=nakonnayok",
  "นครปฐม": "https://live.led.go.th/?branch=nakhonpathom",
  "นครสวรรค์": "https://live.led.go.th/?branch=nakhonsawan",
  "นนทบุรี": "https://live.led.go.th/?branch=nonthaburi",
  "ปทุมธานี สาขาธัญบุรี": "https://live.led.go.th/?branch=thanyaburi",
  "ปทุมธานี": "https://live.led.go.th/?branch=pathumthani",
  "พระนครศรีอยุธยา": "https://live.led.go.th/?branch=ayutthaya",
  "พิจิตร": "https://live.led.go.th/?branch=phichit",
  "พิษณุโลก": "https://live.led.go.th/?branch=phitsanulok",
  "เพชรบูรณ์": "https://live.led.go.th/?branch=phetchabun",
  "ลพบุรี": "https://live.led.go.th/?branch=lopburi",
  "สมุทรปราการ": "https://live.led.go.th/?branch=samutprakan",
  "สมุทรสาคร": "https://live.led.go.th/?branch=samutsakhon",
  "สระบุรี": "https://live.led.go.th/?branch=saraburi",
  "สุพรรณบุรี": "https://live.led.go.th/?branch=suphanburi",
  "ฉะเชิงเทรา": "https://live.led.go.th/?branch=chachoengsao",
  "ชลบุรี สาขาพัทยา": "https://live.led.go.th/?branch=pattaya",
  "ชลบุรี": "https://live.led.go.th/?branch=chonburi",
  "ปราจีนบุรี": "https://live.led.go.th/?branch=prachinburi",
  "ระยอง": "https://live.led.go.th/?branch=rayong",
  "กาญจนบุรี": "https://live.led.go.th/?branch=kanchanaburi",
  "ประจวบคีรีขันธ์": "https://live.led.go.th/?branch=prachuapkhirikhan",
  "เพชรบุรี": "https://live.led.go.th/?branch=phetchaburi",
  "ราชบุรี": "https://live.led.go.th/?branch=ratchaburi",
  "เชียงราย": "https://live.led.go.th/?branch=chiangrai",
  "เชียงใหม่": "https://live.led.go.th/?branch=chiangmai",
  "แพร่": "https://live.led.go.th/?branch=phrae",
  "ลำปาง": "https://live.led.go.th/?branch=lampang",
  "ลำพูน": "https://live.led.go.th/?branch=lamphun",
  "กาฬสินธุ์": "https://live.led.go.th/?branch=kalasin",
  "ขอนแก่น": "https://live.led.go.th/?branch=khonkaen",
  "นครราชสีมา": "https://live.led.go.th/?branch=nakhonratchasima",
  "บุรีรัมย์": "https://live.led.go.th/?branch=buriram",
  "มหาสารคาม": "https://live.led.go.th/?branch=mahasarakham",
  "ยโสธร": "https://live.led.go.th/?branch=yasothon",
  "ร้อยเอ็ด": "https://live.led.go.th/?branch=roiet",
  "เลย": "https://live.led.go.th/?branch=loei",
  "ศรีสะเกษ": "https://live.led.go.th/?branch=sisaket",
  "สุรินทร์": "https://live.led.go.th/?branch=surin",
  "อุดรธานี": "https://live.led.go.th/?branch=udonthani",
  "อุบลราชธานี": "https://live.led.go.th/?branch=ubonratchathani",
  "กระบี่": "https://live.led.go.th/?branch=krabi",
  "ตรัง": "https://live.led.go.th/?branch=trang",
  "นครศรีธรรมราช": "https://live.led.go.th/?branch=nakhonsithammarat",
  "พัทลุง": "https://live.led.go.th/?branch=phattalung",
  "ภูเก็ต": "https://live.led.go.th/?branch=phuket",
  "สงขลา": "https://live.led.go.th/?branch=songkhla",
  "สุราษฏร์ธานี": "https://live.led.go.th/?branch=suratthani",
  "สุราษฎร์ธานี": "https://live.led.go.th/?branch=suratthani"
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!text || text === '-') return null;
  return (
    <button 
      onClick={handleCopy} 
      title="คัดลอก"
      style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: copied ? '#10b981' : '#9aa0a6', marginLeft: '6px', transition: 'color 0.2s' }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};

export const AssetModal = ({ asset: initialAsset, onClose, onFavoriteToggle, onPortfolioToggle, onNotesChange, onInvestmentSave }) => {
  const [asset, setAsset] = useState(initialAsset);
  useEffect(() => { setAsset(initialAsset); }, [initialAsset]);

  const handleInvestmentSave = async (data, auto) => {
    if (onInvestmentSave) {
      const existingInvData = asset.investment_data ? JSON.parse(asset.investment_data) : {};
      const tracking = existingInvData.tracking || {};
      const newData = { ...data, tracking };
      const invStr = JSON.stringify(newData);
      await onInvestmentSave(asset, invStr);
      setAsset(prev => ({ ...prev, investment_data: invStr }));
    }
  };

  const [notes, setNotes] = useState(asset.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ledUrl = asset['URL กรมบังคับคดี (LED)'] || 
    (asset['รหัสล๊อต/ชุด (fbidnum)'] && asset['รหัสศาล (law_court_id)'] 
      ? `https://asset.led.go.th/newbid-center/asset_search_dt.asp?sys_fbidnum=${encodeURIComponent(asset['รหัสล๊อต/ชุด (fbidnum)'])}&sys_law_court_id=${encodeURIComponent(asset['รหัสศาล (law_court_id)'])}` 
      : 'https://asset.led.go.th/newbid/asset_search_map.asp');

  // For auction history link (to match the main button)
  let suitNo = asset['คดีหมายเลขแดงที่'] || '';
  let suitYear = '';
  if (suitNo.includes('/')) {
      const parts = suitNo.split('/');
      suitNo = parts[0];
      suitYear = parts[1];
  } else {
      suitYear = asset['ปีคดี'] || '';
  }
  
  const getLiveUrl = (assetData) => {
    const branchName = assetData['ติดต่อ สำนักงานบังคับคดี/กอง']?.trim().replace(/\s+/g, ' ');
    if (!branchName) return null;
    if (branchName.includes('แพ่งกรุงเทพมหานคร 3')) return LIVE_LINKS['แพ่งกรุงเทพมหานคร 3'];
    if (branchName.includes('แพ่งกรุงเทพมหานคร') || branchName.includes('ส่วนกลาง') || branchName.includes('ล้มละลาย')) return LIVE_LINKS['ส่วนกลาง'];
    for (const [key, url] of Object.entries(LIVE_LINKS)) {
      if (key === branchName || branchName.includes(key)) return url;
    }
    return null;
  };
  const liveUrl = getLiveUrl(asset);
  
  const encodeToTIS620 = (str) => {
    if (!str) return '';
    let encodedStr = '';
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (charCode <= 127) {
            encodedStr += str.charAt(i); 
        } else if (charCode >= 3585 && charCode <= 3675) {
            const tis620Code = charCode - 3424;
            encodedStr += '%' + tis620Code.toString(16).toUpperCase();
        } else {
            encodedStr += encodeURIComponent(str.charAt(i));
        }
    }
    return encodedStr;
  };
  const historyUrl = `https://asset.led.go.th/report_new/reports.asp?ALAW_SUIT_NO=${encodeToTIS620(suitNo)}&ALAW_SUIT_YEAR=${suitYear}&Action= ค้นหา `;

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [otherAssets, setOtherAssets] = useState([]);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Longdo Map Search States
  const [nearbyProjects, setNearbyProjects] = useState([]);
  const [isSearchingProjects, setIsSearchingProjects] = useState(false);
  const [projectSearchError, setProjectSearchError] = useState(null);

  const fetchNearbyProjects = async () => {
    if (!asset.latitude || !asset.longitude) return;
    
    // Access Vite env var
    const apiKey = import.meta.env.VITE_LONGDO_MAP_API_KEY;
    if (!apiKey) {
      setProjectSearchError('ไม่ได้ตั้งค่า VITE_LONGDO_MAP_API_KEY ในไฟล์ .env');
      return;
    }

    setIsSearchingProjects(true);
    setProjectSearchError(null);
    try {
      const url = `https://api.longdo.com/POIService/json/search?lon=${asset.longitude}&lat=${asset.latitude}&tag=village,condo,apartment,hotel&span=1km&limit=10&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.data) {
        setNearbyProjects(data.data);
      } else {
        setNearbyProjects([]);
        setProjectSearchError('ไม่พบข้อมูลโครงการใกล้เคียง');
      }
    } catch (err) {
      setProjectSearchError('เกิดข้อผิดพลาดในการดึงข้อมูลจาก Longdo Map');
    } finally {
      setIsSearchingProjects(false);
    }
  };

  useEffect(() => {
    if (asset?.LED_ID) {
      // Fetch Location Intelligence
      setIsLoadingLocation(true);
      fetch(`${API_BASE}/api/location-intelligence?led_id=${encodeURIComponent(asset.LED_ID)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setLocationInfo(data);
          setIsLoadingLocation(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingLocation(false);
        });
        
    }
  }, [asset?.LED_ID]);

  useEffect(() => {
    if (asset?.project_name) {
      fetch(`${API_BASE}/api/assets?projectName=${encodeURIComponent(asset.project_name)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.assets) {
            setOtherAssets(data.assets.filter(a => a.LED_ID !== asset.LED_ID));
          }
        })
        .catch(err => console.error(err));
    } else {
      setOtherAssets([]);
    }
  }, [asset?.project_name, asset?.LED_ID]);

  useEffect(() => {
    setNotes(asset.notes || '');
    setAiAnalysis(null);
  }, [asset?.LED_ID]);

  // Auto-save notes
  useEffect(() => {
    if (notes === (asset.notes || '')) return;
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await fetch('http://localhost:3001/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: asset.id,
            notes: notes
          })
        });
        if (res.ok) {
          if (onNotesChange) onNotesChange(asset, notes);
        }
      } catch (err) {
        console.error('Error auto-saving notes:', err);
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, asset.LED_ID, asset.notes, onNotesChange]);

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:3001/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetData: asset })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Error analyzing:', err);
      setAiAnalysis('เกิดข้อผิดพลาดในการวิเคราะห์');
    }
    setIsAnalyzing(false);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('Z:/') || cleanPath.startsWith('z:/')) {
      cleanPath = cleanPath.substring(3);
    }
    const encodedPath = cleanPath.split('/').map(part => encodeURIComponent(part)).join('/');
    return `https://asset.led.go.th/PPKPicture/${encodedPath}`;
  };

  const imgUrl = getImageUrl(asset['พาธรูประบบ (landpicture)']);

  let statusBadge = "พร้อมประมูล";
  let badgeColor = "var(--primary-color)";
  if (asset['ผลการขาย (ล่าสุด)'] && String(asset['ผลการขาย (ล่าสุด)']).includes('ขายได้')) {
      const soldPrice = asset['ราคาขายได้/เสนอสูงสุด'] || '';
      statusBadge = `ปิดการประมูล (ขายได้ ${soldPrice})`;
      badgeColor = "var(--danger-color)";
  } else if (asset['ผลการขาย (ล่าสุด)']) {
      statusBadge = asset['ผลการขาย (ล่าสุด)']; 
      if (String(statusBadge).includes('งดขาย')) badgeColor = '#f59e0b';
  }

  let noBidCount = 0;
  for (let i = 1; i <= 8; i++) {
      const st = asset[`สถานะนัดที่ ${i}`];
      if (st === 3 || st === '3' || (st && String(st).includes('ไม่มีผู้สู้ราคา'))) noBidCount++;
  }
  let discountPercent = 0;
                  if (String(asset['จะทำการขายโดย']).includes('จำนองติดไป') || String(asset['จะทำการขายโดย']).includes('จำนำติดไป') || String(asset['จะทำการขายโดย']).includes('ติดไป')) {
                    discountPercent = 0;
                  } else {
                    if (noBidCount === 1) discountPercent = 10;
                    else if (noBidCount === 2) discountPercent = 20;
                    else if (noBidCount >= 3) discountPercent = 30;
                  }

  const basePrice = asset.price_numeric || 0;
  const discountedPrice = basePrice * (1 - (discountPercent / 100));

  const parseLEDDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10) - 543;
      return new Date(year, month, day);
    }
    return null;
  };

  const getNextAuction = (asset) => {
    const now = new Date();
    now.setHours(0,0,0,0);
    let nextDate = null;
    let nextDateStr = '';
    let roundNo = 0;
    
    for (let i = 1; i <= 8; i++) {
      const dStr = asset[`วันที่นัดที่ ${i}`];
      const d = parseLEDDate(dStr);
      if (d && d >= now) {
        if (!nextDate || d < nextDate) {
          nextDate = d;
          nextDateStr = dStr;
          roundNo = i;
        }
      }
    }
    
    if (nextDate) {
      const diffTime = Math.abs(nextDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { dateStr: nextDateStr, daysLeft: diffDays, roundNo };
    }
    return null;
  };
  
  const nextAuc = getNextAuction(asset);

  let displayPlaintiff = asset['โจทก์'] || '-';
  if (displayPlaintiff.startsWith('นาย') || displayPlaintiff.startsWith('นาง')) {
    displayPlaintiff = 'บุคคลทั่วไป';
  }

  const isMortgaged = Boolean(asset['ยอดหนี้จำนอง'] && String(asset['ยอดหนี้จำนอง']) !== '0.00' && String(asset['ยอดหนี้จำนอง']) !== '0');
  const isMultiAuction = asset['ประมูลหลายรอบ (Y/N)'] === 'Y';
  const isExtraPledge = Boolean(asset['ติดจำนองพิเศษ (is_extra_pledgb)'] === 'T' || (asset['เงื่อนไขการขาย'] && (asset['เงื่อนไขการขาย'].includes('ภาระผูกพัน') || asset['เงื่อนไขการขาย'].includes('จำนอง'))));
  
  const depositAmt = Number(String(asset['วางหลักประกันเป็นจำนวน'] || '').replace(/,/g, ''));
  const isHighDeposit = Boolean(basePrice > 0 && (depositAmt / basePrice) >= 0.2);
  const isNoTitleDeed = Boolean(asset['ประเภททรัพย์'] && (asset['ประเภททรัพย์'].includes('สำเนา') || asset['ประเภททรัพย์'].includes('ไม่มีโฉนด') || asset['ประเภททรัพย์'].includes('ไม่พบโฉนด')));

  const totalRai = parseFloat(asset['เนื้อที่ (ไร่)']) || 0;
  const totalNgan = parseFloat(asset['เนื้อที่ (งาน)']) || 0;
  const totalWa = parseFloat(asset['เนื้อที่ (ตร.วา/ตร.ม.)']) || 0;
  const isCondo = Boolean(asset['ประเภททรัพย์']?.includes('ห้องชุด'));
  const totalSqWa = isCondo ? 0 : (totalRai * 400) + (totalNgan * 100) + totalWa;
  const treasuryAppraisalUnit = parseFloat(asset['ราคาประเมิน (กรมธนารักษ์)']) || 0;
  const treasuryAppraisalTotal = isCondo ? 0 : (treasuryAppraisalUnit > 0 && totalSqWa > 0 ? treasuryAppraisalUnit * totalSqWa : 0);
  const sellCondition = asset['จะทำการขายโดย'] || '-';

  const assetSizeText = asset['ประเภททรัพย์']?.includes('ห้องชุด') 
    ? `${asset['เนื้อที่ (ตร.วา/ตร.ม.)'] || ''} ตร.ม.`
    : [
        asset['เนื้อที่ (ไร่)'] ? `${asset['เนื้อที่ (ไร่)']} ไร่` : '',
        asset['เนื้อที่ (งาน)'] ? `${asset['เนื้อที่ (งาน)']} งาน` : '',
      ].filter(Boolean).join(' ');

  
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

  const images = [];
  if (asset['พาธรูประบบ (landpicture)']) images.push(getImageUrl(asset['พาธรูประบบ (landpicture)']));
  if (asset['พาธแผนที่1 (map)']) images.push(getImageUrl(asset['พาธแผนที่1 (map)']));
  if (asset['พาธแผนที่2 (mapjot)']) images.push(getImageUrl(asset['พาธแผนที่2 (mapjot)']));

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px', width: '95%', padding: '2rem' }}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 500, color: '#202124', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Home size={28} style={{ color: 'var(--primary-color)' }} /> {asset['ประเภททรัพย์']}
            </h3>
            {displayProjectName && (
              <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={20} /> โครงการ: {displayProjectName}
                </h4>
                
              </div>
            )}
            <p style={{ color: '#5f6368', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
              รหัสทรัพย์: <span style={{ fontWeight: 600, marginLeft: '4px' }}>{asset.LED_ID}</span> 
              <span style={{ margin: '0 8px' }}>|</span> 
              คดีแดงที่: <span style={{ fontWeight: 600, marginLeft: '6px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fca5a5' }}>{asset['คดีหมายเลขแดงที่']}</span>
              <CopyButton text={asset['คดีหมายเลขแดงที่']} />
            </p>
          </div>
        </div>
        {/* Quick Actions Bar */}
        <div className="quick-actions-google" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem', width: '100%', alignItems: 'center' }}>
          <LEDFormGenerator
              asset={asset}
              type="asset_details"
              className="btn-google-chip"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '24px', color: '#3c4043', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}
            >
              <Home size={20} style={{ color: '#1a73e8' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>ประกาศ LED</span>
            </LEDFormGenerator>
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="btn-google-chip" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '24px', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}>
                <MonitorSmartphone size={20} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>ดูประมูล Live</span>
              </a>
            )}
          <LEDFormGenerator
              asset={asset}
              type="auction_history"
              className="btn-google-chip"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '24px', color: '#3c4043', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}
            >
              <Calendar size={20} style={{ color: '#ea4335' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>ประวัติประมูล</span>
            </LEDFormGenerator>

          {asset['Google Map Link'] && (
            <a href={asset['Google Map Link']} target="_blank" rel="noreferrer" className="btn-google-chip" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '24px', color: '#3c4043', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}>
              <MapPin size={20} style={{ color: '#34a853' }}/>
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>G-Maps</span>
            </a>
          )}

          {asset['LandsMaps URL'] && (
            <a href={asset['LandsMaps URL']} target="_blank" rel="noreferrer" className="btn-google-chip" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '24px', color: '#3c4043', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}>
              <Map size={20} style={{ color: '#fbbc04' }}/>
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>กรมที่ดิน</span>
            </a>
          )}

          {displayProjectName && (
            <>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(displayProjectName + ' ประวัติ รีวิว')}`} target="_blank" rel="noreferrer" className="btn-google-chip" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '24px', color: '#3c4043', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}>
                <Search size={18} style={{ color: '#5f6368' }}/>
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>หารีวิว</span>
              </a>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(displayProjectName + ' ราคาตลาด ' + assetSizeText)}`} target="_blank" rel="noreferrer" className="btn-google-chip" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '24px', color: '#3c4043', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}>
                <TrendingUp size={18} style={{ color: '#5f6368' }}/>
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>ราคาตลาด</span>
              </a>
            </>
          )}
        </div>
        {images.length > 0 && (
          <div style={{ position: 'relative', width: '100%', height: '450px', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#0f172a' }}>
            <img 
              src={images[currentImageIndex]} 
              alt={`Asset Image ${currentImageIndex + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available'; }} 
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                  <ChevronLeft size={24} color="#334155" />
                </button>
                <button 
                  onClick={nextImage}
                  style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                  <ChevronRight size={24} color="#334155" />
                </button>
                <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                  {images.map((_, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: idx === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.4)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Image Label Indicator */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
              {currentImageIndex === 0 && asset['พาธรูประบบ (landpicture)'] ? 'รูปทรัพย์หลัก' : 
               currentImageIndex === (images.length - 1) && asset['พาธแผนที่2 (mapjot)'] ? 'แผนที่ 2 (จด)' : 
               'แผนที่ 1 (ภาพ)'}
            </div>
          </div>
        )}

        {/* Risk Alerts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
          {isMortgaged && (
             <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fecaca' }}><AlertCircle size={20}/> ติดจำนอง ฿{!isNaN(Number(String(asset['ยอดหนี้จำนอง']).replace(/,/g, ''))) ? Number(String(asset['ยอดหนี้จำนอง']).replace(/,/g, '')).toLocaleString() : asset['ยอดหนี้จำนอง']}</div>
          )}
          {isMultiAuction && (
             <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fff7ed', color: '#f97316', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #ffedd5' }}><AlertCircle size={20}/> เข้าประมูลหลายรอบ ({asset['จำนวนรอบประมูล'] || '?'} รอบ) <a href={historyUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', marginLeft: '0.25rem' }}>ดูประวัติ</a></div>
          )}
          {isExtraPledge && (
             <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fecaca' }}><AlertCircle size={20}/> ติดจำนองพิเศษ / ภาระผูกพัน</div>
          )}
          {isHighDeposit && (
             <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fffbeb', color: '#d97706', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fef3c7' }}><AlertCircle size={20}/> วางหลักประกันสูงกว่าเกณฑ์ (20%+)</div>
          )}
          {isNoTitleDeed && (
             <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fecaca' }}><AlertCircle size={20}/> ขายตามสำเนาโฉนด / ไม่มีโฉนด</div>
          )}
        </div>

        <div className="grid-cols-2" style={{ gap: '2rem' }}>
          {/* Left Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#5f6368' }}>ราคาประเมิน (กรมบังคับคดี):</p>
                  <p style={{ 
                    fontSize: discountPercent > 0 ? '1.1rem' : '1.5rem', 
                    color: discountPercent > 0 ? '#94a3b8' : '#1d4ed8', 
                    textDecoration: discountPercent > 0 ? 'line-through' : 'none', 
                    margin: 0, 
                    fontWeight: 700, 
                    backgroundColor: discountPercent > 0 ? 'transparent' : '#dbeafe', 
                    padding: discountPercent > 0 ? '0' : '4px 12px', 
                    borderRadius: '6px',
                    border: discountPercent > 0 ? 'none' : '1px solid #bfdbfe'
                  }}>
                    ฿{Number(asset.price_numeric || 0).toLocaleString()}
                  </p>
                </div>
                {discountPercent > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#5f6368' }}>ราคาเริ่มต้น:</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#be123c', margin: 0, backgroundColor: '#ffe4e6', padding: '4px 12px', borderRadius: '6px', border: '1px solid #fecdd3' }}>
                      ฿{discountedPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits:0})}
                    </p>
                  </div>
                )}
              </div>
              {discountPercent > 0 && (
                <div style={{ backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  ลด {discountPercent}%
                </div>
              )}
            </div>

            {nextAuc && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: nextAuc.daysLeft <= 7 ? 'var(--danger-color)' : 'var(--primary-color)', fontWeight: 600, backgroundColor: nextAuc.daysLeft <= 7 ? '#fef2f2' : '#eff6ff', border: `1px solid ${nextAuc.daysLeft <= 7 ? '#fecaca' : '#bfdbfe'}`, padding: '1.25rem', borderRadius: '12px' }}>
                <Calendar size={28} /> 
                <div style={{ fontSize: '1.1rem' }}>นัดที่ {nextAuc.roundNo}: {nextAuc.dateStr} (อีก {nextAuc.daysLeft} วัน)</div>
              </div>
            )}

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Calendar size={22} style={{ color: 'var(--primary-color)' }} /> วันที่ประมูลทั้งหมด
              </div>
              <div style={{ padding: '0.5rem 1.25rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                  const dateStr = asset[`วันที่นัดที่ ${i}`];
                  const status = asset[`สถานะนัดที่ ${i}`];
                  if (!dateStr && !status) return null;
                  
                  let icsLink = null;
                  let googleCalLink = null;
                  if (dateStr) {
                    const parsedDate = parseLEDDate(dateStr);
                    if (parsedDate) {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      if (parsedDate >= today) {
                        const year = parsedDate.getFullYear();
                        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(parsedDate.getDate()).padStart(2, '0');
                        const yyyymmdd = `${year}${month}${day}`;
                        
                        const nextDay = new Date(parsedDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        const nextYear = nextDay.getFullYear();
                        const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
                        const nextDate = String(nextDay.getDate()).padStart(2, '0');
                        const nextYyyymmdd = `${nextYear}${nextMonth}${nextDate}`;
                        
                        let invData = null;
                        if (asset.investment_data) {
                          try { invData = JSON.parse(asset.investment_data); } catch(e){}
                        }
                        const fmtPrice = (p) => p ? Number(p).toLocaleString() : '-';

                        const title = encodeURIComponent(`บังคับคดี ${asset['ประเภททรัพย์'] || ''} ลำดับ ${asset['ลำดับที่การขาย'] || '-'} คดี ${asset['คดีหมายเลขแดง'] || '-'} จ.${asset['จังหวัด'] || '-'}`.trim());
                        
                        
                        const detailsText = `ประเภททรัพย์: ${asset['ประเภททรัพย์'] || '-'}
คดีหมายเลขแดง: ${asset['คดีหมายเลขแดงที่'] || '-'}
ลำดับที่การขาย: ${asset['ลำดับที่การขาย'] || '-'}
โฉนด: ${asset['เลขที่โฉนด'] || '-'}
เนื้อที่: ${asset['เนื้อที่ (ไร่)'] || '0'} ไร่ ${asset['เนื้อที่ (งาน)'] || '0'} งาน ${asset['เนื้อที่ (ตร.วา/ตร.ม.)'] || '0'} ตร.ว/ตร.ม
ตำบล: ${asset['แขวง/ตำบล'] || '-'} อำเภอ: ${asset['เขต/อำเภอ'] || '-'} จังหวัด: ${asset['จังหวัด'] || '-'}
สถานที่จำหน่าย: ${asset['สถานที่จำหน่าย'] || '-'}
วางหลักประกัน: ฿${Number(String(asset['วางหลักประกันเป็นจำนวน'] || '').replace(/,/g, '') || 0).toLocaleString()}

ราคาประเมิน: ฿${fmtPrice(asset.price_numeric)}

** แผนการลงทุน **
ราคาประมูลเป้าหมาย: ฿${fmtPrice(invData?.targetPrice)}
ราคา Walk Away (จุดยอมทิ้ง): ฿${fmtPrice(invData?.cutLossPrice)}
ราคาคาดการณ์ขาย (Resale): ฿${fmtPrice(invData?.resalePrice)}

** ข้อมูลติดต่อ **
ติดต่อ: ${asset['ติดต่อ สำนักงานบังคับคดี/กอง'] || '-'}
โทรศัพท์: ${asset['โทรศัพท์'] || '-'}
*** คำแนะนำ: กรุณาโทรสอบถามเจ้าพนักงานบังคับคดีล่วงหน้า 1-2 วันก่อนถึงวันประมูล เพื่อตรวจสอบสถานะทรัพย์อีกครั้ง ***

ลิงก์ประกาศ: https://asset.led.go.th/newbidreg/
ดูถ่ายทอดสดประมูล: ${liveUrl || 'ไม่พบลิงก์ถ่ายทอดสดของสาขานี้'}
`;
                        const details = encodeURIComponent(detailsText);
                        const location = encodeURIComponent(asset['สถานที่จำหน่าย'] || '');
                        
                        const rawTitle = `บังคับคดี ${asset['ประเภททรัพย์'] || ''} ลำดับ ${asset['ลำดับที่การขาย'] || '-'} คดี ${asset['คดีหมายเลขแดงที่'] || '-'} จ.${asset['จังหวัด'] || '-'}`.trim();
                        
                        const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LED Advisor//TH
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${rawTitle}
DTSTART;VALUE=DATE:${yyyymmdd}
DTEND;VALUE=DATE:${nextYyyymmdd}
DESCRIPTION:${detailsText.replace(/\n/g, '\\n')}
LOCATION:${asset['สถานที่จำหน่าย'] || ''}
STATUS:CONFIRMED
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:เตือนการประมูล
TRIGGER:-PT16H
END:VALARM
END:VEVENT
END:VCALENDAR`;

                        icsLink = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsData)}`;
                        googleCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(rawTitle)}&dates=${yyyymmdd}/${nextYyyymmdd}&details=${details}&location=${location}`;
                      }
                    }
                  }
                                    let statusBadge = null;
                  if (status !== null && status !== undefined && status !== '') {
                    const statusNum = parseInt(status);
                    const statusText = !isNaN(statusNum) && AUCTION_STATUS_MAP[statusNum] ? AUCTION_STATUS_MAP[statusNum] : status;
                    const displayText = statusText;

                    let bgColor = '#f1f5f9';
                    let textColor = '#64748b';
                    
                    if (statusNum === 1) { 
                      bgColor = '#dcfce7'; textColor = '#10b981';
                    } else if (statusNum === 3) { 
                      bgColor = '#fee2e2'; textColor = '#ef4444';
                    } else if (statusNum === 2 || statusNum >= 4) { 
                      bgColor = '#fef9c3'; textColor = '#eab308';
                    }
                    
                    statusBadge = <span style={{ backgroundColor: bgColor, color: textColor, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{displayText}</span>;
                  } else {
                    statusBadge = <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>ยังไม่กำหนด</span>;
                  }
                  
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < 8 && asset[`วันที่นัดที่ ${i+1}`] ? '1px dashed var(--border-color)' : 'none' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>นัดที่ {i}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ color: '#64748b', marginRight: '0.25rem' }}>{dateStr || '-'}</span>
                        {(googleCalLink || icsLink) && (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <details style={{ cursor: 'pointer' }}>
                              <summary style={{ listStyle: 'none', display: 'flex', alignItems: 'center', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 6px', borderRadius: '4px' }} title="เพิ่มลงปฏิทิน">
                                <CalendarPlus size={16} />
                              </summary>
                              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', zIndex: 50, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', minWidth: '130px' }}>
                                {googleCalLink && (
                                  <a href={googleCalLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 8px', color: '#ea4335', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#fef2f2'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                                    <Globe size={14} /> Google
                                  </a>
                                )}
                                {icsLink && (
                                  <a href={icsLink} download={`auction_${asset.LED_ID || 'asset'}_round${i}.ics`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 8px', color: '#10b981', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#ecfdf5'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                                    <MonitorSmartphone size={14} /> Android/Apple
                                  </a>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                      <span>{statusBadge}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 1rem', backgroundColor: '#ffffff', border: '1px solid #dadce0', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Maximize size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>เนื้อที่</p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#202124', marginTop: '2px' }}>{asset['เนื้อที่ (ไร่)']} ไร่ {asset['เนื้อที่ (งาน)']} งาน {asset['เนื้อที่ (ตร.วา/ตร.ม.)']} ตร.วา</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <FileText size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>โฉนดเลขที่</p>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }}>{asset['เลขที่โฉนด']}</p>
                    <CopyButton text={asset['เลขที่โฉนด']} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FileText size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>ประเภทเอกสารสิทธิ์</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                    <p style={{ 
                        margin: 0, 
                        fontSize: '0.9375rem',
                        fontWeight: 600, 
                        color: (asset['ที่ดิน (ประเภทเอกสาร)'] || '').includes('สำเนา') ? '#b91c1c' : '#a16207',
                        backgroundColor: (asset['ที่ดิน (ประเภทเอกสาร)'] || '').includes('สำเนา') ? '#fee2e2' : '#fef9c3',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${(asset['ที่ดิน (ประเภทเอกสาร)'] || '').includes('สำเนา') ? '#fca5a5' : '#fde047'}`
                    }}>
                      {asset['ที่ดิน (ประเภทเอกสาร)'] || '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <MapPin size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>ที่ตั้ง</p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#202124', marginTop: '2px' }}>ต.{asset['แขวง/ตำบล'] || '-'} อ.{asset['เขต/อำเภอ'] || '-'} จ.{asset['จังหวัด'] || '-'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <User size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>โจทก์</p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#202124', marginTop: '2px' }}>{displayPlaintiff}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Hash size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>ลำดับที่การขาย</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                    <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '6px', border: '1px solid #99f6e4' }}>{asset['ลำดับที่การขาย'] || '-'}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <DollarSign size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>วางหลักประกัน</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                    <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#4338ca', backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #c7d2fe' }}>฿{Number(String(asset['วางหลักประกันเป็นจำนวน'] || '').replace(/,/g, '') || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <Scale size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>จะทำการขายโดย</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                    <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#be123c', backgroundColor: '#ffe4e6', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fecdd3' }}>{sellCondition}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <DollarSign size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>ราคาประเมินกรมธนารักษ์</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                      {treasuryAppraisalUnit > 0 ? (isCondo ? `฿${treasuryAppraisalUnit.toLocaleString()}` : `฿${treasuryAppraisalUnit.toLocaleString()} / ตร.ว.`) : '-'}
                    </p>
                    {!isCondo && treasuryAppraisalTotal > 0 && (
                      <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                        ราคารวม: ฿{treasuryAppraisalTotal.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <Landmark size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>สำนักงานบังคับคดี/กอง</p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#202124', marginTop: '2px' }}>{asset['ติดต่อ สำนักงานบังคับคดี/กอง'] || '-'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <Phone size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>โทรศัพท์ติดต่อ</p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#202124', marginTop: '2px' }}>
                    {asset['โทรศัพท์'] ? (
                      <a href={`tel:${asset['โทรศัพท์'].replace(/[^0-9]/g, '')}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                        {asset['โทรศัพท์']}
                      </a>
                    ) : '-'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <Building size={18} style={{ color: '#5f6368', marginTop: '4px' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#5f6368', letterSpacing: '0.3px', textTransform: 'uppercase' }}>สถานที่จำหน่าย</p>
                  {asset['สถานที่จำหน่าย'] ? (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(asset['สถานที่จำหน่าย'])}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#1a73e8', marginTop: '2px', textDecoration: 'none' }}>
                      {asset['สถานที่จำหน่าย']} <ExternalLink size={14} />
                    </a>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#202124', marginTop: '2px' }}>-</p>
                  )}
                </div>
              </div>
              {(asset['หมายเหตุ'] || asset['หมายเหตุเพิ่มเติม (remark1)']) && (
                <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                  <AlertCircle size={20} style={{ color: 'var(--danger-color)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--danger-color)' }}>หมายเหตุ</p>
                    <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#202124', marginTop: '2px', color: 'var(--danger-color)' }}>
                      {asset['หมายเหตุ']} {asset['หมายเหตุเพิ่มเติม (remark1)']}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {(asset.latitude && asset.longitude) || asset['Google Map Link'] || asset['LandsMaps URL'] ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {asset.latitude && asset.longitude && (
                  <div style={{ height: '250px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <MapContainer center={[asset.latitude, asset.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[asset.latitude, asset.longitude]}>
                        <Popup>{asset['ตำบล (Landsmaps)'] || asset['แขวง/ตำบล'] || 'ตำแหน่งที่ตั้ง'}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
                
                {asset.latitude && asset.longitude && (
                  <div style={{ marginTop: '0.5rem' }}>
                      <button 
                          className="btn btn-outline" 
                          onClick={fetchNearbyProjects}
                          disabled={isSearchingProjects}
                          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.875rem' }}
                      >
                          {isSearchingProjects ? 'กำลังค้นหา...' : <><Search size={16} /> ค้นหาชื่อโครงการใกล้เคียง (Longdo Map)</>}
                      </button>
                      
                      {projectSearchError && (
                          <div style={{ marginTop: '0.5rem', color: 'var(--danger-color)', fontSize: '0.85rem', textAlign: 'center' }}>
                              {projectSearchError}
                          </div>
                      )}
                      
                      {nearbyProjects.length > 0 && (
                          <div style={{ marginTop: '0.75rem' }}>
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#5f6368' }}>โครงการใกล้เคียง (คลิกเพื่อคัดลอก):</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  {nearbyProjects.map((poi, idx) => (
                                      <div 
                                          key={idx} 
                                          onClick={() => navigator.clipboard.writeText(poi.name)}
                                          style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', transition: 'all 0.2s' }}
                                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                          title="คลิกเพื่อคัดลอก"
                                      >
                                          {poi.name}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                )}
                
                
              </div>
            ) : null}

            

            
            {/* Location Intelligence Section */}
            {asset.latitude && asset.longitude && (
              <div style={{ marginTop: '1.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
                  <Compass size={24} color="#3b82f6" />
                  ระบบวิเคราะห์ทำเล (Location Intelligence)
                </h3>
                
                {isLoadingLocation ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    กำลังวิเคราะห์ทำเลและสิ่งอำนวยความสะดวกรอบๆ...
                  </div>
                ) : locationInfo && locationInfo.amenities && Object.keys(locationInfo.amenities).length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {Object.entries(locationInfo.amenities).map(([category, items]) => {
                      let icon;
                      let bgColor, textColor;
                      if (category === 'Transit') { icon = <Train size={18} />; bgColor = '#eff6ff'; textColor = '#1d4ed8'; }
                      else if (category === 'Education') { icon = <GraduationCap size={18} />; bgColor = '#fdf4ff'; textColor = '#a21caf'; }
                      else if (category === 'Healthcare') { icon = <Stethoscope size={18} />; bgColor = '#f0fdf4'; textColor = '#15803d'; }
                      else if (category === 'Shopping') { icon = <ShoppingBag size={18} />; bgColor = '#fff7ed'; textColor = '#c2410c'; }
                      
                      return (
                        <div key={category} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: textColor, backgroundColor: bgColor, padding: '0.25rem 0.5rem', borderRadius: '6px', width: 'fit-content' }}>
                            {icon} {category}
                          </h4>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.9rem', color: '#475569' }}>
                            {items.map(item => (
                              <li key={item.id} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={item.name}>{item.name}</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{(item.distanceKm * 1000).toFixed(0)} ม.</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                    ไม่พบข้อมูลสิ่งอำนวยความสะดวกในรัศมี 3 กม.
                  </div>
                )}
                
                {/* Target Demographics AI */}
                {!isLoadingLocation && locationInfo && locationInfo.amenities && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#eef2ff', borderRadius: '8px', border: '1px dashed #a5b4fc', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Crosshair size={24} color="#6366f1" style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#3730a3' }}>วิเคราะห์ศักยภาพทำเล (AI Analysis)</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#4338ca' }}>
                        {['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม'].includes(asset['จังหวัด']) ? (
                          <>
                            {locationInfo.amenities['Transit'] && locationInfo.amenities['Transit'][0].distanceKm < 1.5 ? '✨ ทำเลทองคนเมือง: เหมาะปล่อยเช่าวัยทำงาน (ใกล้รถไฟฟ้า) ' : ''}
                            {locationInfo.amenities['Education'] && locationInfo.amenities['Education'][0].distanceKm < 2.5 ? '🎓 แหล่งนักศึกษา: โอกาสทำกำไรจากหอพัก/คอนโดปล่อยเช่า ' : ''}
                            {locationInfo.amenities['Shopping'] && locationInfo.amenities['Shopping'][0].distanceKm < 2 ? '🛒 ไลฟ์สไตล์จัดเต็ม: ใกล้ห้างสรรพสินค้า หาของกินสะดวก ' : ''}
                            {!locationInfo.amenities['Transit'] && !locationInfo.amenities['Education'] ? '🚗 เน้นความเป็นส่วนตัว: เหมาะสำหรับคนใช้รถยนต์ส่วนตัวเป็นหลัก ' : ''}
                          </>
                        ) : (
                          <>
                            {locationInfo.amenities['Shopping'] && locationInfo.amenities['Shopping'][0].distanceKm < 5 ? '🛒 ใกล้ศูนย์กลางชุมชน: เดินทางไปห้าง/ซุปเปอร์มาร์เก็ตสะดวก ' : ''}
                            {locationInfo.amenities['Education'] && locationInfo.amenities['Education'][0].distanceKm < 5 ? '🎓 ใกล้สถานศึกษา: เหมาะสำหรับครอบครัวที่มีบุตรหลาน ' : ''}
                            {locationInfo.amenities['Healthcare'] && locationInfo.amenities['Healthcare'][0].distanceKm < 5 ? '🏥 อุ่นใจเรื่องสุขภาพ: ใกล้โรงพยาบาล/คลินิก ' : ''}
                            {!locationInfo.amenities['Shopping'] && !locationInfo.amenities['Education'] && !locationInfo.amenities['Healthcare'] ? '🏡 ทำเลชานเมือง/ธรรมชาติ: เน้นความสงบ เหมาะสำหรับการพักผ่อน ' : ''}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}


            </div>

          {/* Right Column: AI & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button 
                className="btn btn-outline" 
                onClick={(e) => onPortfolioToggle && onPortfolioToggle(asset, e)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: asset.is_portfolio ? 'var(--primary-color)' : 'inherit', borderColor: asset.is_portfolio ? 'var(--primary-color)' : 'var(--border-color)', padding: '0.75rem 1rem' }}
              >
                <Briefcase fill={asset.is_portfolio ? 'currentColor' : 'none'} size={20} />
                {asset.is_portfolio ? 'เพิ่มใน Portfolio แล้ว' : '+ Portfolio'}
              </button>
              <button 
                className="btn btn-outline" 
                onClick={(e) => onFavoriteToggle(asset, e)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: asset.is_favorite ? 'var(--danger-color)' : 'inherit', borderColor: asset.is_favorite ? 'var(--danger-color)' : 'var(--border-color)', padding: '0.75rem 1rem' }}
              >
                <Heart fill={asset.is_favorite ? 'currentColor' : 'none'} size={20} />
                {asset.is_favorite ? 'รายการโปรด' : 'บันทึก'}
              </button>
            </div>
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={22} style={{ color: '#8b5cf6' }} /> AI วิเคราะห์ความน่าสนใจ
              </h3>
              
              <button 
                className="btn" 
                style={{ backgroundColor: '#8b5cf6', color: 'white', width: '100%', marginBottom: '1rem', fontSize: '1rem', padding: '0.75rem', borderRadius: '8px' }}
                onClick={handleAiAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'กำลังประมวลผลข้อมูลเชิงลึก...' : 'วิเคราะห์ทรัพย์นี้ด้วย AI'}
              </button>

              {aiAnalysis && (
                <div className="ai-analysis-box" style={{ marginTop: '1rem', border: 'none', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\\n/g, '<br/>') }} />
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={22} style={{ color: '#0ea5e9' }} /> บันทึกส่วนตัว
              </h3>
              
              <textarea 
                className="input-field" 
                rows="5" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เพิ่มบันทึกเกี่ยวกับทรัพย์นี้ เช่น สภาพแวดล้อม, แผนการปรับปรุง, หรือข้อมูลการติดต่อ..."
                style={{ resize: 'vertical', minHeight: '120px', width: '100%', fontSize: '0.95rem' }}
              ></textarea>
              {isSaving && <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px', textAlign: 'right' }}>บันทึกอัตโนมัติแล้ว...</div>}
            </div>

            <InvestmentCalculator asset={asset} onSave={handleInvestmentSave} />
          </div>
        </div>
      </div>
    </div>
  );
};
