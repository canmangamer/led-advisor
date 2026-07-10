import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const MultiSelectDropdown = ({ title, options, selected, onChange, placeholder = 'ทั้งหมด' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (opt) => {
    const val = typeof opt === 'object' ? opt.value : opt;
    if (selected.includes(val)) {
      onChange(selected.filter(item => item !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const getDisplayText = () => {
    if (!selected || selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const opt = options.find(o => (typeof o === 'object' ? o.value : o) === selected[0]);
      return opt ? (typeof opt === 'object' ? opt.label : opt) : selected[0];
    }
    if (selected.length === options.length && options.length > 1) return 'ทั้งหมด';
    return `เลือกแล้ว ${selected.length} รายการ`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', marginBottom: '0.5rem' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          backgroundColor: '#ffffff',
          border: isOpen ? '1px solid #1a73e8' : '1px solid #dadce0',
          borderRadius: '8px',
          color: selected.length > 0 ? '#202124' : '#5f6368',
          fontSize: '0.875rem',
          fontWeight: selected.length > 0 ? 500 : 400,
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 1px #1a73e8' : 'none',
          transition: 'all 0.2s',
          textAlign: 'left'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getDisplayText()}
        </span>
        <ChevronDown size={16} style={{ color: '#5f6368', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: 100,
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '0.5rem 0'
        }}>
          {title && (
            <div style={{ padding: '0.25rem 0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f3f4', marginBottom: '0.25rem' }}>
              {title}
            </div>
          )}
          
          <div 
            onClick={() => {
               if (selected.length === options.length) {
                 onChange([]);
               } else {
                 onChange(options.map(o => typeof o === 'object' ? o.value : o));
               }
            }}
            style={{
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#202124',
              backgroundColor: '#f8f9fa'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected.length === options.length ? '#1a73e8' : '#ffffff',
              borderColor: selected.length === options.length ? '#1a73e8' : '#dadce0'
            }}>
              {selected.length === options.length && <Check size={12} color="#ffffff" />}
            </div>
            <span style={{ fontWeight: 500 }}>เลือกทั้งหมด</span>
          </div>

          {options.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            const isSelected = selected.includes(val);
            return (
              <label 
                key={idx} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#3c4043',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f3f4'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#1a73e8' : '#ffffff',
                  borderColor: isSelected ? '#1a73e8' : '#dadce0'
                }}>
                  {isSelected && <Check size={12} color="#ffffff" />}
                </div>
                <input 
                  type="checkbox" 
                  style={{ display: 'none' }}
                  checked={isSelected}
                  onChange={() => handleToggle(opt)}
                />
                <span style={{ fontWeight: isSelected ? 500 : 400 }}>{label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
