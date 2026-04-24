import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { sitesApi } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import type { Site } from '../../types';
import { clsx } from 'clsx';
import {
  Layout,
  BarChart3,
  SquarePen,
  Link,
  FileText,
  User,
  LogOut,
  Settings,
} from 'lucide-react';

interface Stats {
  total: number;
  published: number;
  draft: number;
}

const Sidebar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['site-stats'],
    queryFn: async () => {
      const sites: Site[] = await sitesApi.list().then((res: any) => res.data.data);
      const total = sites.length;
      const published = sites.filter((s) => s.status === 'published').length;
      const draft = sites.filter((s) => s.status !== 'published').length;
      return { total, published, draft };
    },
  });

  const handleLogout = async () => {
    try { await import('../../lib/api').then((m) => m.authApi.logout()); } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-surface border-r border-border flex-shrink-0 flex flex-col">
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
          <Layout size={18} className="text-black" />
        </div>
        <span className="font-display font-bold text-xl text-text tracking-tight">Buildly</span>
      </div>

      <nav className="flex-1 flex flex-col overflow-y-auto px-3 pt-2">
        {/* Dashboard Overview */}
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            clsx(
              'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1',
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:text-text hover:bg-white/5'
            )
          }
        >
          <Layout size={18} />
          <span className="ml-3">Dashboard</span>
        </NavLink>

        <div className="my-4 px-3">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-1">Manage</div>
          <div className="space-y-1">
            {/* Templates */}
            <NavLink
              to="/dashboard/templates"
              end
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-text hover:bg-white/5'
                )
              }
            >
              <SquarePen size={18} />
              <span className="ml-3">Templates</span>
            </NavLink>

            {/* Published Sites */}
            <NavLink
              to="/dashboard/published"
              end
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-text hover:bg-white/5'
                )
              }
            >
              <Link size={18} />
              <span className="ml-3 text-sm">Published</span>
              {!isLoading && (
                <span className="ml-auto bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold text-muted">
                  {stats?.published}
                </span>
              )}
            </NavLink>

            {/* Draft Sites */}
            <NavLink
              to="/dashboard/drafts"
              end
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-text hover:bg-white/5'
                )
              }
            >
              <FileText size={18} />
              <span className="ml-3">Drafts</span>
              {!isLoading && (
                <span className="ml-auto bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold text-muted">
                  {stats?.draft}
                </span>
              )}
            </NavLink>
          </div>
        </div>

         {/* DNS Help Section */}
         <div className="mb-2">
           <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-1">DNS Setup</div>
           <div className="px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
             <p className="text-[10px] text-amber-300/70 font-medium mb-1">Custom Domain CNAME</p>
             <p className="text-[9px] text-gray-500 leading-tight">
               To connect a custom domain, add a CNAME record:<br/>
               <code className="text-amber-200/80">your-domain.com</code><br/>
               pointing to<br/>
               <code className="text-amber-200/80">sites.{window.location.hostname === 'localhost' ? 'yourapp.io' : window.location.hostname.replace(/^www\./, '').replace(/^render\./, '')}</code><br/>
               <span className="text-amber-500/50">(in your domain registrar's DNS settings)</span>
             </p>
           </div>
         </div>

         <div className="mt-auto pt-4 px-3 pb-6 space-y-1">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-1">Account</div>
          {/* Profile/Settings */}
          <NavLink
            to="/dashboard/profile"
            end
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-text hover:bg-white/5'
              )
            }
          >
            <Settings size={18} />
            <span className="ml-3">Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut size={18} />
            <span className="ml-3">Sign out</span>
          </button>
        </div>
      </nav>

      {/* User Info */}
      <div className="px-6 py-4 border-t border-border bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold uppercase">
            {user?.name?.[0] || user?.email?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-muted truncate uppercase tracking-tight">{user?.plan || 'free'} plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;