import React, { useState, useEffect } from 'react';
import API_BASE from '../config';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Map as MapIcon, List, Table as TableIcon, Heart, MapPin, Calendar, Clock, Cable, ArrowDownUp, Target, TrendingUp, Navigation, Save, FolderOpen, Trash2, X, Edit2, Check, Home, Globe, Landmark , Briefcase } from 'lucide-react';
import { AssetModal } from '../AssetModal';
import { LEDFormGenerator } from '../LEDFormGenerator';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const CenterMarker = ({ centerLat, centerLng, setCenterLat, setCenterLng, isSelecting, setIsSelecting }) => {
  useMapEvents({
    click(e) {
      if (isSelecting) {
        setCenterLat(e.latlng.lat.toFixed(6));
        setCenterLng(e.latlng.lng.toFixed(6));
        setIsSelecting(false);
      }
    }
  });

  if (!centerLat || !centerLng) return null;

  const centerIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="display:flex; justify-content:center; align-items:center; background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5); position: relative;">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  return (
    <Marker 
      position={[parseFloat(centerLat), parseFloat(centerLng)]} 
      draggable={true}
      icon={centerIcon}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setCenterLat(pos.lat.toFixed(6));
          setCenterLng(pos.lng.toFixed(6));
        }
      }}
    >
      <Popup>📍 ตำแหน่งของคุณ / จุดศูนย์กลางค้นหา<br/><span style={{fontSize:'0.8rem', color:'#64748b'}}>(สามารถลากเพื่อย้ายได้)</span></Popup>
    </Marker>
  );
};

const iconCache = new Map();

const parseLEDDateHelper = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) return new Date(parseInt(parts[2], 10) - 543, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  return null;
};

const isAssetExpired = (asset) => {
  let lastDate = null;
  for (let i = 8; i >= 1; i--) {
      const dStr = asset[`วันที่นัดที่ ${i}`];
      if (dStr && String(dStr).includes('/')) {
          const d = parseLEDDateHelper(dStr);
          if (d) {
              lastDate = d;
              break;
          }
      }
  }
  if (lastDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      if (lastDate < today) {
          return true;
      }
  }
  return false;
};

const getMarkerIcon = (asset) => {
  const assetType = asset['ประเภททรัพย์'] || '';
  const sellMethod = asset['จะทำการขายโดย'] || '';
  const sellStatus = String(asset['ผลการขาย (ล่าสุด)'] || '');
  const expired = isAssetExpired(asset);
  const isClosed = sellStatus.includes('ขายได้') || sellStatus.includes('ถอนการยึด') || sellStatus.includes('งดขายทุกนัด') || sellStatus.includes('ขายไปแล้ว') || expired;
  
  const cacheKey = `${asset.LED_ID}_${sellStatus}_${sellMethod}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  // Professional colors and SVG paths (Lucide-based)
  let bgColor = '#64748b'; // default slate
  let iconSvg = `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`; // default map pin
  
  if (assetType.includes('ที่ดินว่างเปล่า')) {
    bgColor = '#10b981'; // emerald green
    iconSvg = `<path d="m2 9 10-5 10 5-10 5Z"/><path d="m2 14 10 5 10-5"/>`; // layers
  } else if (assetType.includes('ที่ดินพร้อมสิ่งปลูกสร้าง')) {
    bgColor = '#f59e0b'; // amber orange
    iconSvg = `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`; // home
  } else if (assetType.includes('ห้องชุด')) {
    bgColor = '#8b5cf6'; // violet purple
    iconSvg = `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>`; // building
  }

  let warningHtml = '';
  // Professional warning badge
  if (!isClosed && sellMethod.includes('ติดไป')) {
    const mortgagePrice = Number(String(asset['ยอดหนี้จำนอง'] || '0').replace(/,/g, ''));
    const appraisalPrice = Number(asset.price_numeric || 0);
    
    let badgeColor = '#8b5cf6'; // purple (0 or unknown)
    if (mortgagePrice > appraisalPrice) {
      badgeColor = '#ef4444'; // red (mortgage > appraisal)
    } else if (mortgagePrice > 0) {
      badgeColor = '#f59e0b'; // amber/yellow (mortgage <= appraisal)
    }

    warningHtml = `<div style="position: absolute; top: -4px; right: -4px; background-color: ${badgeColor}; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.3); z-index: 2; font-family: sans-serif;">!</div>`;
  }

    // Calculate Discount
  let noBidCount = 0;
  for (let i = 1; i <= 8; i++) {
      const st = asset[`สถานะนัดที่ ${i}`];
      if (st === 3 || st === '3' || (st && String(st).includes('งดขายไม่มีผู้สู้ราคา'))) noBidCount++;
  }
  let discountPercent = 0;
                  if (String(asset['จะทำการขายโดย']).includes('จำนองติดไป') || String(asset['จะทำการขายโดย']).includes('จำนำติดไป') || String(asset['จะทำการขายโดย']).includes('ติดไป')) {
                    discountPercent = 0;
                  } else {
                    if (noBidCount === 1) discountPercent = 10;
                    else if (noBidCount === 2) discountPercent = 20;
                    else if (noBidCount >= 3) discountPercent = 30;
                  }

  const formatPrice = (price) => {
    if (!price) return '-';
    if (price >= 1000000) return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (price >= 100000) return (price / 100000).toFixed(1).replace(/\.0$/, '') + 'แสน';
    if (price >= 10000) return (price / 10000).toFixed(1).replace(/\.0$/, '') + 'หมื่น';
    return price.toLocaleString();
  };
  
  const priceText = formatPrice(asset.price_numeric);
  const isMortgaged = !isClosed && (sellMethod.includes('จำนองติดไป') || sellMethod.includes('ติดจำนอง'));
  const discountBadge = (!isMortgaged && discountPercent > 0) ? `<div style="position: absolute; top: -6px; right: -6px; background-color: #ef4444; color: white; border-radius: 12px; padding: 2px 4px; font-size: 10px; font-weight: 800; border: 1.5px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.3); z-index: 3; line-height: 1;">-${discountPercent}%</div>` : '';

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; outline: none; ${isClosed ? 'filter: grayscale(100%); opacity: 0.7;' : ''}">
      <div style="position: absolute; width: 100%; height: 100%; background-color: ${bgColor}; border-radius: 16px; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); box-sizing: border-box;"></div>
      <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${bgColor}; drop-shadow(0 2px 2px rgba(0,0,0,0.3));"></div>
      
      <div style="position: relative; z-index: 1; display: flex; align-items: center; gap: 4px; padding: 4px 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${iconSvg}
        </svg>
        <span style="color: white; font-size: 11px; font-weight: 700; font-family: sans-serif; white-space: nowrap;">${priceText}</span>
      </div>
      
      ${discountBadge}
      ${warningHtml}
    </div>
  `;

  const icon = L.divIcon({
    className: 'custom-professional-icon',
    html: html,
    iconSize: [60, 28],
    iconAnchor: [30, 28],
    popupAnchor: [0, -28]
  });

  
  iconCache.set(cacheKey, icon);
  return icon;
};

