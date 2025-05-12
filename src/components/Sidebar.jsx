import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiUsers, 
  HiBookOpen, 
  HiCollection,
  HiShieldCheck,
  HiRefresh,
  HiBookmark
} from 'react-icons/hi';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/dashboard', icon: HiUsers, label: 'Users' },
    { path: '/episodes', icon: HiBookOpen, label: 'Episodes' },
    { path: '/stories', icon: HiCollection, label: 'Stories' },
    { path: '/single-stories', icon: HiBookmark, label: 'Single Stories' },
    { path: '/poocha-police', icon: HiShieldCheck, label: 'Poocha Police' },
    { path: '/force-update', icon: HiRefresh, label: 'Force Update' },
  ];

  return (
    <div 
      className={`fixed left-0 top-16 h-full bg-gray-800 text-white w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="py-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 transition-colors ${
                isActive 
                  ? 'bg-gray-700 border-l-4 border-indigo-500' 
                  : 'hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 