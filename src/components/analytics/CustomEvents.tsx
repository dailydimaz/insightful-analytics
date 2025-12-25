import { formatDistanceToNow } from "date-fns";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useEventGroups, useCustomEvents, CustomEvent, EventGroup } from "@/hooks/useCustomEvents";
import { DateRange } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomEventsProps {
  siteId: string;
  dateRange: DateRange;
}

function EventDetails({ event }: { event: CustomEvent }) {
  const [expanded, setExpanded] = useState(false);
  const hasProperties = event.properties && Object.keys(event.properties).length > 0;

  return (
    <div className="border-t border-base-300 py-2 first:border-t-0">
      <div 
        className={`flex items-center justify-between ${hasProperties ? 'cursor-pointer' : ''}`}
        onClick={() => hasProperties && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="badge badge-sm badge-secondary">{event.event_name}</span>
            {event.url && (
              <span className="text-xs text-base-content/60 truncate">{event.url}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-base-content/50">
            <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
            {event.country && <span>• {event.country}</span>}
            {event.browser && <span>• {event.browser}</span>}
          </div>
        </div>
        {hasProperties && (
          <button className="btn btn-ghost btn-xs">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
      {expanded && hasProperties && (
        <div className="mt-2 p-2 bg-base-300/50 rounded text-xs font-mono">
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(event.properties, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function EventGroupCard({ group }: { group: EventGroup }) {
  return (
    <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
      <div>
        <p className="font-medium">{group.name}</p>
        <p className="text-xs text-base-content/60">
          Last: {formatDistanceToNow(new Date(group.lastOccurrence), { addSuffix: true })}
        </p>
      </div>
      <span className="badge badge-primary badge-lg">{group.count}</span>
    </div>
  );
}

export function CustomEvents({ siteId, dateRange }: CustomEventsProps) {
  const [showEvents, setShowEvents] = useState(false);
  const { data: groups, isLoading: groupsLoading } = useEventGroups({ siteId, dateRange });
  const { data: events, isLoading: eventsLoading } = useCustomEvents({ siteId, dateRange });

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-secondary" />
            <h3 className="font-semibold">Custom Events</h3>
          </div>
          <div className="tabs tabs-boxed tabs-sm">
            <button 
              className={`tab ${!showEvents ? 'tab-active' : ''}`}
              onClick={() => setShowEvents(false)}
            >
              Summary
            </button>
            <button 
              className={`tab ${showEvents ? 'tab-active' : ''}`}
              onClick={() => setShowEvents(true)}
            >
              Events
            </button>
          </div>
        </div>

        {!showEvents ? (
          // Summary view - grouped events
          <div className="space-y-2">
            {groupsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : groups && groups.length > 0 ? (
              groups.map((group) => (
                <EventGroupCard key={group.name} group={group} />
              ))
            ) : (
              <p className="text-sm text-base-content/60 text-center py-8">
                No custom events tracked yet
              </p>
            )}
          </div>
        ) : (
          // Detailed events view
          <div className="space-y-0 max-h-80 overflow-y-auto">
            {eventsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <EventDetails key={event.id} event={event} />
              ))
            ) : (
              <p className="text-sm text-base-content/60 text-center py-8">
                No custom events tracked yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
