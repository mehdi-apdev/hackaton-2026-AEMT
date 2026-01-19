import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from '../core/components/sidebar/LeftSidebar';
import './MainLayout.css';

const MainLayout = () => {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  return (
    <div className="layout-container">
      {/* La Sidebar (qui peut se cacher) */}
      <LeftSidebar
        isLeftSidebarCollapsed={isLeftSidebarCollapsed}
        changeIsLeftSidebarCollapsed={setIsLeftSidebarCollapsed}
      />

      {/* Le contenu principal */}
      <div className={`main-content ${isLeftSidebarCollapsed ? 'expanded' : ''}`}>
        
        {/* --- LE SAUVEUR : Bouton de réouverture --- */}
        {isLeftSidebarCollapsed && (
          <button 
            className="btn-reopen-sidebar"
            onClick={() => setIsLeftSidebarCollapsed(false)}
            title="Ouvrir le menu"
          >
            ☰ {/* Ou <i className="fal fa-bars"></i> si tu as FontAwesome */}
          </button>
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;