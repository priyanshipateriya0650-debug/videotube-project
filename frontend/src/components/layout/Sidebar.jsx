import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  History,
  ThumbsUp,
  ListVideo,
  MessageSquare,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

/**
 * YouTube-inspired collapsible left sidebar with VideoTube's purple light theme.
 */
export default function Sidebar({ isCollapsed }) {
  const mainNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Subscriptions', path: '/subscriptions', icon: Users },
  ];

  const libraryNavItems = [
    { name: 'History', path: '/history', icon: History },
    { name: 'Liked Videos', path: '/liked', icon: ThumbsUp },
    { name: 'Playlists', path: '/playlists', icon: ListVideo },
  ];

  const communityNavItems = [
    { name: 'Community Tweets', path: '/tweets', icon: MessageSquare },
  ];

  const creatorNavItems = [
    { name: 'Creator Studio', path: '/studio', icon: LayoutDashboard },
  ];

  const settingsNavItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const renderNavGroup = (title, items) => (
    <div className="py-2 border-b border-slate-200/70 last:border-b-0">
      {!isCollapsed && title && (
        <h4 className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </h4>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'bg-[#EDE9FE] text-[#7C3AED] font-semibold shadow-xs'
                      : 'text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#7C3AED]'
                  }
                  ${isCollapsed ? 'justify-center px-2 py-3' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-[#7C3AED]' : 'text-slate-600'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <aside
      className={`
        sticky top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80
        overflow-y-auto overflow-x-hidden transition-all duration-200 z-30
        ${isCollapsed ? 'w-18' : 'w-60'}
        p-2
      `}
    >
      {renderNavGroup(null, mainNavItems)}
      {renderNavGroup('Library', libraryNavItems)}
      {renderNavGroup('Community', communityNavItems)}
      {renderNavGroup('Creator', creatorNavItems)}
      {renderNavGroup(null, settingsNavItems)}

      {!isCollapsed && (
        <div className="mt-4 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200/70 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">VideoTube Platform</p>
          <p className="mt-1 leading-relaxed">
            Light theme video sharing powered by modern React & Vite.
          </p>
        </div>
      )}
    </aside>
  );
}
