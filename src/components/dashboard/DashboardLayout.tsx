import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSites } from "@/hooks/useSites";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { CreateSiteDialog } from "@/components/dashboard/CreateSiteDialog";
import {
  BarChart3,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  User,
  LayoutDashboard,
  MousePointerClick,
  GitBranch,
  Users,
} from "lucide-react";

// Nav items - some are site-specific, marked with siteSpecific: true
const getNavItems = (siteId: string | null) => [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: MousePointerClick, label: "Analytics", href: siteId ? `/dashboard/sites/${siteId}` : "/dashboard", siteSpecific: true },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const { sites } = useSites();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Persist selected site in localStorage
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(() => {
    return localStorage.getItem("selectedSiteId");
  });

  useEffect(() => {
    if (selectedSiteId) {
      localStorage.setItem("selectedSiteId", selectedSiteId);
    }
  }, [selectedSiteId]);

  // Auto-select first site if none selected
  useEffect(() => {
    if (!selectedSiteId && sites.length > 0) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? sites[0];

  const handleSignOut = async () => {
    localStorage.removeItem("selectedSiteId");
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Top Header */}
      <header className="navbar sticky top-0 z-50 border-b border-base-300 bg-base-100 px-4">
        {/* Mobile Menu */}
        <MobileNav />
        
        {/* Logo & Site Selector */}
        <div className="navbar-start gap-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-content" />
            </div>
            <span className="font-display text-lg font-bold hidden sm:inline">Metric</span>
          </Link>

          <div className="divider divider-horizontal mx-0 hidden sm:flex"></div>

          <div className="dropdown hidden sm:block">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
              <span className="max-w-[150px] truncate">
                {selectedSite?.name ?? "Select site"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-300">
              {sites.map((site) => (
                <li key={site.id}>
                  <a onClick={() => setSelectedSiteId(site.id)}>
                    <div className="flex flex-col">
                      <span className="font-medium">{site.name}</span>
                      {site.domain && (
                        <span className="text-xs opacity-70">{site.domain}</span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
              {sites.length > 0 && <li className="menu-title"><span></span></li>}
              <li>
                <a onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add new site
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Nav Items */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1">
            {getNavItems(selectedSiteId).map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Menu */}
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-300">
              <li className="menu-title">
                <span className="text-xs font-normal truncate">{user?.email}</span>
              </li>
              <li>
                <Link to="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </li>
              <li>
                <a onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>

      {/* Create Site Dialog */}
      <CreateSiteDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
