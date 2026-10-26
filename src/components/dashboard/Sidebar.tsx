'use client';

import ZenithLogo, { ZenithMark } from "@/components/brand/ZenithLogo";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Files,
  Tag,
  Hash,
  Megaphone,
  CircleHelp,
  MessagesSquare,
  ClipboardCheck,
  Library,
  X,
  PanelLeftClose,
  LayoutTemplate,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) => {
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setIsMobileOpen]);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: Users,
      label: 'Users',
      href: '/dashboard/users',
    },
    {
      icon: BookOpen,
      label: 'Courses',
      href: '/dashboard/courses',
    },
    {
      icon: FileText,
      label: 'Blogs',
      href: '/dashboard/blog',
    },
    {
      icon: Tag,
      label: 'Blog Category',
      href: '/dashboard/blog-category',
    },
    {
      icon: Hash,
      label: 'Course Category',
      href: '/dashboard/course-categories',
    },
    {
      icon: CircleHelp,
      label: 'FAQs',
      href: '/dashboard/faqs',
    },
    {
      icon: MessagesSquare,
      label: 'QnA',
      href: '/dashboard/qna',
    },
    {
      icon: ClipboardCheck,
      label: 'Mock Tests',
      href: '/dashboard/quizzes',
    },
    {
      icon: Library,
      label: 'PYQs',
      href: '/dashboard/pyqs',
    },
    {
      icon: Users,
      label: 'Leads',
      href: '/dashboard/leads',
    },
    {
      icon: LayoutTemplate,
      label: 'Pages',
      href: '/dashboard/pages',
    },
    {
      icon: Files,
      label: 'Manage Files',
      href: '/dashboard/files',
    },
    {
      icon: Megaphone,
      label: 'Advertisements',
      href: '/dashboard/advertisement',
    },
  ];

  const isMenuItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden="true"
        onClick={() => setIsMobileOpen(false)}
        className={`
          fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]
          transition-all duration-300 lg:hidden
          ${
            isMobileOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }
        `}
      />

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-200/80 bg-white
          shadow-2xl shadow-slate-950/10
          transition-[width,transform] duration-300 ease-in-out
          lg:sticky lg:shadow-none
          ${isCollapsed ? 'lg:w-[84px]' : 'lg:w-[272px]'}
          ${
            isMobileOpen
              ? 'w-[290px] translate-x-0'
              : 'w-[290px] -translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* Brand */}
        <div
          className={`
            relative flex h-[76px] flex-shrink-0 items-center
            border-b border-slate-100
            ${
              isCollapsed && !isMobileOpen
                ? 'justify-center px-3'
                : 'justify-between px-5'
            }
          `}
        >
          <Link
            href="/"
            aria-label="Zenith Learning Home"
            className="flex min-w-0 items-center"
          >
            {/* Expanded logo */}
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center">
                <ZenithLogo />
              </div>
            )}

            {/* Collapsed logo */}
            {isCollapsed && !isMobileOpen && (
              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  overflow-hidden rounded-xl border border-slate-100
                  bg-white shadow-sm
                "
              >
                <ZenithMark className="h-9 w-9" />
              </div>
            )}
          </Link>

          {/* Desktop collapse */}
          {!isCollapsed && !isMobileOpen && (
            <button
              id="dashboard-sidebar-toggle-collapse-button"
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="
                hidden h-9 w-9 items-center justify-center rounded-xl
                text-slate-400 transition-all duration-200
                hover:bg-slate-100 hover:text-slate-700
                focus:outline-none focus:ring-2 focus:ring-brand-mid/20
                lg:flex
              "
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          )}

          {/* Mobile close */}
          <button
            id="dashboard-sidebar-close-menu-button"
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="
              flex h-9 w-9 items-center justify-center rounded-xl
              text-slate-400 transition-all
              hover:bg-slate-100 hover:text-slate-700
              lg:hidden
            "
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-5 pb-2 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Main menu
              </p>
            </div>
          )}

          <nav
            className={`
              flex-1 overflow-y-auto overflow-x-hidden
              ${
                isCollapsed && !isMobileOpen
                  ? 'space-y-2 px-3 py-5'
                  : 'space-y-1.5 px-3 pb-4 pt-1'
              }
            `}
          >
            {menuItems.map((item) => {
              const isActive = isMenuItemActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={
                    isCollapsed && !isMobileOpen ? item.label : undefined
                  }
                  className={`
                    group relative flex h-11 items-center rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${
                      isCollapsed && !isMobileOpen
                        ? 'justify-center px-0'
                        : 'gap-3 px-3'
                    }
                    ${
                      isActive
                        ? `
                          bg-brand-start-soft text-brand-mid
                          shadow-[inset_0_0_0_1px_rgba(33,71,168,0.12)]
                        `
                        : `
                          text-slate-600
                          hover:bg-slate-50 hover:text-slate-950
                        `
                    }
                  `}
                >
                  {/* Active bar */}
                  {isActive && (
                    <span
                      className={`
                        absolute bg-brand-mid
                        ${
                          isCollapsed && !isMobileOpen
                            ? '-left-3 h-6 w-1 rounded-r-full'
                            : '-left-3 h-6 w-1 rounded-r-full'
                        }
                      `}
                    />
                  )}

                  <Icon
                    className={`
                      h-[19px] w-[19px] flex-shrink-0 transition-colors
                      ${
                        isActive
                          ? 'text-brand-mid'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }
                    `}
                  />

                  {(!isCollapsed || isMobileOpen) && (
                    <>
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>

                      {isActive && (
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-mid" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex-shrink-0 border-t border-slate-100 p-3">
          {/* Desktop expand button */}
          {isCollapsed && !isMobileOpen && (
            <button
              id="dashboard-sidebar-toggle-expand-button"
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="
                mb-2 hidden h-11 w-full items-center justify-center
                rounded-xl text-slate-500 transition-all
                hover:bg-slate-100 hover:text-slate-800
                lg:flex
              "
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Expanded footer */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="mb-2 rounded-xl bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-9 w-9 flex-shrink-0 items-center justify-center
                    rounded-xl bg-brand-start-soft text-brand-mid
                  "
                >
                  <LayoutDashboard className="h-[18px] w-[18px]" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    Zenith Learning Admin
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    Management panel
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            id="dashboard-sidebar-logout-button"
            type="button"
            title={
              isCollapsed && !isMobileOpen ? 'Logout' : undefined
            }
            className={`
              flex h-11 w-full items-center rounded-xl
              text-sm font-medium text-slate-500
              transition-all duration-200
              hover:bg-red-50 hover:text-red-600
              ${
                isCollapsed && !isMobileOpen
                  ? 'justify-center'
                  : 'gap-3 px-3'
              }
            `}
          >
            <LogOut className="h-[19px] w-[19px] flex-shrink-0" />

            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
