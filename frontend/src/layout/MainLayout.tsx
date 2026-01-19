import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from '../core/components/sidebar/LeftSidebar';
import './MainLayout.css';

const MainLayout = () => {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  return (
    <div className="layout-container">
      {/* La Sidebar */}
      <LeftSidebar
        isLeftSidebarCollapsed={isLeftSidebarCollapsed}
        changeIsLeftSidebarCollapsed={setIsLeftSidebarCollapsed}
      />

      {/* Le contenu principal */}
      <div className={`main-content ${isLeftSidebarCollapsed ? 'expanded' : ''}`}>
        
        {/* Bouton de réouverture */}
        {isLeftSidebarCollapsed && (
          <button 
            className="btn-reopen-sidebar"
            onClick={() => setIsLeftSidebarCollapsed(false)}
            title="Ouvrir le menu"
          >
            ☰
          </button>
        )}

        <Outlet />
      </div>

      {/* 🕷️ L'Araignée (Inchangée) */}
      <div className="hanging-spider"></div>
      
      {/* 💀 L'Armée de Squelettes (Sprite Animation) */}
      <div className="skeleton-walker delay-1"></div>
      <div className="skeleton-walker delay-2"></div>
      <div className="skeleton-walker delay-3"></div>
    </div>
  );
};

export default MainLayout;