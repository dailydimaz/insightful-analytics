import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSites } from "@/hooks/useSites";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  ArrowLeft, 
  Globe, 
  Clock, 
  Copy, 
  Check, 
  Trash2, 
  Settings,
  Code,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  StatsCards, 
  VisitorChart, 
  TopPages, 
  TopReferrers, 
  DeviceStats, 
  GeoStats,
  DateRangePicker,
  RealtimeStats,
  RealtimeActivityFeed,
  CustomEvents,
  ExportButton,
  GoalsCard,
  GoalSetup,
} from "@/components/analytics";
import { 
  useAnalyticsStats, 
  useAnalyticsTimeSeries, 
  useTopPages, 
  useTopReferrers, 
  useDeviceStats, 
  useGeoStats,
  DateRange 
} from "@/hooks/useAnalytics";

export default function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { sites, isLoading: sitesLoading, deleteSite, updateSite } = useSites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [showGoalSetup, setShowGoalSetup] = useState(false);

  const site = sites.find((s) => s.id === id);

  // Analytics hooks
  const { data: stats, isLoading: statsLoading } = useAnalyticsStats({ 
    siteId: id || "", 
    dateRange 
  });
  const { data: timeSeries, isLoading: timeSeriesLoading } = useAnalyticsTimeSeries({ 
    siteId: id || "", 
    dateRange 
  });
  const { data: topPages, isLoading: pagesLoading } = useTopPages({ 
    siteId: id || "", 
    dateRange 
  });
  const { data: topReferrers, isLoading: referrersLoading } = useTopReferrers({ 
    siteId: id || "", 
    dateRange 
  });
  const { data: deviceStats, isLoading: devicesLoading } = useDeviceStats({ 
    siteId: id || "", 
    dateRange 
  });
  const { data: geoStats, isLoading: geoLoading } = useGeoStats({ 
    siteId: id || "", 
    dateRange 
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (site) {
      setEditName(site.name);
      setEditDomain(site.domain || "");
    }
  }, [site]);

  const copyTrackingId = async () => {
    if (!site) return;
    await navigator.clipboard.writeText(site.tracking_id);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Tracking ID copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyScript = async () => {
    if (!site) return;
    const script = `<script defer src="${window.location.origin}/track.js" data-site="${site.tracking_id}"></script>`;
    await navigator.clipboard.writeText(script);
    toast({
      title: "Copied!",
      description: "Tracking script copied to clipboard",
    });
  };

  const handleDelete = async () => {
    if (!site) return;
    if (window.confirm(`Are you sure you want to delete "${site.name}"? This action cannot be undone.`)) {
      await deleteSite.mutateAsync(site.id);
      navigate("/dashboard");
    }
  };

  const handleSave = async () => {
    if (!site) return;
    await updateSite.mutateAsync({
      id: site.id,
      name: editName,
      domain: editDomain || undefined,
    });
    setIsEditing(false);
  };

  if (authLoading || sitesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!site) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold">Site not found</h2>
          <p className="mt-2 text-base-content/70">This site doesn't exist or you don't have access to it.</p>
          <button className="btn btn-primary mt-6" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered text-2xl font-bold w-full max-w-xs"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight">{site.name}</h1>
            )}
            <p className="text-base-content/70 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {isEditing ? (
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  placeholder="example.com"
                />
              ) : (
                site.domain || "No domain set"
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <ExportButton siteId={site.id} siteName={site.name} dateRange={dateRange} />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            {isEditing ? (
              <>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={updateSite.isPending}
                >
                  {updateSite.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Save"
                  )}
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings Panel (collapsible) */}
        {showSettings && (
          <div className="card bg-base-200 animate-in">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="card-title text-base">Site Settings</h3>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button 
                    className="btn btn-error btn-outline btn-sm" 
                    onClick={handleDelete}
                    disabled={deleteSite.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Site Info Cards */}
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                {/* Tracking ID */}
                <div className="bg-base-300/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-base-content/70">Tracking ID</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 font-mono text-sm bg-base-300 px-3 py-2 rounded-lg truncate">
                      {site.tracking_id}
                    </code>
                    <button 
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={copyTrackingId}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Timezone */}
                <div className="bg-base-300/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-base-content/70">Timezone</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-base-content/70" />
                    <span>{site.timezone || "UTC"}</span>
                  </div>
                </div>

                {/* Created */}
                <div className="bg-base-300/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-base-content/70">Created</h4>
                  <span className="mt-2 block">
                    {new Date(site.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Installation */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Installation</h4>
                </div>
                <p className="text-base-content/70 text-sm">
                  Add this script to your website's <code className="bg-base-300 px-1 rounded">&lt;head&gt;</code> tag:
                </p>
                <div className="mockup-code mt-2">
                  <pre><code>{`<script defer src="${window.location.origin}/track.js" data-site="${site.tracking_id}"></script>`}</code></pre>
                </div>
                <div className="flex justify-end mt-2">
                  <button className="btn btn-primary btn-sm" onClick={copyScript}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Script
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="space-y-6">
          {/* Real-time Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RealtimeStats siteId={site.id} />
            <RealtimeActivityFeed siteId={site.id} />
          </div>

          {/* Stats Overview */}
          <StatsCards stats={stats} isLoading={statsLoading} />

          {/* Visitor Chart */}
          <VisitorChart data={timeSeries} isLoading={timeSeriesLoading} />

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TopPages pages={topPages} isLoading={pagesLoading} />
            <TopReferrers referrers={topReferrers} isLoading={referrersLoading} />
          </div>

          {/* Goals & Custom Events */}
          <div className="grid gap-6 lg:grid-cols-2">
            <GoalsCard 
              siteId={site.id} 
              dateRange={dateRange} 
              onCreateGoal={() => setShowGoalSetup(true)} 
            />
            <CustomEvents siteId={site.id} dateRange={dateRange} />
          </div>

          {/* Device Stats */}
          <DeviceStats 
            browsers={deviceStats?.browsers}
            operatingSystems={deviceStats?.operatingSystems}
            devices={deviceStats?.devices}
            isLoading={devicesLoading}
          />

          {/* Geo Stats */}
          <GeoStats countries={geoStats} isLoading={geoLoading} />
        </div>
      </div>

      {/* Goal Setup Modal */}
      {showGoalSetup && (
        <GoalSetup 
          siteId={site.id} 
          onClose={() => setShowGoalSetup(false)} 
        />
      )}
    </DashboardLayout>
  );
}
