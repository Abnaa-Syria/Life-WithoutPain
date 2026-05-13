import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useLanguage from '../../hooks/useLanguage';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isRTL } = useLanguage();
  const location = useLocation();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <main 
        className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col
          ${isCollapsed ? (isRTL ? 'mr-[72px]' : 'ml-[72px]') : (isRTL ? 'md:mr-[260px]' : 'md:ml-[260px]')}
        `}
      >
        <Topbar onMenuClick={() => setIsMobileOpen(true)} />
        
        <div className="flex-1 p-4 md:p-8 animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
