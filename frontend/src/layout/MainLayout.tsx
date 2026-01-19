import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "../features/system/components/left-sidebar/LeftSidebar";
import "./MainLayout.css";
import classNames from "classnames";

const MainLayout = () => {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const updateSize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setIsLeftSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const contentClasses = classNames({
    "layout-content": true,
    "layout-content-trimmed": !isLeftSidebarCollapsed && screenWidth > 768,
  });

  return (
    <div>
      <LeftSidebar
        isLeftSidebarCollapsed={isLeftSidebarCollapsed}
        changeIsLeftSidebarCollapsed={setIsLeftSidebarCollapsed}
      />
      <main className={contentClasses}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
