import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * AppShell:
 * Wraps Navbar, collapsible Sidebar, and the dynamic main content area.
 */
export default function AppShell() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Container: Sidebar + Page Content */}
      <div className="flex flex-1">
        <Sidebar isCollapsed={isSidebarCollapsed} />

        {/* Scrollable Main Area */}
        <main className="flex-1 bg-white min-w-0 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