function Dashboard() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filter Data from API
  const [filtersData, setFiltersData] = useState({ provinces: [], assetTypes: [], courts: [], auctionLocations: [], minPrice: 0, maxPrice: 10000000 });
  const [districtsList, setDistrictsList] = useState([]);
  const [subDistrictsList, setSubDistrictsList] = useState([]);

  // Filters State
  const [mainStatuses, setMainStatuses] = useState(['ready']); // ready, closed
  
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [auctionLocation, setAuctionLocation] = useState('');
  
  const [assetTypes, setAssetTypes] = useState([]);
  const [sellingConditions, setSellingConditions] = useState([]);
  const [mortgageRisk, setMortgageRisk] = useState('');
  const [isMultiAuction, setIsMultiAuction] = useState(false);
  const [isExtraPledge, setIsExtraPledge] = useState(false);
  const [highDepositRisk, setHighDepositRisk] = useState(false);
  
  const [auctionDateStart, setAuctionDateStart] = useState('');
  const [auctionDateEnd, setAuctionDateEnd] = useState('');
  const [depositTier, setDepositTier] = useState('');
  const [displayStatuses, setDisplayStatuses] = useState([]);
  const [deedTypes, setDeedTypes] = useState([]);
  const [ledId, setLedId] = useState('');
  
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minDeposit, setMinDeposit] = useState('');
  const [maxDeposit, setMaxDeposit] = useState('');
  
  const [deedNo, setDeedNo] = useState('');
  
  const [areaCondition, setAreaCondition] = useState('equal');
  const [areaRai, setAreaRai] = useState('');
  const [areaNgan, setAreaNgan] = useState('');
  const [areaSqWa, setAreaSqWa] = useState('');
  
  const [discountLevels, setDiscountLevels] = useState([]);
  
  const [suitNo, setSuitNo] = useState('');
  const [caseYear, setCaseYear] = useState('');
  const [plaintiff, setPlaintiff] = useState('');
  const [defendant, setDefendant] = useState('');
  const [plaintiffType, setPlaintiffType] = useState('');
  const [defendantType, setDefendantType] = useState('');
  
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  
  // New UI & Sorting States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');
  
  // Saved Filters State
  const [savedFiltersList, setSavedFiltersList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [filterNameInput, setFilterNameInput] = useState('');

  // Load saved filters on mount
  useEffect(() => {
    const saved = localStorage.getItem('led_filters_profiles');
    if (saved) {
      try { setSavedFiltersList(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Geo
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [radius, setRadius] = useState(10);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenterLat(position.coords.latitude.toFixed(6));
        setCenterLng(position.coords.longitude.toFixed(6));
        setViewMode('map');
      });
    } else {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่งปัจจุบัน");
    }
  };

  const getCurrentFiltersObject = () => {
    return { province, district, subDistrict, assetTypes, sellingConditions, mortgageRisk, displayStatuses, minPrice, maxPrice, areaCondition, areaRai, areaNgan, areaSqWa, discountLevels, mainStatuses, plaintiffType, defendantType, auctionDateStart, auctionDateEnd, auctionLocation };
  };


  const [editingFilterIdx, setEditingFilterIdx] = useState(null);
  const [editingFilterName, setEditingFilterName] = useState('');

  const saveRenameFilter = () => {
    if (!editingFilterName.trim() || editingFilterIdx === null) return;
    const newSaved = [...savedFiltersList];
    newSaved[editingFilterIdx].name = editingFilterName;
    setSavedFiltersList(newSaved);
    localStorage.setItem('led_filters_profiles', JSON.stringify(newSaved));
    setEditingFilterIdx(null);
    setEditingFilterName('');
  };

  const confirmSaveFilter = () => {
    if (!filterNameInput.trim()) return alert("กรุณาตั้งชื่อตัวกรอง");
    if (savedFiltersList.length >= 10) {
      alert("บันทึกได้สูงสุด 10 รายการเท่านั้น กรุณาลบอันเก่าออกก่อน");
      return;
    }
    const newProfile = { id: Date.now().toString(), name: filterNameInput, filters: getCurrentFiltersObject(), timestamp: Date.now() };
    const newList = [...savedFiltersList, newProfile];
    setSavedFiltersList(newList);
    localStorage.setItem('led_filters_profiles', JSON.stringify(newList));
    setShowSaveModal(false);
    setFilterNameInput('');
  };

  const applySavedFilter = (f) => {
    if (f.province !== undefined) setProvince(f.province);
    if (f.district !== undefined) setDistrict(f.district);
    if (f.subDistrict !== undefined) setSubDistrict(f.subDistrict);
    if (f.assetTypes !== undefined) setAssetTypes(f.assetTypes);
    if (f.sellingConditions !== undefined) setSellingConditions(f.sellingConditions);
    if (f.mortgageRisk !== undefined) setMortgageRisk(f.mortgageRisk);
    if (f.displayStatuses !== undefined) setDisplayStatuses(f.displayStatuses);
    if (f.minPrice !== undefined) setMinPrice(f.minPrice);
    if (f.maxPrice !== undefined) setMaxPrice(f.maxPrice);
    if (f.minDeposit !== undefined) setMinDeposit(f.minDeposit);
    if (f.maxDeposit !== undefined) setMaxDeposit(f.maxDeposit);
    if (f.areaCondition !== undefined) setAreaCondition(f.areaCondition);
    if (f.areaRai !== undefined) setAreaRai(f.areaRai);
    if (f.areaNgan !== undefined) setAreaNgan(f.areaNgan);
    if (f.areaSqWa !== undefined) setAreaSqWa(f.areaSqWa);
    if (f.discountLevels !== undefined) setDiscountLevels(f.discountLevels);
    if (f.mainStatuses !== undefined) setMainStatuses(f.mainStatuses);
    if (f.plaintiffType !== undefined) setPlaintiffType(f.plaintiffType);
    if (f.defendantType !== undefined) setDefendantType(f.defendantType);
    if (f.auctionDateStart !== undefined) setAuctionDateStart(f.auctionDateStart);
    if (f.auctionDateEnd !== undefined) setAuctionDateEnd(f.auctionDateEnd);
    if (f.auctionLocation !== undefined) setAuctionLocation(f.auctionLocation);
    setShowLoadModal(false);
  };

  const deleteSavedFilter = (id) => {
    if (!window.confirm("ต้องการลบตัวกรองนี้ใช่หรือไม่?")) return;
    const newList = savedFiltersList.filter(item => item.id !== id);
    setSavedFiltersList(newList);
    localStorage.setItem('led_filters_profiles', JSON.stringify(newList));
  };

  const clearFilters = () => {
    setMainStatuses(['ready']);
    setProvince('');
    setDistrict('');
    setSubDistrict('');
    setAuctionLocation('');
    setAuctionDateStart('');
    setAuctionDateEnd('');
    setAssetTypes([]);
    setSellingConditions([]);
    setMortgageRisk('');
    setDisplayStatuses([]);
    setDeedTypes([]);
    setLedId('');
    setPlaintiffType('');
    setDefendant('');
    setDefendantType('');
    setMinPrice('');
    setMaxPrice('');
    setMinDeposit('');
    setMaxDeposit('');
    setIsMultiAuction(false);
    setIsExtraPledge(false);
    setHighDepositRisk(false);
    setDepositTier('');
    setCenterLat('');
    setCenterLng('');
    setRadius(10);
    setIsSelectingLocation(false);
    setAreaCondition('greater');
    setAreaRai('');
    setAreaNgan('');
    setAreaSqWa('');
    setDiscountLevels([]);
    setSuitNo('');
    setCaseYear('');
    setPlaintiff('');
    setDeedNo('');
    setPage(1);
    setFavoritesOnly(false);
  };

  const toggleArrayItem = (setter, item) => setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  useEffect(() => { fetchFilters(); }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (province) {
      fetch(`${API_BASE}/api/locations/districts?province=${encodeURIComponent(province)}`)
        .then(res => res.json())
        .then(data => setDistrictsList(data));
    } else {
      setDistrictsList([]);
    }
  }, [province]);

  // Fetch SubDistricts when District changes
  useEffect(() => {
    if (province && district) {
      fetch(`${API_BASE}/api/locations/subdistricts?province=${encodeURIComponent(province)}&district=${encodeURIComponent(district)}`)
        .then(res => res.json())
        .then(data => setSubDistrictsList(data));
    } else {
      setSubDistrictsList([]);
    }
  }, [province, district]);

  useEffect(() => { fetchAssets(); }, [
    page, viewMode, mainStatuses, province, district, subDistrict, auctionLocation,
    assetTypes, sellingConditions, mortgageRisk, displayStatuses, deedTypes,
    favoritesOnly, centerLat, centerLng, radius, discountLevels,
    isMultiAuction, isExtraPledge, highDepositRisk, auctionDateStart, auctionDateEnd,
    sortBy
  ]);

  // Debounce typed filters
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchAssets(); }, 800);
    return () => clearTimeout(timer);
  }, [suitNo, caseYear, plaintiff, defendant, plaintiffType, defendantType, deedNo, ledId, areaRai, areaNgan, areaSqWa, areaCondition, minPrice, maxPrice, minDeposit, maxDeposit]);

  const getImageUrl = (path) => {
    if (!path) return null;
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('Z:/') || cleanPath.startsWith('z:/')) {
      cleanPath = cleanPath.substring(3);
    }
    const encodedPath = cleanPath.split('/').map(part => encodeURIComponent(part)).join('/');
    return `https://asset.led.go.th/PPKPicture/${encodedPath}`;
  };

  const fetchFilters = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/filters`);
      const data = await res.json();
      setFiltersData(data);
      // We don't need to force min/max to defaults from API anymore
      // setMinPrice(data.minPrice || 0);
      // setMaxPrice(data.maxPrice || 10000000);
    } catch (err) { console.error(err); }
  };

  const formatLedDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${parseInt(y) + 543}`;
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page, limit: viewMode === 'map' ? 5000 : (typeof limit !== 'undefined' ? limit : 20),
        mainStatuses: mainStatuses.join(','), province, district, subDistrict, auctionLocation,
        assetTypes: assetTypes.join(','),
        sellingConditions: sellingConditions.join(','),
        mortgageRisk,
        displayStatuses: displayStatuses.join(','),
        deedTypes: deedTypes.join(','),
        deedNo, ledId, areaCondition, areaRai, areaNgan, areaSqWa,
        discountLevels: discountLevels.join(','),
        suitNo, caseYear, plaintiff, defendant, plaintiffType, defendantType,
        favoritesOnly, minPrice, maxPrice, minDeposit, maxDeposit,
        isMultiAuction, isExtraPledge, highDepositRisk,
        auctionDateStart, auctionDateEnd, sortBy
      });
      
      if (centerLat && centerLng) {
        searchParams.append('lat', centerLat);
        searchParams.append('lng', centerLng);
        searchParams.append('radius', radius);
      }

      const res = await fetch(`${API_BASE}/api/assets?${searchParams}`);
      const data = await res.json();
      setAssets(data.data);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const togglePortfolio = async (asset, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      const newPortfolio = asset.is_portfolio ? 0 : 1;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: asset.id,
          is_portfolio: newPortfolio
        })
      });
      if (res.ok) {
        setAssets(prev => prev.map(a => 
          (a.id === asset.id) ? { ...a, is_portfolio: newPortfolio } : a
        ));
        if (selectedAsset && (selectedAsset.id === asset.id)) {
          setSelectedAsset(prev => ({ ...prev, is_portfolio: newPortfolio }));
        }
      }
    } catch (err) {
      console.error('Error toggling portfolio:', err);
    }
  };

  const toggleFavorite = async (asset, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
        e.nativeEvent.preventDefault();
      }
    }
    const newStatus = asset.is_favorite ? 0 : 1;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: asset.id, is_favorite: newStatus, notes: asset.notes || '' })
      });
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, is_favorite: newStatus } : a));
      if (selectedAsset?.id === asset.id) setSelectedAsset(prev => ({ ...prev, is_favorite: newStatus }));
    } catch (err) { console.error('Error saving favorite', err); }
  };

  const handleNotesChange = (asset, newNotes) => {
    setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, notes: newNotes } : a));
    if (selectedAsset?.id === asset.id) setSelectedAsset(prev => ({ ...prev, notes: newNotes }));
  };

  const handleInvestmentSave = async (asset, investmentDataStr) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: asset.id, is_favorite: asset.is_favorite, notes: asset.notes || '', investment_data: investmentDataStr })
      });
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, investment_data: investmentDataStr } : a));
      if (selectedAsset?.id === asset.id) setSelectedAsset(prev => ({ ...prev, investment_data: investmentDataStr }));
    } catch (err) { console.error('Error saving investment data', err); }
  };

  const generatePageNumbers = (current, total) => {
    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total];
    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const parseLEDDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) return new Date(parseInt(parts[2], 10) - 543, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    return null;
  };

  const getNextAuction = (asset) => {
    const now = new Date();
    now.setHours(0,0,0,0);
    let nextDate = null;
    let nextDateStr = '';
    let roundNo = '';
    
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
      const diffDays = Math.ceil(Math.abs(nextDate - now) / (1000 * 60 * 60 * 24));
      return { dateStr: nextDateStr, daysLeft: diffDays, roundNo };
    }
    return null;
  };

  const availableTypes = ['ที่ดินว่างเปล่า', 'ที่ดินพร้อมสิ่งปลูกสร้าง', 'ห้องชุด'];
  const debtTypes = ['-', 'การจำนองติดไป', 'การจำนำติดไป', 'ปลอดการจำนอง', 'ปลอดภาระผูกพัน', 'ไม่มีภาระจำนอง'];
  const dispStatuses = ['ถอนการยึด', 'ขายไปแล้ว', 'งดขายทุกนัด', 'ทรัพย์หมดประมูลแล้ว'];
  const availableDeeds = ['โฉนดที่ดิน (ตัวจริง)', 'สำเนาโฉนดที่ดิน', 'น.ส.3 ทุกประเภท', 'สำเนา น.ส. 3 ทุกประเภท', 'ไม่ระบุ / อื่นๆ'];

  const getActiveFiltersSummary = () => {
    const filters = [];
    if (province) filters.push('จังหวัด: ' + province);
    if (district) filters.push('อำเภอ: ' + district);
    if (subDistrict) filters.push('ตำบล: ' + subDistrict);
    if (auctionLocation) filters.push('สถานที่จัดประมูล: ' + auctionLocation);
    if (auctionDateStart || auctionDateEnd) filters.push(`วันที่ประมูล: ${auctionDateStart || '...'} ถึง ${auctionDateEnd || '...'}`);
    if (assetTypes.length > 0) filters.push('ประเภททรัพย์: ' + assetTypes.join(', '));
    if (sellingConditions.length > 0) filters.push('เงื่อนไข: ' + sellingConditions.join(', '));
    if (mortgageRisk) {
      if (mortgageRisk === 'zero') filters.push('ความเสี่ยงจำนอง: ไม่มี/0');
      if (mortgageRisk === 'high') filters.push('ความเสี่ยงจำนอง: สูง (หนี้ > ประเมิน)');
      if (mortgageRisk === 'low') filters.push('ความเสี่ยงจำนอง: ต่ำ (หนี้ <= ประเมิน)');
    }
    if (isMultiAuction) filters.push('ประมูลหลายรอบ');
    if (isExtraPledge) filters.push('ติดจำนองพิเศษ');
    if (highDepositRisk) filters.push('หลักประกันสูงกว่าเกณฑ์');
    if (discountLevels.length > 0) {
      const texts = discountLevels.map(v => v === '5' ? '5+ ครั้ง' : `${v} ครั้ง`);
      filters.push('ไม่มีผู้สู้ราคา: ' + texts.join(', '));
    }
    if (displayStatuses.length > 0) filters.push('สถานะเพิ่มเติม: ' + displayStatuses.join(', '));
    if (deedTypes.length > 0) filters.push('ประเภทเอกสาร: ' + deedTypes.join(', '));
    if (minPrice && minPrice !== '0' && maxPrice && maxPrice !== '0') filters.push(`ราคาประเมิน: ${Number(minPrice).toLocaleString()} - ${Number(maxPrice).toLocaleString()}`);
    else if (minPrice && minPrice !== '0') filters.push(`ราคาประเมิน: >= ${Number(minPrice).toLocaleString()}`);
    else if (maxPrice && maxPrice !== '0') filters.push(`ราคาประเมิน: <= ${Number(maxPrice).toLocaleString()}`);

    if (minDeposit && minDeposit !== '0' && maxDeposit && maxDeposit !== '0') filters.push(`หลักประกัน: ${Number(minDeposit).toLocaleString()} - ${Number(maxDeposit).toLocaleString()}`);
    else if (minDeposit && minDeposit !== '0') filters.push(`หลักประกัน: >= ${Number(minDeposit).toLocaleString()}`);
    else if (maxDeposit && maxDeposit !== '0') filters.push(`หลักประกัน: <= ${Number(maxDeposit).toLocaleString()}`);
    
    const computedArea = (Number(areaRai) || 0) * 400 + (Number(areaNgan) || 0) * 100 + (Number(areaSqWa) || 0);
    if (computedArea > 0) {
      const cond = areaCondition === 'greater' ? '>=' : areaCondition === 'less' ? '<=' : '=';
      const parts = [];
      if (areaRai) parts.push(`${areaRai} ไร่`);
      if (areaNgan) parts.push(`${areaNgan} งาน`);
      if (areaSqWa) parts.push(`${areaSqWa} ตร.วา`);
      filters.push(`พื้นที่: ${cond} ${parts.join(' ')}`);
    }
    
    if (suitNo) filters.push('หมายเลขคดี: ' + suitNo);
    if (caseYear) filters.push('ปีคดี: ' + caseYear);
    if (plaintiff) filters.push('โจทก์: ' + plaintiff);
    if (plaintiffType === 'person') filters.push('ประเภทโจทก์: บุคคลธรรมดา');
    if (plaintiffType === 'juristic') filters.push('ประเภทโจทก์: นิติบุคคล');
    if (defendant) filters.push('จำเลย: ' + defendant);
    if (defendantType === 'person') filters.push('ประเภทจำเลย: บุคคลธรรมดา');
    if (defendantType === 'juristic') filters.push('ประเภทจำเลย: นิติบุคคล');
    if (deedNo) filters.push('เลขที่โฉนด: ' + deedNo);
    if (ledId) filters.push('รหัส: ' + ledId);
    
    return filters;
  };
  
  const activeFilters = getActiveFiltersSummary();

  return (
    <>
      <div className="app-wrapper">
      <div className={`sidebar ${showMobileFilters ? 'show-mobile' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>ค้นหาทรัพย์</h2>
          <button 
            className="mobile-filter-close" 
            onClick={() => setShowMobileFilters(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
          >
            ✕
          </button>
        </div>
        
        

        <div className="filter-group">
          <div className="filter-title">สถานะทรัพย์</div>
          <MultiSelectDropdown options={[{label: 'พร้อมประมูล', value: 'ready'}, {label: 'ปิดการประมูล', value: 'closed'}]} selected={mainStatuses} onChange={setMainStatuses} placeholder="เลือกสถานะทรัพย์" />
        </div>

        <div className="filter-group">
          <div className="filter-title">ประเภททรัพย์</div>
          <MultiSelectDropdown options={availableTypes} selected={assetTypes} onChange={setAssetTypes} placeholder="เลือกประเภททรัพย์" />
        </div>

        <div className="filter-group">
          <div className="filter-title">สถานที่</div>
          <select className="input-field" style={{ marginBottom: '0.5rem' }} value={province} onChange={e => {setProvince(e.target.value); setDistrict(''); setSubDistrict('');}}>
            <option value="">จังหวัดทั้งหมด</option>
            {filtersData.provinces?.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input-field" style={{ marginBottom: '0.5rem' }} value={district} onChange={e => {setDistrict(e.target.value); setSubDistrict('');}} disabled={!province}>
            <option value="">อำเภอ/เขตทั้งหมด</option>
            {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input-field" value={subDistrict} onChange={e => setSubDistrict(e.target.value)}>
            <option value="">แขวง/ตำบลทั้งหมด</option>
            {subDistrictsList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input-field" value={auctionLocation} onChange={e => setAuctionLocation(e.target.value)}>
            <option value="">สถานที่จัดประมูล (ทั้งหมด)</option>
            <option value="บางขุนนนท์">กรมบังคับคดี บางขุนนนท์ (อาคารอสีติพรรษ)</option>
            <option value="สามย่านมิตรทาวน์">สามย่านมิตรทาวน์</option>
            <option value="แพ่งกรุงเทพมหานคร 3">สำนักงานบังคับคดีแพ่ง กทม. 3</option>
            <option value="นครปฐม">บังคับคดี นครปฐม</option>
            <option value="นนทบุรี">บังคับคดี นนทบุรี</option>
            <option value="ปทุมธานี">บังคับคดี ปทุมธานี</option>
          </select>
        </div>



        <div className="filter-group">
          <div className="filter-title">ราคาประเมิน (0 = ไม่จำกัด)</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="number" className="input-field" placeholder="ต่ำสุด (฿)" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <input type="number" className="input-field" placeholder="สูงสุด (฿)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-title">เงินวางหลักประกัน (0 = ไม่จำกัด)</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="number" className="input-field" placeholder="ต่ำสุด (฿)" value={minDeposit} onChange={e => setMinDeposit(e.target.value)} />
            <input type="number" className="input-field" placeholder="สูงสุด (฿)" value={maxDeposit} onChange={e => setMaxDeposit(e.target.value)} />
          </div>
          
          <div style={{ marginTop: '0.5rem' }}>
            <label className="checkbox-item">
              <input type="checkbox" checked={highDepositRisk} onChange={(e) => setHighDepositRisk(e.target.checked)} />
              ทรัพย์ที่วางหลักประกันสูงกว่าเกณฑ์
            </label>
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-title">จะทำการขายโดย</div>
          <MultiSelectDropdown options={debtTypes} selected={sellingConditions} onChange={setSellingConditions} placeholder="เลือกการขายโดย" />
          
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>กรองความเสี่ยงการจำนอง</label>
            <select className="form-control" value={mortgageRisk} onChange={e => setMortgageRisk(e.target.value)}>
              <option value="">-- ไม่กรอง (แสดงทั้งหมด) --</option>
              <option value="zero">ยอดจำนอง = 0 / ไม่ระบุ (สีม่วง)</option>
              <option value="high">ยอดจำนอง &gt; ราคาประเมิน (สีแดง)</option>
              <option value="low">ยอดจำนอง &lt;= ราคาประเมิน (สีเหลือง)</option>
            </select>
          </div>
          
          <div style={{ marginTop: '0.5rem' }}>
            <label className="checkbox-item">
              <input type="checkbox" checked={isMultiAuction} onChange={(e) => setIsMultiAuction(e.target.checked)} />
              ประมูลหลายรอบ (Y)
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={isExtraPledge} onChange={(e) => setIsExtraPledge(e.target.checked)} />
              ติดจำนองพิเศษ
            </label>
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-title">แสดงตามสถานะ (เพิ่มเติม)</div>
          <MultiSelectDropdown options={dispStatuses} selected={displayStatuses} onChange={setDisplayStatuses} placeholder="เลือกสถานะเพิ่มเติม" />
        </div>

        <div className="filter-group">
          <div className="filter-title">ประเภทเอกสาร</div>
          <MultiSelectDropdown options={availableDeeds} selected={deedTypes} onChange={setDeedTypes} placeholder="เลือกประเภทเอกสาร" />
          <input type="text" className="input-field" placeholder="เลขที่โฉนด..." style={{ marginTop: '0.5rem' }} value={deedNo} onChange={e => setDeedNo(e.target.value)} />
        </div>

        <div className="filter-group">
          <div className="filter-title">ขนาดพื้นที่ (ตร.วา)</div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <select className="input-field" style={{ width: '80px', padding: '0.5rem 0.25rem' }} value={areaCondition} onChange={e => setAreaCondition(e.target.value)}>
              <option value="equal">เท่ากับ</option>
              <option value="greater">มากกว่า</option>
              <option value="less">น้อยกว่า</option>
            </select>
            <input type="number" className="input-field" style={{ flex: 1, padding: '0.5rem 0.25rem' }} placeholder="ไร่" value={areaRai} onChange={e => setAreaRai(e.target.value)} />
            <input type="number" className="input-field" style={{ flex: 1, padding: '0.5rem 0.25rem' }} placeholder="งาน" value={areaNgan} onChange={e => setAreaNgan(e.target.value)} />
            <input type="number" className="input-field" style={{ flex: 1, padding: '0.5rem 0.25rem' }} placeholder="ตร.วา" value={areaSqWa} onChange={e => setAreaSqWa(e.target.value)} />
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-title">ไม่มีผู้สู้ราคา (ครั้ง)</div>
          <MultiSelectDropdown 
            options={[
              { value: '0', label: '0 ครั้ง (รอบ 1 ส่วนลด 0%)' },
              { value: '1', label: '1 ครั้ง (รอบ 2 ส่วนลด 10%)' },
              { value: '2', label: '2 ครั้ง (รอบ 3 ส่วนลด 20%)' },
              { value: '3', label: '3 ครั้ง (รอบ 4 ส่วนลด 30%)' },
              { value: '4', label: '4 ครั้ง (รอบ 5 ส่วนลด 30%)' },
              { value: '5', label: '5 ครั้งขึ้นไป (รอบ 6+ ส่วนลด 30%)' }
            ]} 
            selected={discountLevels} 
            onChange={setDiscountLevels} 
            placeholder="เลือกจำนวนครั้ง (รอบ)" 
          />
        </div>

        <div className="filter-group">
          <div className="filter-title">ข้อมูลคดี</div>
          <input type="text" className="input-field" placeholder="หมายเลขคดี (เช่น ผบ.1252)" style={{ marginBottom: '0.5rem' }} value={suitNo} onChange={e => setSuitNo(e.target.value)} />
          <input type="text" className="input-field" placeholder="ปีคดี (เช่น 2567)" style={{ marginBottom: '0.5rem' }} value={caseYear} onChange={e => setCaseYear(e.target.value)} />
          <input type="text" className="input-field" placeholder="โจทก์ (เช่น ธนาคาร)" style={{ marginBottom: '0.5rem' }} value={plaintiff} onChange={e => setPlaintiff(e.target.value)} />
          <select className="form-control" style={{ marginBottom: '0.5rem' }} value={plaintiffType} onChange={e => setPlaintiffType(e.target.value)}>
            <option value="">ประเภทโจทก์ (ทั้งหมด)</option>
            <option value="person">บุคคลธรรมดา (นาย, นาง)</option>
            <option value="juristic">นิติบุคคล (บริษัท, ธนาคาร)</option>
          </select>
          
          <input type="text" className="input-field" placeholder="จำเลย" style={{ marginBottom: '0.5rem' }} value={defendant} onChange={e => setDefendant(e.target.value)} />
          <select className="form-control" value={defendantType} onChange={e => setDefendantType(e.target.value)}>
            <option value="">ประเภทจำเลย (ทั้งหมด)</option>
            <option value="person">บุคคลธรรมดา (นาย, นาง)</option>
            <option value="juristic">นิติบุคคล (บริษัท, หจก.)</option>
          </select>
          
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem', marginTop: '0.5rem' }}>ช่วงวันที่จะถึงประมูล</label>
          {/* Quick Date Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.4rem' }}>
            {[
              { label: 'วันนี้', getRange: () => { const t = new Date(); const s = t.toISOString().split('T')[0]; return [s, s]; } },
              { label: 'พรุ่งนี้', getRange: () => { const t = new Date(); t.setDate(t.getDate() + 1); const s = t.toISOString().split('T')[0]; return [s, s]; } },
              { label: 'อาทิตย์นี้', getRange: () => { const t = new Date(); const day = t.getDay(); const mon = new Date(t); mon.setDate(t.getDate() - day + 1); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); return [mon.toISOString().split('T')[0], sun.toISOString().split('T')[0]]; } },
              { label: 'อาทิตย์หน้า', getRange: () => { const t = new Date(); const day = t.getDay(); const mon = new Date(t); mon.setDate(t.getDate() - day + 8); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); return [mon.toISOString().split('T')[0], sun.toISOString().split('T')[0]]; } },
            ].map(({ label, getRange }) => {
              const [s, e] = getRange();
              const isActive = auctionDateStart === s && auctionDateEnd === e;
              return (
                <button
                  key={label}
                  onClick={() => { if (isActive) { setAuctionDateStart(''); setAuctionDateEnd(''); } else { setAuctionDateStart(s); setAuctionDateEnd(e); } }}
                  style={{
                    padding: '3px 10px', fontSize: '0.78rem', fontWeight: 600, borderRadius: '100px', cursor: 'pointer', transition: 'all 0.15s',
                    backgroundColor: isActive ? '#1a73e8' : '#f1f5f9',
                    color: isActive ? 'white' : '#475569',
                    border: isActive ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <input type="date" className="input-field" value={auctionDateStart} onChange={e => setAuctionDateStart(e.target.value)} />
            <input type="date" className="input-field" value={auctionDateEnd} onChange={e => setAuctionDateEnd(e.target.value)} />
          </div>
        </div>


        
        
      
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid #dadce0', paddingTop: '1rem', paddingBottom: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', color: '#5f6368', borderColor: '#dadce0', fontWeight: 500 }} onClick={() => {
              setMainStatuses([]); setAssetTypes([]); setProvince(''); setDistrict(''); setSubDistrict(''); setAuctionLocation(''); setDepositTier(''); setMinPrice(''); setMaxPrice(''); setMinDeposit(''); setMaxDeposit(''); setHighDepositRisk(false); setSellingConditions([]); setMortgageRisk(''); setIsMultiAuction(false); setIsExtraPledge(false); setDisplayStatuses([]); setDeedTypes([]); setDeedNo(''); setAreaCondition('equal'); setAreaRai(''); setAreaNgan(''); setAreaSqWa(''); setDiscountLevels([]); setSuitNo(''); setCaseYear(''); setPlaintiff(''); setPlaintiffType(''); setDefendant(''); setDefendantType(''); setAuctionDateStart(''); setAuctionDateEnd('');
            }}>
              ล้างค่า
            </button>
            <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#1a73e8', borderColor: '#dadce0', display: 'flex', alignItems: 'center' }} onClick={() => setShowSaveModal(true)} title="บันทึกตัวกรอง">
              <Save size={18} />
            </button>
            <button className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#1a73e8', borderColor: '#dadce0', display: 'flex', alignItems: 'center' }} onClick={() => setShowLoadModal(true)} title="โหลดตัวกรอง">
              <FolderOpen size={18} />
            </button>
          </div>
        </div>
</div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', overflowY: viewMode === 'map' ? 'hidden' : 'auto', padding: viewMode === 'map' ? '1rem 1rem 0 1rem' : '1rem', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button 
                className="mobile-filter-open"
                onClick={() => setShowMobileFilters(true)}
                style={{ display: 'none', background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', alignItems: 'center', gap: '4px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                กรองข้อมูล
              </button>
              <h2 className="title" style={{ fontSize: '1.75rem', margin: 0 }}>รายการทรัพย์สินรอการขาย</h2>
            </div>
            <p style={{ color: 'var(--text-color)', opacity: 0.8, margin: 0 }}>
              พบทรัพย์ทั้งหมด <strong>{totalItems}</strong> รายการ 
              {viewMode === 'map' && totalItems > 5000 && (
                <span style={{ color: 'var(--danger-color)', marginLeft: '8px', fontWeight: 'bold' }}>
                  (แสดงบนแผนที่ 5000 รายการ โปรดระบุเงื่อนไขเพิ่มเติม)
                </span>
              )}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.25rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <ArrowDownUp size={16} style={{ color: '#64748b' }} />
              <select className="input-field" style={{ padding: '0.25rem', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.875rem', backgroundColor: 'transparent' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="">เรียงตามความเกี่ยวข้องกัน</option>
                <option value="date_asc">วันที่ประมูล (ใกล้สุดก่อน)</option>
                <option value="price_asc">ราคาประเมิน (ต่ำ &rarr; สูง)</option>
                <option value="price_desc">ราคาประเมิน (สูง &rarr; ต่ำ)</option>
                <option value="size_asc">ขนาดพื้นที่ (น้อย &rarr; มาก)</option>
                <option value="size_desc">ขนาดพื้นที่ (มาก &rarr; น้อย)</option>
                <option value="sale_order_asc">ลำดับที่การขาย (น้อย &rarr; มาก)</option>
                <option value="sale_order_desc">ลำดับที่การขาย (มาก &rarr; น้อย)</option>
              </select>
            </div>

            <button className={`btn ${favoritesOnly ? 'btn-danger' : 'btn-outline'}`} onClick={() => setFavoritesOnly(!favoritesOnly)}>
              <Heart fill={favoritesOnly ? 'currentColor' : 'none'} size={18} /> {favoritesOnly ? 'ดูทั้งหมด' : 'รายการโปรด'}
            </button>
            <div style={{ display: 'flex', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
              <button className="btn" style={{ backgroundColor: viewMode === 'list' ? 'var(--card-bg)' : 'transparent', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none', color: viewMode === 'list' ? 'var(--primary-color)' : 'inherit', border: 'none' }} onClick={() => setViewMode('list')}>
                <List size={18} /> รายการ
              </button>
              <button className="btn" style={{ backgroundColor: viewMode === 'map' ? 'var(--card-bg)' : 'transparent', boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none', color: viewMode === 'map' ? 'var(--primary-color)' : 'inherit', border: 'none' }} onClick={() => setViewMode('map')}>
                <MapIcon size={18} /> แผนที่
              </button>
            </div>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-color)', opacity: 0.7 }}>กรองด้วย:</span>
            {activeFilters.map((f, i) => (
              <span key={i} style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {f}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem' }}>กำลังค้นหาข้อมูล...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : assets.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Search size={48} style={{ color: 'var(--border-color)', margin: '0 auto 1rem' }} />
            <h3>ไม่พบข้อมูลทรัพย์สิน</h3>
            <p>ลองปรับเปลี่ยนเงื่อนไขการค้นหาในแถบด้านซ้ายดูนะครับ</p>
          </div>
        ) : (
          <>
            {viewMode === 'map' && (
              <div className="map-container" style={{ flex: 1, position: 'relative', margin: '0 -1rem' }}>
                
                {/* Modern Map Controls */}
                <button 
                  className="mobile-only-btn"
                  onClick={() => setViewMode('list')}
                  style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, backgroundColor: 'white', border: '1px solid #dadce0', borderRadius: '100px', padding: '10px 16px', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontWeight: 600, color: '#3c4043', cursor: 'pointer' }}
                >
                  <List size={18} color="#1a73e8" /> กลับไปแบบรายการ
                </button>
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={getCurrentLocation}
                    title="ตำแหน่งปัจจุบันของฉัน"
                    style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <Navigation size={22} color="#1a73e8" />
                  </button>
                  <button 
                    onClick={() => setIsSelectingLocation(!isSelectingLocation)}
                    title={isSelectingLocation ? "กำลังปักหมุด (คลิกเพื่อยกเลิก)" : "ปักหมุดด้วยตัวเอง"}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: isSelectingLocation ? '#ef4444' : 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <MapPin size={22} color={isSelectingLocation ? 'white' : '#1a73e8'} />
                  </button>
                </div>

                <div className="map-radius-control" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px 24px', borderRadius: '100px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '15px', width: '90%', maxWidth: '350px', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3c4043', whiteSpace: 'nowrap' }}>รัศมี {radius} กม.</span>
                  <input type="range" min="1" max="50" step="1" style={{ flex: 1, accentColor: '#1a73e8' }} value={radius} onChange={e => setRadius(e.target.value)} />
                </div>

                <MapContainer center={[13.7563, 100.5018]} zoom={6} style={{ height: '100%', width: '100%' }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {centerLat && centerLng && <ChangeView center={[parseFloat(centerLat), parseFloat(centerLng)]} zoom={13} />}
                  <CenterMarker centerLat={centerLat} centerLng={centerLng} setCenterLat={setCenterLat} setCenterLng={setCenterLng} isSelecting={isSelectingLocation} setIsSelecting={setIsSelectingLocation} />
                  <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
                  {assets.filter(a => a.latitude && a.longitude).map((asset) => (
                    <Marker key={asset.id || asset.LED_ID} position={[asset.latitude, asset.longitude]} icon={getMarkerIcon(asset)}>
                      <Popup>
                        <div style={{ minWidth: '200px' }}>
                          {asset['พาธรูประบบ (landpicture)'] && (
                            <img src={getImageUrl(asset['พาธรูประบบ (landpicture)'])} alt="ทรัพย์" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                          )}
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b' }}>
                            {asset['ประเภททรัพย์']} {asset.project_name ? `- ${asset.project_name}` : ''}
                            {asset['ประมูลหลายรอบ (Y/N)'] === 'Y' && <Clock size={18} color="var(--warning-color)" title="ประมูลหลายรอบ" />}
                            {asset['ติดจำนองพิเศษ (is_extra_pledgb)'] === 'T' && <Cable size={16} color="var(--danger-color)" title="ติดจำนองพิเศษ" />}
                          </h4>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>ทำเล: ต.{asset['แขวง/ตำบล'] || '-'} อ.{asset['เขต/อำเภอ'] || '-'}, จ.{asset['จังหวัด']}</p>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>
                            ขนาด: {asset['ประเภททรัพย์']?.includes('ห้องชุด') ? `${asset['เนื้อที่ (ตร.วา/ตร.ม.)'] || 0} ตร.ม.` : [asset['เนื้อที่ (ไร่)'] ? `${asset['เนื้อที่ (ไร่)']} ไร่` : '', asset['เนื้อที่ (งาน)'] ? `${asset['เนื้อที่ (งาน)']} งาน` : '', asset['เนื้อที่ (ตร.วา/ตร.ม.)'] ? `${asset['เนื้อที่ (ตร.วา/ตร.ม.)']} ตร.ว.` : ''].filter(Boolean).join(' ') || '-'}
                          </p>
                          
                          {/* Only show status if it's a risky status like การจำนองติดไป */}
                          {asset['จะทำการขายโดย'] && asset['จะทำการขายโดย'].includes('ติดไป') && (
                            <div style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--danger-color)' }}>
                                สถานะ: <strong>{asset['จะทำการขายโดย']}</strong>
                              </span>
                              {Number(String(asset['ยอดหนี้จำนอง'] || '0').replace(/,/g, '')) > 0 ? (
                                <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>
                                  (ยอดหนี้: ฿{!isNaN(Number(String(asset['ยอดหนี้จำนอง']).replace(/,/g, ''))) ? Number(String(asset['ยอดหนี้จำนอง']).replace(/,/g, '')).toLocaleString() : asset['ยอดหนี้จำนอง']})
                                </span>
                              ) : (
                                <span style={{ marginLeft: '4px', color: '#8b5cf6', fontWeight: 'bold' }}>
                                  (ไม่ระบุยอดหนี้)
                                </span>
                              )}
                            </div>
                          )}

                          {(() => {
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

                            return (
                              <div style={{ marginBottom: '0.25rem' }}>
                                <p style={{ margin: 0, color: discountPercent > 0 ? '#94a3b8' : 'var(--primary-color)', fontWeight: discountPercent > 0 ? 'normal' : 'bold', textDecoration: discountPercent > 0 ? 'line-through' : 'none', fontSize: discountPercent > 0 ? '0.8rem' : '1rem' }}>
                                  ราคาประเมิน: ฿{Number(basePrice).toLocaleString()}
                                </p>
                                {discountPercent > 0 && (
                                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--danger-color)', fontWeight: 'bold', fontSize: '1rem' }}>
                                    ราคาเริ่มใหม่ (-{discountPercent}%): ฿{discountedPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits:0})}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                          
                          {(() => {
                            const sellStatus = String(asset['ผลการขาย (ล่าสุด)'] || '');
                            const expired = isAssetExpired(asset);
                            const isClosed = sellStatus.includes('ขายได้') || sellStatus.includes('ถอนการยึด') || sellStatus.includes('งดขายทุกนัด') || sellStatus.includes('ขายไปแล้ว') || expired;
                            
                            if (isClosed) {
                              if (sellStatus.includes('ขายได้')) {
                                return (
                                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--danger-color)', fontWeight: 'bold' }}>
                                    ✅ ขายได้ ราคา ฿{Number(String(asset['ราคาขายได้/เสนอสูงสุด'] || '0').replace(/,/g, '')).toLocaleString()}
                                  </p>
                                );
                              } else {
                                return (
                                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
                                    🚫 ปิดการประมูล: {sellStatus}
                                  </p>
                                );
                              }
                            } else {
                              const nextAuc = getNextAuction(asset);
                              if (nextAuc) {
                                return (
                                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: nextAuc.daysLeft <= 7 ? 'var(--danger-color)' : 'var(--primary-color)', fontWeight: 'bold' }}>
                                    ประมูลรอบต่อไป (นัดที่ {nextAuc.roundNo}): {nextAuc.dateStr} (อีก {nextAuc.daysLeft} วัน)
                                  </p>
                                );
                              }
                            }
                            return null;
                          })()}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1, padding: '0.25rem' }} onClick={() => setSelectedAsset(asset)}>
                              ดูรายละเอียดทั้งหมด
                            </button>
                            <button className="btn btn-outline" title="Portfolio" style={{ color: asset.is_portfolio ? 'var(--primary-color)' : 'inherit', borderColor: asset.is_portfolio ? 'var(--primary-color)' : 'var(--border-color)', padding: '0.25rem 0.5rem', marginRight: '0.5rem' }} onClick={(e) => togglePortfolio(asset, e)}>
                                <Briefcase fill={asset.is_portfolio ? 'currentColor' : 'none'} size={18} />
                              </button>
<button className="btn btn-outline" style={{ color: asset.is_favorite ? 'var(--danger-color)' : 'inherit', borderColor: asset.is_favorite ? 'var(--danger-color)' : 'var(--border-color)', padding: '0.25rem 0.5rem' }} onClick={(e) => toggleFavorite(asset, e)}>
                              <Heart fill={asset.is_favorite ? 'currentColor' : 'none'} size={18} />
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  </MarkerClusterGroup>
                </MapContainer>
                
                {assets.filter(a => !a.latitude || !a.longitude).length > 0 && (
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '0.5rem 1rem', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 1000, borderLeft: '4px solid #f59e0b', fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>
                    ⚠️ มี {assets.filter(a => !a.latitude || !a.longitude).length} รายการ ที่ไม่ระบุพิกัด
                  </div>
                )}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="asset-grid">
                {assets.map((asset, idx) => {
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

                  let invData = null;
                  if (asset.investment_data) {
                    try { invData = JSON.parse(asset.investment_data); } catch(e){}
                  }

                  return (
                    <div className="asset-card" key={asset.LED_ID + '_' + idx} style={{ opacity: isAssetExpired(asset) ? 0.6 : 1, filter: isAssetExpired(asset) ? 'grayscale(80%)' : 'none' }}>
                      {/* Image Section with Overlays */}
                      <div style={{ width: '100%', height: '220px', backgroundColor: '#e2e8f0', position: 'relative', cursor: 'pointer' }} onClick={() => setSelectedAsset(asset)}>
                        {asset['พาธรูประบบ (landpicture)'] ? (
                          <img 
                            src={getImageUrl(asset['พาธรูประบบ (landpicture)'])} 
                            alt="ทรัพย์" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }} 
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            ไม่มีรูปภาพ
                          </div>
                        )}
                        
                        {/* Status Overlay */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {String(asset['ที่ดิน (ประเภทเอกสาร)'] || '').includes('สำเนา') && (
                            <span className="badge" style={{ backgroundColor: 'var(--danger-color)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                               ขายตามสำเนา
                            </span>
                          )}
                          

                          {String(asset['จะทำการขายโดย']).includes('ติดไป') && (
                            <span className="badge" style={{ backgroundColor: '#f59e0b', fontSize: '0.75rem', padding: '0.25rem 0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                               ติดจำนอง {!isNaN(Number(String(asset['ยอดหนี้จำนอง']).replace(/,/g, ''))) ? Number(String(asset['ยอดหนี้จำนอง']).replace(/,/g, '')).toLocaleString() : asset['ยอดหนี้จำนอง']} บาท
                            </span>
                          )}
                        </div>

                          {(String(asset['สถานะทรัพย์ (ป้ายแดง)']).includes('ปิดการประมูล') || isAssetExpired(asset)) && (
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%) rotate(-25deg)',
                              backgroundColor: String(asset['ผลการขาย (ล่าสุด)'] || '').includes('ขายได้') ? 'rgba(34, 197, 94, 0.95)' : 'rgba(107, 114, 128, 0.95)',
                              color: 'white',
                              padding: '6px 40px',
                              fontSize: '1.15rem',
                              fontWeight: 'bold',
                              borderTop: '2px dashed rgba(255,255,255,0.7)',
                              borderBottom: '2px dashed rgba(255,255,255,0.7)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                              zIndex: 10,
                              whiteSpace: 'nowrap',
                              textTransform: 'uppercase',
                              letterSpacing: '2px',
                              pointerEvents: 'none',
                              backdropFilter: 'blur(4px)',
                              width: '120%',
                              textAlign: 'center'
                            }}>
                              {String(asset['ผลการขาย (ล่าสุด)'] || '').includes('ขายได้') 
                                ? `ขายได้ ${Number(String(asset['ราคาขายได้/เสนอสูงสุด'] || '0').replace(/,/g, '')).toLocaleString()} บาท`
                                : 'งดประมูล'}
                            </div>
                          )}
                      </div>

                      <div className="asset-card-header" style={{ paddingBottom: '0.5rem', borderBottom: 'none' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {asset['ประเภททรัพย์']} {asset.project_name ? `- ${asset.project_name}` : ''}
                            {asset['ประมูลหลายรอบ (Y/N)'] === 'Y' && <Clock size={18} color="var(--warning-color)" title="ประมูลหลายรอบ" />}
                            {asset['ติดจำนองพิเศษ (is_extra_pledgb)'] === 'T' && <Cable size={18} color="var(--danger-color)" title="ติดจำนองพิเศษ" />}
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={14} /> ต.{asset['แขวง/ตำบล'] || '-'} อ.{asset['เขต/อำเภอ'] || '-'} จ.{asset['จังหวัด'] || '-'}
                          </p>
                          {asset['ลำดับที่การขาย'] && (
                            <p style={{ fontSize: '0.85rem', color: '#0f766e', backgroundColor: '#ccfbf1', display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, marginTop: '0.25rem' }}>
                              ลำดับขาย: {asset['ลำดับที่การขาย']}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="asset-card-body" onClick={() => setSelectedAsset(asset)} style={{ cursor: 'pointer', paddingTop: 0 }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                          ขนาด: {asset['ประเภททรัพย์']?.includes('ห้องชุด') ? `${asset['เนื้อที่ (ตร.วา/ตร.ม.)'] || 0} ตร.ม.` : [asset['เนื้อที่ (ไร่)'] ? `${asset['เนื้อที่ (ไร่)']} ไร่` : '', asset['เนื้อที่ (งาน)'] ? `${asset['เนื้อที่ (งาน)']} งาน` : '', asset['เนื้อที่ (ตร.วา/ตร.ม.)'] ? `${asset['เนื้อที่ (ตร.วา/ตร.ม.)']} ตร.ว.` : ''].filter(Boolean).join(' ') || '-'}
                        </p>
                        
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                          <p style={{ fontSize: discountPercent > 0 ? '0.875rem' : '1.25rem', color: discountPercent > 0 ? '#64748b' : 'var(--primary-color)', textDecoration: discountPercent > 0 ? 'line-through' : 'none', fontWeight: discountPercent > 0 ? 400 : 700 }}>
                            ราคาประเมิน: ฿{Number(asset.price_numeric || 0).toLocaleString()}
                          </p>
                          {discountPercent > 0 && (
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                              ราคาเริ่มประมูลใหม่ (-{discountPercent}%): ฿{discountedPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits:0})}
                            </p>
                          )}
                        </div>
                        
                        {invData && asset.is_favorite && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: (invData.netProfit || invData.roi) > 0 ? '#ecfdf5' : '#fef2f2', border: `2px solid ${(invData.netProfit || invData.roi) > 0 ? '#10b981' : '#ef4444'}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: `1px dashed ${(invData.netProfit || invData.roi) > 0 ? '#a7f3d0' : '#fecaca'}`, paddingBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Target size={16} style={{ color: '#f59e0b' }} /> เป้าหมายประมูล:
                              </span>
                              <span style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>฿{Number(invData.targetPrice || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.9rem', color: (invData.netProfit || invData.roi) > 0 ? '#059669' : '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <TrendingUp size={16} /> กำไรสุทธิคาดการณ์:
                              </span>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '1.25rem', color: (invData.netProfit || invData.roi) > 0 ? '#059669' : '#dc2626', fontWeight: 900, lineHeight: 1 }}>
                                  {invData.netProfit !== undefined ? `฿${Number(invData.netProfit).toLocaleString(undefined, {maximumFractionDigits:0})}` : ''}
                                </span>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: (invData.netProfit || invData.roi) > 0 ? '#10b981' : '#ef4444', fontWeight: 700, marginTop: '0.15rem' }}>
                                  ROI {Number(invData.roi || 0).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {(() => {
                          const nextAuc = getNextAuction(asset);
                          if (nextAuc) {
                            return (
                              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: nextAuc.daysLeft <= 7 ? 'var(--danger-color)' : 'var(--primary-color)', fontWeight: 600, backgroundColor: 'var(--bg-color)', padding: '0.5rem', borderRadius: '4px' }}>
                                <Calendar size={16} /> 
                                นัดที่ {nextAuc.roundNo}: {nextAuc.dateStr} (อีก {nextAuc.daysLeft} วัน)
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div className="asset-card-footer" style={{ flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSelectedAsset(asset)}>ดูรายละเอียด</button>
                          <button className="btn btn-outline" title="Portfolio" style={{ color: asset.is_portfolio ? 'var(--primary-color)' : 'inherit', borderColor: asset.is_portfolio ? 'var(--primary-color)' : 'var(--border-color)', marginRight: '0.5rem' }} onClick={(e) => togglePortfolio(asset, e)}>
                              <Briefcase fill={asset.is_portfolio ? 'currentColor' : 'none'} size={18} />
                            </button>
<button className="btn btn-outline" style={{ color: asset.is_favorite ? 'var(--danger-color)' : 'inherit', borderColor: asset.is_favorite ? 'var(--danger-color)' : 'var(--border-color)' }} onClick={(e) => toggleFavorite(asset, e)}>
                            <Heart fill={asset.is_favorite ? 'currentColor' : 'none'} size={18} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {asset['Google Map Link'] && (
                            <a href={asset['Google Map Link']} target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dadce0', color: '#34a853', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} title="Google Maps" onClick={(e) => e.stopPropagation()}>
                              <MapPin size={18} />
                            </a>
                          )}
                          {asset['LandsMaps URL'] && (
                            <a href={asset['LandsMaps URL']} target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dadce0', color: '#fbbc04', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} title="LandsMaps" onClick={(e) => e.stopPropagation()}>
                              <MapIcon size={18} />
                            </a>
                          )}
                          <LEDFormGenerator
                            asset={asset}
                            type="asset_details"
                            className=""
                            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dadce0', color: '#1a73e8', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }}
                            title="ประกาศ LED"
                          >
                            <Landmark size={18} />
                          </LEDFormGenerator>
                          <LEDFormGenerator
                            asset={asset}
                            type="auction_history"
                            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dadce0', color: '#ea4335', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }}
                            title="ประวัติประมูล"
                          >
                            <Calendar size={18} />
                          </LEDFormGenerator>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {viewMode === 'list' && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>ก่อนหน้า</button>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {generatePageNumbers(page, totalPages).map((p, idx) => (
                    p === '...' ? <span key={idx} style={{ padding: '0.25rem 0.5rem' }}>...</span> :
                    <button key={idx} className={`btn ${page === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(p)} style={{ padding: '0.25rem 0.75rem', minWidth: '40px' }}>{p}</button>
                  ))}
                </div>

                <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>ถัดไป</button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>ไปที่: </span>
                  <input type="number" min="1" max={totalPages} className="input-field" style={{ width: '70px', padding: '0.25rem' }} placeholder="หน้า" onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= totalPages) setPage(val);
                    }
                  }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Close app-wrapper */}
      </div>

      {selectedAsset && (
        <AssetModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
          onFavoriteToggle={toggleFavorite}
            onPortfolioToggle={togglePortfolio} 
          onNotesChange={handleNotesChange}
          onInvestmentSave={handleInvestmentSave}
        />
      )}

      {showSaveModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ width: '400px', padding: '1.5rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>บันทึกตัวกรอง</h3>
              <button className="modal-close" onClick={() => setShowSaveModal(false)}><X size={20} /></button>
            </div>
            <input type="text" className="input-field" placeholder="ตั้งชื่อตัวกรอง..." value={filterNameInput} onChange={e => setFilterNameInput(e.target.value)} autoFocus />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowSaveModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={confirmSaveFilter}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ width: '450px', padding: '1.5rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>โหลดตัวกรองที่บันทึกไว้</h3>
              <button className="modal-close" onClick={() => setShowLoadModal(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {savedFiltersList.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', margin: '2rem 0' }}>ไม่มีตัวกรองที่บันทึกไว้</p>
              ) : (
                savedFiltersList.map((sf, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    {editingFilterIdx === idx ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                        <input type="text" className="input-field" value={editingFilterName} onChange={e => setEditingFilterName(e.target.value)} style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} autoFocus />
                        <button className="btn btn-outline" style={{ padding: '0.4rem', color: '#10b981', borderColor: 'transparent' }} onClick={saveRenameFilter}><Check size={16} /></button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem', color: '#64748b', borderColor: 'transparent' }} onClick={() => setEditingFilterIdx(null)}><X size={16} /></button>
                      </div>
                    ) : (
                      <>
                        <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => applySavedFilter(sf.filters)}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{sf.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(sf.timestamp).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <button className="btn btn-outline" style={{ padding: '0.4rem', color: '#3b82f6', borderColor: 'transparent' }} onClick={() => { setEditingFilterIdx(idx); setEditingFilterName(sf.name); }}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.4rem', color: '#ef4444', borderColor: 'transparent' }} onClick={() => deleteSavedFilter(sf.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
