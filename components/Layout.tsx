import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ICONS, BRAND_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

// Additional icons for new nav items
const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const CloudflareIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.5088 16.8447C16.6288 16.4356 16.5765 16.0617 16.3547 15.7851C16.1558 15.5375 15.8401 15.3993 15.4618 15.3993H8.02913C7.94633 15.3993 7.88124 15.3634 7.85071 15.3003C7.82019 15.2463 7.82019 15.1741 7.85071 15.1021L8.22904 14.0957C8.31184 13.8672 8.51073 13.7109 8.73963 13.7109H15.9084C16.9165 13.7109 17.8226 13.2017 18.2919 12.3748C18.4137 12.1552 18.5126 11.9177 18.5863 11.6622L19.0236 10.2102C19.1073 9.93366 19.0327 9.63118 18.8384 9.42869C18.6441 9.2262 18.3629 9.14679 18.0925 9.21911L17.0203 9.49468C16.8794 9.53348 16.7476 9.45406 16.708 9.31275L15.8674 6.51293C15.7756 6.2364 15.5497 6.02551 15.2747 5.95678C15.0039 5.88805 14.7167 5.9683 14.5224 6.17021L10.9264 9.8912C10.7821 10.0424 10.5705 10.1127 10.3598 10.0748L6.99151 9.45867C6.72055 9.4028 6.43927 9.4948 6.24585 9.70471C6.05242 9.91462 5.97701 10.2099 6.04181 10.4889L6.99151 14.5227C7.03866 14.7189 6.97866 14.9247 6.8332 15.0706L4.02384 17.9058C3.83042 18.1037 3.76209 18.3927 3.84299 18.6581C3.92389 18.9235 4.14147 19.1236 4.40866 19.1845L12.3626 20.9583C12.5133 20.9925 12.6713 20.9583 12.7958 20.8633L15.1846 19.0886C15.3089 18.9936 15.3934 18.8539 15.4192 18.6969L16.5088 16.8447Z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ControlsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

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
    { name: 'Repositories', path: '/repos', icon: <GitHubIcon /> },
    { name: 'Cloudflare', path: '/cloudflare', icon: <CloudflareIcon /> },
    { name: 'Health', path: '/health', icon: <ICONS.Status /> },
    { name: 'Activity', path: '/activity', icon: <ActivityIcon /> },
    { name: 'Controls', path: '/controls', icon: <ControlsIcon /> },
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
