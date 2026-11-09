import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BhromonPreloader from './BhromonPreloader';
import BhromonNav from './BhromonNav';
import BhromonFooter from './BhromonFooter';

export default function PublicLayout() {
  const [isPreloading, setIsPreloading] = useState(() => {
    try {
      return sessionStorage.getItem('bhromon_preloader_seen') !== 'true';
    } catch {
      return true;
    }
  });
  const [preloaderKey, setPreloaderKey] = useState(1);

  const handlePreloaderComplete = () => {
    try {
      sessionStorage.setItem('bhromon_preloader_seen', 'true');
    } catch {}
    setIsPreloading(false);
  };

  const handleReplayPreloader = () => {
    try {
      sessionStorage.removeItem('bhromon_preloader_seen');
    } catch {}
    setIsPreloading(true);
    setPreloaderKey((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FBF7F0]">
      {/* Floating Glassmorphism Navbar - Rendered after preloader */}
      {!isPreloading && <BhromonNav />}

      {/* Animated Heritage Train & Crimson Sun Preloader */}
      {isPreloading && (
        <BhromonPreloader
          key={preloaderKey}
          onComplete={handlePreloaderComplete}
        />
      )}

      {/* Public Pages Content */}
      <Outlet context={{ handleReplayPreloader }} />

      {/* Public Footer */}
      <BhromonFooter />
    </div>
  );
}
