import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Trash2, ArrowUp, ArrowDown, Star, Phone, Layout, Video, Calendar, CalendarPlus, Globe, MonitorSmartphone, AlertTriangle, Users, Scale, Gavel, Edit2, Check, X, Image } from 'lucide-react';
import { AssetModal } from '../AssetModal';

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editingCustomName, setEditingCustomName] = useState('');
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (e, id) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const defaultColumns = [
    { id: 'image', label: 'รูป', visible: true },
    { id: 'asset', label: 'ทรัพย์', visible: true },
    { id: 'auctionDate', label: 'วันประมูล', visible: true },
    { id: 'place', label: 'สถานที่', visible: true },
    { id: 'deposit', label: 'เงินหลักประกัน', visible: true },
    { id: 'startPrice', label: 'เริ่มประมูล', visible: true },
    { id: 'marketPrice', label: 'ราคาตลาด', visible: true },
    { id: 'winningPrice', label: 'เป้าหมาย Winning', visible: true },
    { id: 'walkawayPrice', label: 'สู้สูงสุด Walkaway', visible: true },
    { id: 'status', label: 'สถานะหน้างาน', visible: true },
    { id: 'closedPrice', label: 'ปิดประมูล', visible: true },
    { id: 'sellBy', label: 'จะทำการขายโดย', visible: true },
    { id: 'docType', label: 'ประเภทเอกสาร', visible: true },
    { id: 'plaintiff', label: 'โจทก์', visible: true },
    { id: 'remark', label: 'หมายเหตุ', visible: true },
    { id: 'note', label: 'โน๊ต', visible: true }
  ];

  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('portfolio_columns_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === defaultColumns.length) {
          return parsed;
        }
      } catch(e) {}
    }
    return defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem('portfolio_columns_v2', JSON.stringify(columns));
  }, [columns]);

  const toggleColumn = (id) => {
    setColumns(cols => cols.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('colIndex', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = parseInt(e.dataTransfer.getData('colIndex'), 10);
    if (dragIndex === dropIndex) return;
    setColumns(cols => {
      const newCols = [...cols];
      const draggedCol = newCols[dragIndex];
      newCols.splice(dragIndex, 1);
      newCols.splice(dropIndex, 0, draggedCol);
      return newCols;
    });
  };

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets?portfolioOnly=true`);
      const data = await res.json();
      setAssets(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const togglePortfolio = async (asset, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!window.confirm(`คุณต้องการลบ ${asset['ชื่อโครงการ (ซอย/หมู่บ้าน)'] || getFallbackLocation(asset)} ออกจาก Portfolio ใช่หรือไม่?`)) {
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: asset.id, is_portfolio: 0 })
      });
      if (res.ok) {
        setAssets(prev => prev.filter(a => a.id !== asset.id));
        if (selectedAsset?.id === asset.id) setSelectedAsset(null);
      }
    } catch (err) {
      console.error('Error toggling portfolio:', err);
    }
  };

  const updateTracking = async (asset, e, updates) => {
    if (e) e.stopPropagation();
    try {
      let invData = {};
      try {
        if (asset.investment_data) invData = JSON.parse(asset.investment_data);
      } catch (e) {
        console.error('Error parsing investment_data', e);
      }
      invData.tracking = { ...(invData.tracking || {}), ...updates };
      const invStr = JSON.stringify(invData);

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: asset.id, investment_data: invStr })
      });
      
      if (res.ok) {
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, investment_data: invStr } : a));
      }
    } catch (err) {
      console.error(err);
    }
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

  const getNextAuctionDate = (asset) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nowTime = now.getTime();
    
    for (let i = 1; i <= 8; i++) {
      const status = String(asset[`สถานะนัดที่ ${i}`] || '');
      if (!status || status.trim() === '' || status === 'ว่าง') {
        const dateStr = asset[`วันที่นัดที่ ${i}`];
        if (dateStr) {
          const parsedTime = parseDate(dateStr);
          if (parsedTime >= nowTime) {
            return { date: dateStr, round: i };
          }
        }
      }
    }
    
    for (let i = 1; i <= 8; i++) {
      const status = String(asset[`สถานะนัดที่ ${i}`] || '');
      if (!status || status.trim() === '' || status === 'ว่าง') {
        const dateStr = asset[`วันที่นัดที่ ${i}`];
        if (dateStr) return { date: dateStr, round: i };
      }
    }
    return { date: '-', round: '-' };
  };

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return new Date(9999, 11, 31).getTime();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10) - 543;
      return new Date(y, m, d).getTime();
    }
    return new Date(9999, 11, 31).getTime();
  };

  const calculateDaysLeft = (auctionTime) => {
    if (!auctionTime || auctionTime === new Date(9999, 11, 31).getTime()) return null;
    const now = new Date();
    const auctionDate = new Date(auctionTime);
    auctionDate.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = auctionDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpectedStartingPrice = (asset) => {
    const appraisalStr = String(asset['ราคาประเมินของเจ้าพนักงานบังคับคดี'] || asset['ราคาประเมินของเจ้าพนักงานประเมินราคาทรัพย์'] || '0').replace(/,/g, '');
    const appraisal = !isNaN(Number(appraisalStr)) ? Number(appraisalStr) : 0;
    const sellCondition = String(asset['จะทำการขายโดย'] || '');
    let noBidCount = 0;
    for (let i = 1; i <= 8; i++) {
        const st = asset[`สถานะนัดที่ ${i}`];
        if (st === 3 || st === '3' || (st && String(st).includes('ไม่มีผู้สู้ราคา'))) noBidCount++;
    }
    const finalSellCondition = String(asset['จะทำการขายโดย'] || asset['เงื่อนไขการขาย'] || sellCondition || '-');
    let discountPercent = 0;
    if (finalSellCondition.includes('จำนองติดไป') || finalSellCondition.includes('จำนำติดไป') || finalSellCondition.includes('ติดไป')) {
      discountPercent = 0;
    } else {
      if (noBidCount === 1) discountPercent = 10;
      else if (noBidCount === 2) discountPercent = 20;
      else if (noBidCount >= 3) discountPercent = 30;
    }
    return appraisal * (1 - (discountPercent / 100));
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '-';
    return `฿${Number(price).toLocaleString(undefined, {maximumFractionDigits:0})}`;
  };

  const getFallbackLocation = (asset) => {
    return asset['ประเภททรัพย์'] ? String(asset['ประเภททรัพย์']) : '-';
  };

  const getShortLocation = (loc) => {
    if (!loc) return '-';
    if (loc.includes('อาคารอสีติพรรษ') || loc.includes('บางขุนนนท์')) return 'กรมบังคับคดี (บางขุนนนท์)';
    if (loc.includes('กรุงเทพมหานคร 1')) return 'กทม. 1';
    if (loc.includes('กรุงเทพมหานคร 2')) return 'กทม. 2';
    if (loc.includes('กรุงเทพมหานคร 3')) return 'กทม. 3';
    if (loc.includes('กรุงเทพมหานคร 4')) return 'กทม. 4';
    if (loc.includes('กรุงเทพมหานคร 5')) return 'กทม. 5';
    if (loc.includes('กรุงเทพมหานคร 6')) return 'กทม. 6';
    
    const match = loc.match(/สำนักงานบังคับคดีจังหวัด([^\s]+)/);
    if (match) {
        let name = match[1];
        if (name.includes('สาขา')) {
            name = name.replace('สาขา', ' (สาขา') + ')';
        }
        return `สบก.${name}`;
    }
    
    return loc.length > 30 ? loc.substring(0, 30) + '...' : loc;
  };

  const sortedAssets = useMemo(() => {
    return [...assets].map(asset => {
      const nextAuction = getNextAuctionDate(asset);
      let tracking = {};
      try {
        if (asset.investment_data) tracking = JSON.parse(asset.investment_data).tracking || {};
      } catch (e) {}
      return {
        ...asset,
        _nextAuction: nextAuction,
        _auctionTime: parseDate(nextAuction.date),
        _order: tracking.order || 0
      };
    }).sort((a, b) => {
      if (a._order !== b._order) return b._order - a._order; // Higher order first
      if (a._auctionTime !== b._auctionTime) return a._auctionTime - b._auctionTime;
      
      const seqA = a['ลำดับที่การขาย'] ? String(a['ลำดับที่การขาย']) : '';
      const seqB = b['ลำดับที่การขาย'] ? String(b['ลำดับที่การขาย']) : '';
      
      const numA = parseInt(seqA.split('-')[0]) || Number.MAX_SAFE_INTEGER;
      const numB = parseInt(seqB.split('-')[0]) || Number.MAX_SAFE_INTEGER;
      
      return numA - numB;
    });
  }, [assets]);

  
  const renderHeader = (col) => {
    switch(col.id) {
      case 'image': return <th key="image" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '170px', borderBottom: '1px solid #dadce0' }}>รูป</th>;
      case 'asset': return <th key="asset" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '210px', borderBottom: '1px solid #dadce0' }}>ทรัพย์</th>;
      case 'auctionDate': return <th key="auctionDate" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '110px', borderBottom: '1px solid #dadce0' }}>วันประมูล</th>;
      case 'place': return <th key="place" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '110px', borderBottom: '1px solid #dadce0' }}>สถานที่</th>;
      case 'deposit': return <th key="deposit" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', textAlign: 'right', minWidth: '100px', borderBottom: '1px solid #dadce0' }}>เงินหลักประกัน</th>;
      case 'startPrice': return <th key="startPrice" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', textAlign: 'right', minWidth: '100px', borderBottom: '1px solid #dadce0' }}>เริ่มประมูล</th>;
      case 'marketPrice': return <th key="marketPrice" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', textAlign: 'right', minWidth: '100px', borderBottom: '1px solid #dadce0' }}>ราคาตลาด</th>;
      case 'winningPrice': return <th key="winningPrice" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1a73e8', fontSize: '0.875rem', textAlign: 'right', minWidth: '100px', borderBottom: '1px solid #dadce0' }}>เป้าหมาย<br/><span style={{fontSize:'0.7rem', fontWeight: 500}}>Winning</span></th>;
      case 'walkawayPrice': return <th key="walkawayPrice" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#d93025', fontSize: '0.875rem', textAlign: 'right', minWidth: '100px', borderBottom: '1px solid #dadce0' }}>สู้สูงสุด<br/><span style={{fontSize:'0.7rem', fontWeight: 500}}>Walkaway</span></th>;
      case 'status': return <th key="status" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '180px', borderBottom: '1px solid #dadce0' }}>สถานะหน้างาน</th>;
      case 'closedPrice': return <th key="closedPrice" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '100px', borderBottom: '1px solid #dadce0' }}>ปิดประมูล</th>;
      case 'sellBy': return <th key="sellBy" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '130px', borderBottom: '1px solid #dadce0' }}>จะทำการขายโดย</th>;
      case 'docType': return <th key="docType" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '120px', borderBottom: '1px solid #dadce0' }}>ประเภทเอกสาร</th>;
      case 'plaintiff': return <th key="plaintiff" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '150px', borderBottom: '1px solid #dadce0' }}>โจทก์</th>;
      case 'remark': return <th key="remark" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '150px', borderBottom: '1px solid #dadce0' }}>หมายเหตุ</th>;
      case 'note': return <th key="note" style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '150px', borderBottom: '1px solid #dadce0' }}>โน๊ต</th>;
      default: return null;
    }
  };

  const renderCell = (col, asset, isWin, isStarred, notReady, strikeThrough, invData, tracking, getExpectedStartingPrice, getShortLocation, calculateDaysLeft, finalTarget, finalRoi, finalWalkaway, walkawayRoi) => {
    switch(col.id) {
      case 'image':
        return (
          <td key="image" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top' }}>
            {(() => {
              const sellCondition = String(asset['จะทำการขายโดย'] || asset['เงื่อนไขการขาย'] || '');
              const hasWarning = sellCondition.includes('ติดจำนอง') || sellCondition.includes('สำเนา') || sellCondition.includes('ตามโฉนด');
              
              let warningText = '';
              if (sellCondition.includes('ติดจำนอง') && (sellCondition.includes('สำเนา') || sellCondition.includes('ตามโฉนด'))) {
                warningText = 'ติดจำนอง / ' + (sellCondition.includes('สำเนา') ? 'สำเนา' : 'ตามโฉนด');
              } else if (sellCondition.includes('ติดจำนอง')) {
                warningText = 'ติดจำนอง';
              } else if (sellCondition.includes('สำเนา')) {
                warningText = 'ขายตามสำเนา';
              } else if (sellCondition.includes('ตามโฉนด')) {
                warningText = 'ขายตามโฉนด';
              }

              return (
                <div className="portfolio-image-wrapper" style={{ position: 'relative', width: '140px', height: '140px' }}>
                  {asset['พาธรูประบบ (landpicture)'] ? (
                    <img 
                      src={getImageUrl(asset['พาธรูประบบ (landpicture)'])} 
                      alt="รูปทรัพย์" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#f1f5f9' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/140x140/f1f5f9/94a3b8?text=N/A'; }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                      <Image size={32} color="#94a3b8" />
                    </div>
                  )}
                  {hasWarning && (
                    <div className="image-warning" style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(220, 38, 38, 0.9)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '4px', textAlign: 'center', borderTopLeftRadius: '6px', borderTopRightRadius: '6px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {warningText}
                    </div>
                  )}
                </div>
              );
            })()}
          </td>
        );
      case 'asset':
        return (
          <td key="asset" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top' }}>
            <div style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.25rem', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              {editingAssetId === asset.id ? (
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', width: '100%' }}>
                  <input 
                    type="text" 
                    value={editingCustomName} 
                    onChange={e => setEditingCustomName(e.target.value)}
                    style={{ flex: 1, padding: '0.25rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveCustomName(asset.id, editingCustomName);
                      if (e.key === 'Escape') setEditingAssetId(null);
                    }}
                  />
                  <button onClick={(e) => { e.stopPropagation(); handleSaveCustomName(asset.id, editingCustomName); }} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Save</button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingAssetId(null); }} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '1.05rem', color: isWin ? '#15803d' : 'var(--primary-color)' }}>
                    {tracking.customName || asset.project_name || asset['ชื่อโครงการ (ซอย/หมู่บ้าน)'] || asset['ประเภททรัพย์'] || '-'}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingAssetId(asset.id); setEditingCustomName(tracking.customName || asset.project_name || asset['ชื่อโครงการ (ซอย/หมู่บ้าน)'] || asset['ประเภททรัพย์'] || ''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', marginTop: '2px' }}
                    title="เปลี่ยนชื่อทรัพย์"
                    onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'}
                    onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>ลำดับ: {asset['ลำดับที่การขาย'] || '-'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {(() => {
                const isBkk = asset['จังหวัด'] === 'กรุงเทพมหานคร';
                const subPrefix = isBkk ? 'แขวง' : 'ต.';
                const distPrefix = isBkk ? 'เขต' : 'อ.';
                const subdistrict = asset['แขวง/ตำบล'] ? subPrefix + String(asset['แขวง/ตำบล']).replace(/^(ตำบล|แขวง)s*/, '') : '';
                const district = asset['เขต/อำเภอ'] ? distPrefix + String(asset['เขต/อำเภอ']).replace(/^(อำเภอ|เขต)s*/, '') : '';
                return [subdistrict, district, 'จ.' + asset['จังหวัด']].filter(Boolean).join(' ');
              })()}
            </div>
            {(() => {
              const isCondo = Boolean(asset['ประเภททรัพย์']?.includes('ห้องชุด'));
              const rai = parseFloat(asset['เนื้อที่ (ไร่)']) || 0;
              const ngan = parseFloat(asset['เนื้อที่ (งาน)']) || 0;
              const wa = parseFloat(asset['เนื้อที่ (ตร.วา/ตร.ม.)']) || 0;
              const parts = [];
              if (!isCondo) {
                if (rai > 0) parts.push(rai + ' ไร่');
                if (ngan > 0) parts.push(ngan + ' งาน');
                if (wa > 0) parts.push(wa + ' ตร.ว.');
              } else {
                if (wa > 0) parts.push(wa + ' ตร.ม.');
              }
              if (parts.length === 0) return null;
              return <div style={{ fontSize: '0.85rem', color: '#5f6368', marginTop: '0.25rem', fontWeight: 500 }}>{parts.join(' ')}</div>;
            })()}
          </td>
        );
      case 'auctionDate':
        return (
          <td key="auctionDate" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top' }}>
            {(() => {
              const daysLeft = calculateDaysLeft(asset._auctionTime);
              let daysLeftText = '';
              let color = asset._auctionTime < Date.now() ? '#ef4444' : 'inherit';
              let weight = 500;
              if (daysLeft !== null) {
                if (daysLeft < 0) {
                  daysLeftText = 'ผ่านไปแล้ว';
                  weight = 400;
                  color = '#94a3b8';
                } else if (daysLeft === 0) {
                  daysLeftText = 'วันนี้!';
                  color = '#ef4444';
                  weight = 700;
                } else if (daysLeft <= 3) {
                  daysLeftText = `อีก ${daysLeft} วัน`;
                  color = '#ef4444';
                  weight = 600;
                } else {
                  daysLeftText = `อีก ${daysLeft} วัน`;
                  color = '#10b981';
                }
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset._nextAuction?.date || '-'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>นัดที่ {asset._nextAuction?.round || '-'}</div>
                  {daysLeftText && <div style={{ fontSize: '0.85rem', color, fontWeight: weight, marginTop: '0.25rem' }}>{daysLeftText}</div>}
                  {notReady && <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '4px', display: 'inline-block', width: 'fit-content', marginTop: '2px' }}>งดขาย/รอ/ส่วนได้เสีย</div>}
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '4px' }} onClick={e => e.stopPropagation()}>
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ listStyle: 'none', display: 'flex', alignItems: 'center', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 6px', borderRadius: '4px', width: 'fit-content' }} title="รอบนัดทั้งหมดและปฏิทิน">
                        <CalendarPlus size={16} />
                        <span style={{ fontSize: '0.8rem', marginLeft: '4px', fontWeight: 500 }}>เพิ่มปฏิทิน</span>
                      </summary>
                      <div style={{ position: 'absolute', zIndex: 50, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', minWidth: '150px', left: 0, top: '100%', marginTop: '4px' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => {
                          const d = asset[`วันที่นัดที่ ${i}`];
                          if (!d) return null;
                          let googleCalLink = null;
                          const parsedTimestamp = parseDate(d);
                          if (parsedTimestamp && parsedTimestamp !== new Date(9999, 11, 31).getTime()) {
                            const parsedDate = new Date(parsedTimestamp);
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
                              const rawTitle = `บังคับคดี ${asset['ประเภททรัพย์'] || ''} ลำดับ ${asset['ลำดับที่การขาย'] || '-'} คดี ${asset['คดีหมายเลขแดงที่'] || '-'} จ.${asset['จังหวัด'] || '-'}`.trim();
                              const detailsText = `ประเภททรัพย์: ${asset['ประเภททรัพย์'] || '-'}
คดีหมายเลขแดง: ${asset['คดีหมายเลขแดงที่'] || '-'}
ลำดับที่การขาย: ${asset['ลำดับที่การขาย'] || '-'}
โฉนด: ${asset['เลขที่โฉนด'] || '-'}
เนื้อที่: ${asset['เนื้อที่ (ไร่)'] || '0'} ไร่ ${asset['เนื้อที่ (งาน)'] || '0'} งาน ${asset['เนื้อที่ (ตร.วา/ตร.ม.)'] || '0'} ตร.ว/ตร.ม
สถานที่จำหน่าย: ${asset['สถานที่จำหน่าย'] || '-'}
ติดต่อ: ${asset['ติดต่อ สำนักงานบังคับคดี/กอง'] || '-'}
โทรศัพท์: ${asset['โทรศัพท์'] || '-'}
ลิงก์ประกาศ: https://asset.led.go.th/newbidreg/`;
                              const details = encodeURIComponent(detailsText);
                              const location = encodeURIComponent(asset['สถานที่จำหน่าย'] || '');
                              
                              const depositFmt = Number(String(asset['วางหลักประกันเป็นจำนวน'] || '').replace(/,/g, '') || 0).toLocaleString();
                              const fmtPrice = asset.price_numeric ? Number(asset.price_numeric).toLocaleString() : '-';
                              const isMortgagedCal = Boolean(asset['ยอดหนี้จำนอง'] && String(asset['ยอดหนี้จำนอง']) !== '0.00' && String(asset['ยอดหนี้จำนอง']) !== '0');
                              const mortgageStr = isMortgagedCal ? ` (จำนอง: ฿${Number(String(asset['ยอดหนี้จำนอง']).replace(/,/g, '')).toLocaleString()})` : '';
                              
                              const googleDetails = encodeURIComponent(`คดี: ${asset['คดีหมายเลขแดงที่']||'-'} ลำดับ: ${asset['ลำดับที่การขาย']||'-'}
เอกสารสิทธิ์: ${asset['ที่ดิน (ประเภทเอกสาร)'] || '-'}
การขาย: ${asset['เงื่อนไขการขาย'] || asset['ลักษณะการขาย'] || '-'}
จะทำการขายโดย: ${asset['จะทำการขายโดย'] || '-'}${mortgageStr}
โฉนด: ${asset['เลขที่โฉนด']||'-'} (${asset['เนื้อที่ (ไร่)']||'0'}ร่ ${asset['เนื้อที่ (งาน)']||'0'}ง ${asset['เนื้อที่ (ตร.วา/ตร.ม.)']||'0'}ว)
อ.${asset['เขต/อำเภอ']||'-'} จ.${asset['จังหวัด']||'-'}
ประเมิน: ฿${fmtPrice} มัดจำ: ฿${depositFmt}
โทร: ${asset['โทรศัพท์']||'-'}
อ้างอิง: https://asset.led.go.th/newbidreg/`);
                              googleCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(rawTitle)}&dates=${yyyymmdd}/${nextYyyymmdd}&details=${googleDetails}&location=${location}`;
                            }
                          }
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                              <div style={{ fontSize: '0.85rem', color: i === asset._nextAuction?.round ? 'var(--primary-color)' : '#64748b', fontWeight: i === asset._nextAuction?.round ? 600 : 400 }}>นัดที่ {i} : {d}</div>
                              {googleCalLink && (
                                <a href={googleCalLink} target="_blank" rel="noopener noreferrer" style={{ color: '#ea4335', display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px' }} title="เพิ่มลง Google Calendar" onClick={e => e.stopPropagation()} onMouseOver={e => e.currentTarget.style.backgroundColor='#fef2f2'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                                  <Calendar size={14} />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </div>
                </div>
              );
            })()}
          </td>
        );
      case 'place':
        return (
          <td key="place" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {getShortLocation(asset['สถานที่จำหน่าย'])}
            </div>
            {asset['โทรศัพท์'] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <Phone size={12} style={{ color: '#5f6368' }} />
                <a href={`tel:${asset['โทรศัพท์'].replace(/[^0-9]/g, '')}`} style={{ fontSize: '0.8rem', color: '#5f6368', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
                  {asset['โทรศัพท์']}
                </a>
              </div>
            )}
            {(() => {
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
              const branchName = asset['ติดต่อ สำนักงานบังคับคดี/กอง']?.trim().replace(/\s+/g, ' ');
              if (!branchName) return null;
              let liveUrl = null;
              if (branchName.includes('แพ่งกรุงเทพมหานคร 3')) liveUrl = LIVE_LINKS['แพ่งกรุงเทพมหานคร 3'];
              else if (branchName.includes('แพ่งกรุงเทพมหานคร') || branchName.includes('ส่วนกลาง') || branchName.includes('ล้มละลาย')) liveUrl = LIVE_LINKS['ส่วนกลาง'];
              else {
                for (const [key, url] of Object.entries(LIVE_LINKS)) {
                  if (key === branchName || branchName.includes(key)) {
                    liveUrl = url;
                    break;
                  }
                }
              }
              if (liveUrl) return (
                <div style={{ marginTop: '6px' }}>
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #fca5a5' }} onClick={(e) => e.stopPropagation()}>
                    <Video size={14} />
                    Live
                  </a>
                </div>
              );
              return null;
            })()}
          </td>
        );
      case 'deposit':
        return (
          <td key="deposit" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right', fontWeight: 500, color: '#3b82f6' }}>
            {(() => {
              const dep = Number(String(asset['วางหลักประกันเป็นจำนวน'] || '0').replace(/,/g, ''));
              return dep > 0 ? formatPrice(dep) : '-';
            })()}
          </td>
        );
      case 'startPrice':
        return (
          <td key="startPrice" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right', fontWeight: 500, color: '#f59e0b' }}>
            {formatPrice(getExpectedStartingPrice(asset))}
          </td>
        );
      case 'marketPrice':
        return (
          <td key="marketPrice" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right' }}>
            {formatPrice(invData.marketPrice || invData.resalePrice)}
          </td>
        );
      case 'winningPrice':
        return (
          <td key="winningPrice" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right', fontWeight: 700, color: strikeThrough ? 'inherit' : 'var(--primary-color)' }}>
            {formatPrice(finalTarget)}
            {finalRoi !== undefined && (
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>
                ROI {finalRoi.toFixed(1)}%
              </div>
            )}
          </td>
        );
      case 'walkawayPrice':
        return (
          <td key="walkawayPrice" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right', fontWeight: 700, color: strikeThrough ? 'inherit' : '#ef4444' }}>
            {formatPrice(finalWalkaway)}
            {(invData.marketPrice || invData.resalePrice) && finalWalkaway && (() => {
               if (walkawayRoi !== undefined) {
                 return <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, marginTop: '0.25rem' }}>ROI {walkawayRoi.toFixed(1)}%</div>;
               }
               return null;
            })()}
          </td>
        );
      case 'status':
        return (
          <td key="status" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select 
                  value={tracking.status || ''} 
                  onChange={(e) => handleUpdateTracking(asset.id, 'status', e.target.value)}
                  style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: '#fff', fontSize: '0.85rem', flex: 1, minWidth: '100px' }}
                >
                  <option value="">-- สถานะ --</option>
                  <option value="สนใจ">⭐ สนใจ</option>
                  <option value="สำรวจแล้ว">🚗 สำรวจแล้ว</option>
                  <option value="รอประมูล">⌛ รอประมูล</option>
                  <option value="ประมูลได้">🏆 ประมูลได้</option>
                  <option value="แพ้ประมูล">❌ แพ้ประมูล</option>
                  <option value="งดขาย">🛑 งดขาย</option>
                </select>
              </div>
            </div>
          </td>
        );
      case 'closedPrice':
        return (
          <td key="closedPrice" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const current = tracking.winPrice;
                const newPriceStr = window.prompt('ระบุราคาที่ปิดประมูลได้ (บาท):', current || '');
                if (newPriceStr !== null) {
                  const newPrice = Number(newPriceStr.replace(/,/g, ''));
                  if (!isNaN(newPrice)) {
                    handleUpdateTracking(asset.id, 'winPrice', newPrice);
                    if (newPrice > 0 && tracking.status !== 'ประมูลได้' && tracking.status !== 'แพ้ประมูล') {
                      handleUpdateTracking(asset.id, 'status', 'ประมูลได้');
                    }
                  }
                }
              }}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: tracking.winPrice ? '1px solid #10b981' : '1px dashed #cbd5e1', backgroundColor: tracking.winPrice ? '#ecfdf5' : 'transparent', color: tracking.winPrice ? '#059669' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: '100%', minWidth: '80px' }}
              onMouseOver={e => { if(!tracking.winPrice) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseOut={e => { if(!tracking.winPrice) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {tracking.winPrice ? formatPrice(tracking.winPrice) : 'กรอก'}
            </button>
          </td>
        );
      case 'sellBy':
        return (
          <td key="sellBy" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.85rem' }}>
            {(() => {
              const val = asset['จะทำการขายโดย'] || asset['เงื่อนไขการขาย'];
              if (!val) return '-';
              const isAlert = String(val).includes('ติดจำนอง') || String(val).includes('ตามโฉนด') || String(val).includes('สำเนา');
              const bg = isAlert ? '#fee2e2' : '#e0e7ff';
              const text = isAlert ? '#b91c1c' : '#4338ca';
              const border = isAlert ? '#fca5a5' : '#c7d2fe';
              return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', backgroundColor: bg, color: text, border: `1px solid ${border}`, fontWeight: 500 }}>{val}</span>;
            })()}
          </td>
        );
      case 'docType':
        return (
          <td key="docType" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.85rem' }}>
            {(() => {
              const val = asset['ที่ดิน (ประเภทเอกสาร)'] || asset['ประเภททรัพย์'];
              if (!val) return '-';
              return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 500 }}>{val}</span>;
            })()}
          </td>
        );
      case 'plaintiff':
        return (
          <td key="plaintiff" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.85rem', color: '#202124' }}>
            {asset['โจทก์'] || '-'}
          </td>
        );
      case 'remark':
        return (
          <td key="remark" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top', fontSize: '0.85rem', color: '#202124' }}>
            {asset['หมายเหตุ'] || '-'}
          </td>
        );
      case 'note':
        return (
          <td key="note" className="mobile-secondary" data-label={col.label} style={{ padding: '1rem', verticalAlign: 'top' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {asset.notes || '-'}
            </div>
          </td>
        );
      default: return null;
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'Sarabun, sans-serif', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Briefcase size={32} color="#1a73e8" />
          <h1 style={{ margin: 0, color: '#1a73e8', fontSize: '2rem', fontWeight: 600 }}><span className="desktop-only">พอร์ตประมูล</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowColumnPicker(!showColumnPicker)} 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff' }}
            >
              <Layout size={20} /> <span className="desktop-only">คอลัมน์</span>
            </button>
            {showColumnPicker && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50, width: '200px', padding: '0.5rem' }}>
                 {columns.map((col, idx) => (
                    <label 
                      key={col.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, idx)} 
                      onDragOver={handleDragOver} 
                      onDrop={(e) => handleDrop(e, idx)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'grab', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}
                    >
                      <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} />
                      <span style={{ fontSize: '0.85rem', flex: 1 }}>{col.label}</span>
                      <span style={{ color: '#cbd5e1', cursor: 'grab' }}>≡</span>
                    </label>
                  ))}
               </div>
            )}
          </div>
          <Link to="/" className="btn btn-outline" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={20} /> <span className="desktop-only">กลับไปหน้าหลัก</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          กำลังโหลดข้อมูล...
        </div>
      ) : sortedAssets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', backgroundColor: 'var(--bg-white)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Briefcase size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>ยังไม่มีทรัพย์ใน Portfolio</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>คุณสามารถเพิ่มทรัพย์ที่ต้องการติดตามเข้า Portfolio ได้จากหน้ารายละเอียดทรัพย์</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>
            ค้นหาทรัพย์
          </Link>
        </div>
      ) : (
        <>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto', backgroundColor: 'var(--bg-white)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <table className="portfolio-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '100%' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#5f6368', fontSize: '0.875rem', minWidth: '40px', borderBottom: '1px solid #dadce0' }}></th>
                {columns.filter(c => c.visible).map(renderHeader)}
              </tr>
            </thead>
            <tbody>
              {sortedAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((asset, idx) => {
                const index = (currentPage - 1) * itemsPerPage + idx;
                let invData = {};
                try {
                  if (asset.investment_data) invData = JSON.parse(asset.investment_data);
                } catch (e) {}
                const tracking = invData.tracking || {};
                const nextAuction = asset._nextAuction;
                const displayProjectName = tracking.customName || asset['ชื่อโครงการ (ซอย/หมู่บ้าน)'] || asset.project_name || getFallbackLocation(asset);
                const isStarred = tracking.isStarred;
                const notReady = tracking.notReadyToBid;
                const isEven = index % 2 === 0;
                
                const appraisal = parseFloat(asset['ราคาประเมิน (กรมบังคับคดี)']) || 0;
                const discountedPrice = getExpectedStartingPrice(asset);
                const finalTarget = invData.targetPrice || Math.max(appraisal, discountedPrice * 1.05);
                
                const defaultMarketPrice = Math.max(appraisal * 1.3, discountedPrice * 1.5);
                const marketPrice = invData.marketPrice || invData.resalePrice || defaultMarketPrice;
                const finalWalkaway = invData.walkawayPrice || invData.cutLossPrice || (finalTarget ? finalTarget * 1.1 : discountedPrice * 1.15);
                
                // Common fallbacks
                const transferFeePercent = invData.transferFeePercent !== undefined ? invData.transferFeePercent : 2.0;
                const renCost = invData.renovationCost || 0;
                const evictCost = invData.evictionCost || 0;
                const useLoan = invData.useLoan || false;
                const ltv = invData.ltv || 80;
                const sbt = (invData.hasSpecificBusinessTax !== undefined ? invData.hasSpecificBusinessTax : true) ? (marketPrice * 0.033) : (marketPrice * 0.005);
                const incomeTax = marketPrice * ((invData.incomeTaxPercent !== undefined ? invData.incomeTaxPercent : 1.0) / 100);
                const interestRate = invData.interestRate || 4.5;
                const holdingMonths = invData.holdingMonths || 6;
                
                // Accurate Target ROI fallback
                let finalRoi = invData.roi ? parseFloat(invData.roi) : 0;
                if (invData.roi === undefined) {
                  const calcTransferFeeTarget = appraisal * (transferFeePercent / 100);
                  const purchaseCostTarget = finalTarget;
                  const capNeededTarget = useLoan ? (purchaseCostTarget * (1 - ltv/100)) + renCost + evictCost + calcTransferFeeTarget : purchaseCostTarget + renCost + evictCost + calcTransferFeeTarget;
                  const totalCostTarget = purchaseCostTarget + renCost + evictCost + calcTransferFeeTarget;
                  const loanAmtTarget = useLoan ? purchaseCostTarget * (ltv / 100) : 0;
                  const holdInterestTarget = loanAmtTarget * (interestRate / 100) * (holdingMonths / 12);
                  const netProfitTarget = marketPrice - totalCostTarget - (sbt + incomeTax) - holdInterestTarget;
                  finalRoi = capNeededTarget > 0 ? (netProfitTarget / capNeededTarget) * 100 : 0;
                }
                
                // Accurate Walkaway ROI fallback
                let finalRoiWalkaway = invData.roiWalkaway ? parseFloat(invData.roiWalkaway) : 0;
                if (invData.roiWalkaway === undefined) {
                  const calcTransferFeeWalk = appraisal * (transferFeePercent / 100);
                  const purchaseCostWalk = finalWalkaway;
                  const capNeededWalk = useLoan ? (purchaseCostWalk * (1 - ltv/100)) + renCost + evictCost + calcTransferFeeWalk : purchaseCostWalk + renCost + evictCost + calcTransferFeeWalk;
                  const totalCostWalk = purchaseCostWalk + renCost + evictCost + calcTransferFeeWalk;
                  const loanAmtWalk = useLoan ? purchaseCostWalk * (ltv / 100) : 0;
                  const holdInterestWalk = loanAmtWalk * (interestRate / 100) * (holdingMonths / 12);
                  const netProfitWalk = marketPrice - totalCostWalk - (sbt + incomeTax) - holdInterestWalk;
                  finalRoiWalkaway = capNeededWalk > 0 ? (netProfitWalk / capNeededWalk) * 100 : 0;
                }
                
                const isWin = tracking.result === 'ชนะ';
                const isLose = tracking.result === 'แพ้';
                
                const defaultBg = '#ffffff';
                let rowBg = defaultBg;
                if (isWin) rowBg = '#e6f4ea';
                else if (isStarred) rowBg = '#fff8e1';
                
                const strikeThrough = notReady || isLose;
                const dimmedText = notReady || isLose;
                const hoverBg = isWin ? '#ceead6' : (isStarred ? '#ffecb3' : '#f1f3f4');

                return (
                  <tr 
                    key={asset.id} 
                    className={expandedRows[asset.id] ? "expanded" : ""}
                    style={{ 
                      backgroundColor: rowBg,
                      borderBottom: '1px solid #dadce0', 
                      cursor: 'pointer', 
                      transition: 'background-color 0.2s',
                      textDecoration: strikeThrough ? 'line-through' : 'none',
                      color: dimmedText ? '#80868b' : '#202124',
                      opacity: dimmedText ? 0.7 : 1
                    }}
                    onClick={() => setSelectedAsset(asset)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = hoverBg;
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowBg}
                  >
                    <td className="portfolio-actions-td" style={{ padding: '0.5rem', verticalAlign: 'top', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <div className="portfolio-actions-container" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '4px', color: isStarred ? '#f59e0b' : '#cbd5e1', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} 
                          onClick={(e) => updateTracking(asset, e, { isStarred: !isStarred })}
                          title="ไฮไลท์"
                        >
                          <Star size={20} fill={isStarred ? '#fcd34d' : 'none'} strokeWidth={isStarred ? 2 : 1.5} />
                        </button>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button className="btn" style={{ padding: '2px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={(e) => updateTracking(asset, e, { order: (tracking.order || 0) + 1 })} title="เลื่อนขึ้น">
                            <ArrowUp size={14} />
                          </button>
                          <button className="btn" style={{ padding: '2px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={(e) => updateTracking(asset, e, { order: (tracking.order || 0) - 1 })} title="เลื่อนลง">
                            <ArrowDown size={14} />
                          </button>
                        </div>
                        <button 
                          className="btn" 
                          style={{ padding: '2px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '4px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('คุณต้องการลบทรัพย์นี้ออกจาก Portfolio ใช่หรือไม่?')) {
                              togglePortfolio(asset, e);
                            }
                          }}
                          title="ลบออกจาก Portfolio"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    {columns.filter(c => c.visible).map(c => renderCell(c, asset, isWin, isStarred, notReady, strikeThrough, invData, tracking, getExpectedStartingPrice, getShortLocation, calculateDaysLeft, finalTarget, finalRoi, finalWalkaway, finalRoiWalkaway))}
                    <td 
                      className="mobile-only-btn" 
                      style={{ padding: '0.75rem', justifyContent: 'center', cursor: 'pointer', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }} 
                      onClick={(e) => toggleRow(e, asset.id)}
                    >
                      <span style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {expandedRows[asset.id] ? 'ย่อรายละเอียด ▴' : 'ดูรายละเอียดเพิ่มเติม ▾'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>แสดง</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem', backgroundColor: '#fff' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>รายการต่อหน้า</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              หน้า {currentPage} จาก {Math.ceil(sortedAssets.length / itemsPerPage) || 1}
            </span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff', color: currentPage === 1 ? '#94a3b8' : 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ก่อนหน้า
              </button>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="number"
                  min="1"
                  max={Math.ceil(sortedAssets.length / itemsPerPage) || 1}
                  value={currentPage}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) val = 1;
                    const maxPage = Math.ceil(sortedAssets.length / itemsPerPage) || 1;
                    if (val > maxPage) val = maxPage;
                    if (val < 1) val = 1;
                    setCurrentPage(val);
                  }}
                  style={{ width: '50px', textAlign: 'center', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', margin: '0 4px', fontSize: '0.9rem' }}
                />
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(sortedAssets.length / itemsPerPage) || 1, prev + 1))}
                disabled={currentPage >= (Math.ceil(sortedAssets.length / itemsPerPage) || 1)}
                style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: currentPage >= (Math.ceil(sortedAssets.length / itemsPerPage) || 1) ? '#f1f5f9' : '#ffffff', color: currentPage >= (Math.ceil(sortedAssets.length / itemsPerPage) || 1) ? '#94a3b8' : 'var(--text-primary)', cursor: currentPage >= (Math.ceil(sortedAssets.length / itemsPerPage) || 1) ? 'not-allowed' : 'pointer' }}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {selectedAsset && (
        <AssetModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
          onPortfolioToggle={(a, e) => togglePortfolio(a, e)}
          onNotesChange={(a, notes) => {
            setAssets(prev => prev.map(p => p.id === a.id ? { ...p, notes } : p));
          }}
          onInvestmentSave={async (a, invStr) => {
            setAssets(prev => prev.map(p => p.id === a.id ? { ...p, investment_data: invStr } : p));
            try {
              await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ led_id: a.LED_ID, is_favorite: a.is_favorite, notes: a.notes || '', investment_data: invStr })
              });
            } catch(e) { console.error('Error saving investment data', e); }
          }}
        />
      )}
    </div>
  );
};

export default Portfolio;
