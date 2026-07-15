import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, BookOpen, Video, CheckSquare,
  MessageSquare, FolderOpen, Heart, Phone, UserCheck, BarChart2,
  Image, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Menu,
  DollarSign, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UIDTulipIcon } from '../UIDLogo';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/exec' },
      { label: 'Notifications', icon: Bell, path: '/exec/notifications' },
    ],
  },
  {
    label: 'Members',
    items: [
      { label: 'CRM', icon: Users, path: '/exec/crm' },
      { label: 'Volunteer Mgmt', icon: Heart, path: '/exec/volunteers' },
      { label: 'Member Calls', icon: Phone, path: '/exec/calls' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { label: 'Calendar', icon: Calendar, path: '/exec/calendar' },
      { label: 'Programs', icon: BookOpen, path: '/exec/programs' },
      { label: 'Meetings', icon: Video, path: '/exec/meetings' },
      { label: 'Tasks', icon: CheckSquare, path: '/exec/tasks' },
      { label: 'RSVP', icon: UserCheck, path: '/exec/rsvp' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Messages', icon: MessageSquare, path: '/exec/messages' },
      { label: 'Documents', icon: FolderOpen, path: '/exec/documents' },
      { label: 'Media Library', icon: Image, path: '/exec/media' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Finance', icon: DollarSign, path: '/exec/finance' },
      { label: 'Analytics', icon: BarChart2, path: '/exec/analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', icon: Settings, path: '/exec/settings' },
    ],
  },
];

interface ExecLayoutProps {
  children: ReactNode;
}

export default function ExecLayout({ children }: ExecLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    path === '/exec' ? location.pathname === '/exec' : location.pathname.startsWith(path);

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0">
          <UIDTulipIcon size={collapsed ? 28 : 32} />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-semibold text-sm leading-tight">UID Toronto</div>
            <div className="text-[#3EC8C8] text-xs">Executive Board</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-hide">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 group
                    ${active
                      ? 'bg-[#3EC8C8]/20 text-[#3EC8C8] border border-[#3EC8C8]/30'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={17} className={`flex-shrink-0 ${active ? 'text-[#3EC8C8]' : 'group-hover:text-white'}`} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`border-t border-white/10 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#3EC8C8]/20 flex items-center justify-center flex-shrink-0 border border-[#3EC8C8]/30">
              <Shield size={14} className="text-[#3EC8C8]" />
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-white/40 text-[10px] capitalize truncate">{user?.exec_role?.replace('_', ' ') ?? 'Executive'}</div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-[#061E30] border-r border-white/5 flex-shrink-0 relative overflow-hidden"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0D4D7C] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#0D4D7C] transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 h-full w-64 bg-[#061E30] z-50 lg:hidden flex flex-col"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile + breadcrumb) */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-[#3D6480] hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-1.5 text-sm text-[#7A9BB5]">
              <Shield size={13} className="text-[#3EC8C8]" />
              <span>Executive Board Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0D4D7C]/8 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3EC8C8] animate-pulse" />
              <span className="text-xs font-medium text-[#0D4D7C]">Secure Access</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
