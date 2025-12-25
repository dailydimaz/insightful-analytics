import { formatDistanceToNow } from "date-fns";
import { Activity, Globe, MousePointer, ExternalLink } from "lucide-react";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";

interface RealtimeActivityFeedProps {
  siteId: string;
}

function getEventIcon(eventName: string) {
  switch (eventName) {
    case "pageview":
      return <Globe className="h-4 w-4" />;
    case "click":
      return <MousePointer className="h-4 w-4" />;
    case "outbound":
      return <ExternalLink className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getEventColor(eventName: string) {
  switch (eventName) {
    case "pageview":
      return "text-primary";
    case "click":
      return "text-secondary";
    case "outbound":
      return "text-accent";
    case "404":
      return "text-error";
    default:
      return "text-info";
  }
}

export function RealtimeActivityFeed({ siteId }: RealtimeActivityFeedProps) {
  const { recentEvents, isConnected } = useRealtimeAnalytics(siteId);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h3 className="font-semibold">Live Activity</h3>
          </div>
          {isConnected && (
            <span className="badge badge-success badge-sm gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-content animate-pulse" />
              Live
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-base-content/60 text-center py-8">
              Waiting for events...
            </p>
          ) : (
            recentEvents.slice(0, 20).map((event) => (
              <div 
                key={event.id}
                className="flex items-start gap-3 p-2 rounded-lg bg-base-200/30 hover:bg-base-200/50 transition-colors animate-in fade-in slide-in-from-top-1 duration-300"
              >
                <div className={`mt-0.5 ${getEventColor(event.event_name)}`}>
                  {getEventIcon(event.event_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-sm badge-outline">
                      {event.event_name}
                    </span>
                    {event.country && (
                      <span className="text-xs text-base-content/60">
                        {event.country}
                      </span>
                    )}
                  </div>
                  {event.url && (
                    <p className="text-sm font-mono truncate text-base-content/80 mt-1">
                      {event.url}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-base-content/50">
                    <span>
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                    {event.browser && <span>• {event.browser}</span>}
                    {event.device_type && <span>• {event.device_type}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
