import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from '../core/components/sidebar/LeftSidebar';
import './MainLayout.css';
import { faSkull } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MainLayout = () => {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  return (
    <div className="layout-container">
      {/* The Sidebar */}
      <LeftSidebar
        isLeftSidebarCollapsed={isLeftSidebarCollapsed}
        changeIsLeftSidebarCollapsed={setIsLeftSidebarCollapsed}
      />

      {/* The main content */}
      <div className={`main-content ${isLeftSidebarCollapsed ? 'expanded' : ''}`}>

        {/* Reopen button */}
        {isLeftSidebarCollapsed && (
          <button
            className="btn-reopen-sidebar"
            onClick={() => setIsLeftSidebarCollapsed(false)}
            title="Ouvrir le menu"
          >
            <FontAwesomeIcon icon={faSkull} />
          </button>
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;