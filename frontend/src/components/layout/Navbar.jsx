import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Menu,
  Search,
  Video,
  Bell,
  PlaySquare,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Tv,
  ArrowLeft,
  Settings as SettingsIcon,
} from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Top Navigation Bar:
 * - Brand logo with purple VideoTube styling
 * - Hamburger menu toggle for sidebar
 * - Connected responsive search bar with Enter key execution & clearing
 * - Context-aware Auth states: Sign In button or User Avatar dropdown with Logout
 */
export default function Navbar({ onToggleSidebar, isSidebarCollapsed }) {
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Sync search input if URL search parameter changes
  useEffect(() => {
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (currentQuery) {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 px-4 h-16 flex items-center justify-between gap-4">
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen ? (
        <div className="w-full flex items-center gap-2 sm:hidden py-2">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            aria-label="Close search"
            className="p-2 text-slate-700 hover:text-[#7C3AED] rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                autoFocus
                className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-4 pr-10 py-2 rounded-l-full border border-slate-300 focus:outline-none focus:border-[#7C3AED] text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#F8FAFC] text-slate-700 hover:text-[#7C3AED] px-4 py-2 border border-l-0 border-slate-300 rounded-r-full flex items-center justify-center text-sm"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Left: Hamburger & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="p-2 text-slate-700 hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2 select-none group">
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <PlaySquare className="w-5 h-5 fill-white stroke-[#7C3AED]" />
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                  Video<span className="text-[#7C3AED]">Tube</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Search Bar (Desktop / Tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-auto hidden sm:flex items-center"
          >
            <div className="relative w-full flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos by title or description..."
                  className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-4 pr-10 py-2 rounded-l-full border border-slate-300 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search query"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="bg-[#F8FAFC] hover:bg-[#EDE9FE] text-slate-700 hover:text-[#7C3AED] px-5 py-2 border border-l-0 border-slate-300 rounded-r-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search"
              className="sm:hidden p-2 text-slate-700 hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Upload Button */}
            <Link to="/studio">
              <Button
                variant="primary"
                size="sm"
                icon={Video}
                className="hidden sm:inline-flex"
              >
                Upload
              </Button>
            </Link>

            {/* Notification Icon */}
            <button
              type="button"
              aria-label="Notifications"
              className="p-2 text-slate-700 hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-full transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#7C3AED] rounded-full ring-2 ring-white" />
            </button>

            {/* User Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative pl-1 border-l border-slate-200" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#7C3AED]/40 transition-all cursor-pointer focus:outline-none"
                  aria-label="User menu"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || user.username}
                      className="w-8 h-8 rounded-full object-cover border border-purple-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-xs border border-purple-200">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-50 text-sm">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border border-purple-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-sm">
                          {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#0F172A] truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      <Link
                        to={`/c/${user.username}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] transition-colors"
                      >
                        <Tv className="w-4 h-4 text-slate-500" />
                        <span>Your Channel</span>
                      </Link>

                      <Link
                        to="/studio"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        <span>Creator Studio</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-500" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pl-1 border-l border-slate-200">
                <Link to="/login">
                  <Button variant="outline" size="sm" icon={UserIcon}>
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
