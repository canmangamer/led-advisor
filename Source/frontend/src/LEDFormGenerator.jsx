import React, { useRef } from 'react';

// This component handles generating the POST forms required to view images or auction history on LED website
export const LEDFormGenerator = ({ asset, type, children, className, style }) => {
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  // Extract suit number and year
  let suitNo = asset['คดีหมายเลขแดงที่'] || '';
  let suitYear = '';
  
  if (suitNo.includes('/')) {
      const parts = suitNo.split('/');
      suitNo = parts[0];
      suitYear = parts[1];
  } else {
      suitYear = asset['ปีคดี'] || '';
  }

  // 1. Asset Details Link
  if (type === 'asset_details') {
    return (
      <form
        ref={formRef}
        action="https://asset.led.go.th/newbidreg/asset_search_law_suit.asp"
        method="POST"
        target="_blank"
        onSubmit={handleSubmit}
        style={{ display: 'inline' }}
      >
        <input type="hidden" name="search_law_suit_no" value={suitNo} />
        <input type="hidden" name="search_law_suit_year" value={suitYear} />
        <input type="hidden" name="search_law_court_name" value={asset['ศาล'] || ''} />
        <input type="hidden" name="search" value="ok" />
        
        <button type="submit" className={className || "btn btn-primary"} style={style || { width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
          {children || '🏠 ดูประกาศในเว็บกรมบังคับคดี'}
        </button>
      </form>
    );
  }

  // 2. Auction History Link
  if (type === 'auction_history') {
    
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

    const encodedSuitNo = encodeToTIS620(suitNo);

    // Instead of using form submit which might double encode the TIS620, we use a GET request
    // like the example in code_artifact (2).html
    const handleHistoryClick = (e) => {
        e.preventDefault();
        const targetUrl = `https://asset.led.go.th/report_new/reports.asp?ALAW_SUIT_NO=${encodedSuitNo}&ALAW_SUIT_YEAR=${suitYear}&Action= ค้นหา `;
        window.open(targetUrl, '_blank');
    };

    return (
      <button onClick={handleHistoryClick} className={className || "btn btn-outline"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        {children || '📊 ประวัติการประมูล'}
      </button>
    );
  }

  return null;
};
