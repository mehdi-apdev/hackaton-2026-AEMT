import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from '../core/components/sidebar/LeftSidebar';
import './MainLayout.css';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}

        <Outlet />
      </div>

      {/* 🕷️ araignée animée */}
      <div className="hanging-spider"></div>
    </div>
  );
};

export default MainLayout;