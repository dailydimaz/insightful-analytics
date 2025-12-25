import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeEvent {
  id: string;
  url: string | null;
  event_name: string;
  created_at: string;
  country: string | null;
  browser: string | null;
  device_type: string | null;
  referrer: string | null;
  visitor_id: string | null;
}

interface ActiveVisitor {
  visitor_id: string;
  lastSeen: Date;
  url: string | null;
  country: string | null;
}

export interface RealtimeStats {
  activeVisitors: number;
  activePages: { url: string; count: number }[];
  recentEvents: RealtimeEvent[];
}

const ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const MAX_RECENT_EVENTS = 50;

export function useRealtimeAnalytics(siteId: string) {
  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<Map<string, ActiveVisitor>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Clean up stale visitors
  const cleanupStaleVisitors = useCallback(() => {
    const now = new Date();
    setActiveVisitors(prev => {
      const updated = new Map(prev);
      for (const [visitorId, visitor] of updated) {
        if (now.getTime() - visitor.lastSeen.getTime() > ACTIVE_THRESHOLD) {
          updated.delete(visitorId);
        }
      }
      return updated;
    });
  }, []);

  // Fetch initial recent events
  useEffect(() => {
    if (!siteId) return;

    const fetchInitialEvents = async () => {
      const fiveMinutesAgo = new Date(Date.now() - ACTIVE_THRESHOLD).toISOString();
      
      const { data, error } = await supabase
        .from("events")
        .select("id, url, event_name, created_at, country, browser, device_type, referrer, visitor_id")
        .eq("site_id", siteId)
        .gte("created_at", fiveMinutesAgo)
        .order("created_at", { ascending: false })
        .limit(MAX_RECENT_EVENTS);

      if (!error && data) {
        setRecentEvents(data);
        
        // Build initial active visitors map
        const visitors = new Map<string, ActiveVisitor>();
        data.forEach(event => {
          if (event.visitor_id && !visitors.has(event.visitor_id)) {
            visitors.set(event.visitor_id, {
              visitor_id: event.visitor_id,
              lastSeen: new Date(event.created_at),
              url: event.url,
              country: event.country,
            });
          }
        });
        setActiveVisitors(visitors);
      }
    };

    fetchInitialEvents();
  }, [siteId]);

  // Subscribe to realtime events
  useEffect(() => {
    if (!siteId) return;

    let channel: RealtimeChannel;

    const setupSubscription = () => {
      channel = supabase
        .channel(`events-${siteId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "events",
            filter: `site_id=eq.${siteId}`,
          },
          (payload) => {
            const newEvent = payload.new as RealtimeEvent;
            
            // Add to recent events
            setRecentEvents(prev => {
              const updated = [newEvent, ...prev].slice(0, MAX_RECENT_EVENTS);
              return updated;
            });

            // Update active visitors
            if (newEvent.visitor_id) {
              setActiveVisitors(prev => {
                const updated = new Map(prev);
                updated.set(newEvent.visitor_id!, {
                  visitor_id: newEvent.visitor_id!,
                  lastSeen: new Date(newEvent.created_at),
                  url: newEvent.url,
                  country: newEvent.country,
                });
                return updated;
              });
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED");
        });
    };

    setupSubscription();

    // Cleanup stale visitors every minute
    const cleanupInterval = setInterval(cleanupStaleVisitors, 60 * 1000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(cleanupInterval);
    };
  }, [siteId, cleanupStaleVisitors]);

  // Calculate active pages
  const activePages = Array.from(activeVisitors.values())
    .reduce((acc, visitor) => {
      const url = visitor.url || "/";
      const existing = acc.find(p => p.url === url);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ url, count: 1 });
      }
      return acc;
    }, [] as { url: string; count: number }[])
    .sort((a, b) => b.count - a.count);

  return {
    activeVisitors: activeVisitors.size,
    activePages,
    recentEvents,
    isConnected,
  };
}
