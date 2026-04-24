import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/sections/Sidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};