import React, { useState } from 'react';
import { HiMenuAlt2 } from 'react-icons/hi';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg h-16 fixed w-full top-0 z-50">
      <div className="max-w-[1920px] mx-auto h-full px-4 md:px-6">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Toggle Sidebar"
            >
              <HiMenuAlt2 className="h-6 w-6 text-gray-600" />
            </button>
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>
            <div className="flex items-center">
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <span className="text-sm text-gray-500">
                  Welcome, Admin
                </span>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Logout"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the admin panel."
      />
    </nav>
  );
};

export default Navbar; 