import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable || isInstalled) {
    return null; // Don't show anything if not installable or already installed
  }

  return (
    <button 
      onClick={handleInstallClick}
      style={{
        boxSizing: 'border-box', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
        backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0 10px', 
        borderRadius: '100px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
      }}
      title="ติดตั้งแอปพลิเคชัน"
    >
      <Download size={16} /> <span className="desktop-only">ติดตั้งแอป</span>
    </button>
  );
};
