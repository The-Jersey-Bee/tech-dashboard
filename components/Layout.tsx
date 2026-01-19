import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ICONS, BRAND_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <ICONS.Dashboard /> },
    { name: 'Projects', path: '/projects', icon: <ICONS.Project /> },
    { name: 'Status', path: '/status', icon: <ICONS.Status /> },
    { name: 'Settings', path: '/settings', icon: <ICONS.Settings /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-800">
          <ICONS.Bee />
          <span className="text-xl font-bold tracking-tight">Tech Hub</span>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-500 text-gray-900 font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ICONS.User />
            )}
            <div className="truncate">
              <p className="text-white font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 w-full text-left text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <ICONS.Bee />
          <span className="text-lg font-bold">Tech Hub</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 z-40 md:hidden flex flex-col p-6 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex justify-end">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <nav className="mt-8 space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-4 text-xl font-medium text-gray-300 hover:text-yellow-500"
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
