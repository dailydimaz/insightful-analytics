import { Activity, Users, Globe } from "lucide-react";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";

interface RealtimeStatsProps {
  siteId: string;
}

export function RealtimeStats({ siteId }: RealtimeStatsProps) {
  const { activeVisitors, activePages, isConnected } = useRealtimeAnalytics(siteId);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-success animate-pulse" />
            <h3 className="font-semibold">Real-time</h3>
          </div>
          <div className="flex items-center gap-1">
            <span 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'}`} 
            />
            <span className="text-xs text-base-content/60">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Active Visitors Count */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold">{activeVisitors}</p>
            <p className="text-sm text-base-content/60">Active visitors (5 min)</p>
          </div>
        </div>

        {/* Active Pages */}
        {activePages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-base-content/60" />
              <span className="text-sm font-medium">Active Pages</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activePages.slice(0, 5).map((page, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm bg-base-200/50 rounded px-2 py-1"
                >
                  <span className="truncate flex-1 font-mono text-xs">{page.url}</span>
                  <span className="badge badge-sm badge-primary ml-2">{page.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeVisitors === 0 && (
          <p className="text-sm text-base-content/60 text-center py-4">
            No active visitors right now
          </p>
        )}
      </div>
    </div>
  );
}
