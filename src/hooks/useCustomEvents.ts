import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "./useAnalytics";

interface CustomEventsParams {
  siteId: string;
  dateRange: DateRange;
}

export interface CustomEvent {
  id: string;
  event_name: string;
  url: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
  country: string | null;
  browser: string | null;
}

export interface EventGroup {
  name: string;
  count: number;
  lastOccurrence: string;
}

function getDateRangeFilter(dateRange: DateRange): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  let start: Date;
  
  switch (dateRange) {
    case "today":
      start = startOfDay(new Date());
      break;
    case "7d":
      start = startOfDay(subDays(new Date(), 7));
      break;
    case "30d":
      start = startOfDay(subDays(new Date(), 30));
      break;
    case "90d":
      start = startOfDay(subDays(new Date(), 90));
      break;
    default:
      start = startOfDay(subDays(new Date(), 7));
  }
  
  return { start, end };
}

export function useCustomEvents({ siteId, dateRange }: CustomEventsParams) {
  const { start, end } = getDateRangeFilter(dateRange);

  return useQuery({
    queryKey: ["custom-events", siteId, dateRange],
    queryFn: async (): Promise<CustomEvent[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("id, event_name, url, properties, created_at, country, browser")
        .eq("site_id", siteId)
        .neq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      return (data || []).map(event => ({
        ...event,
        properties: event.properties as Record<string, unknown> | null,
      }));
    },
    enabled: !!siteId,
  });
}

export function useEventGroups({ siteId, dateRange }: CustomEventsParams) {
  const { start, end } = getDateRangeFilter(dateRange);

  return useQuery({
    queryKey: ["event-groups", siteId, dateRange],
    queryFn: async (): Promise<EventGroup[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("event_name, created_at")
        .eq("site_id", siteId)
        .neq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by event name
      const groups = new Map<string, { count: number; lastOccurrence: string }>();
      
      data?.forEach(event => {
        const existing = groups.get(event.event_name);
        if (existing) {
          existing.count++;
        } else {
          groups.set(event.event_name, {
            count: 1,
            lastOccurrence: event.created_at,
          });
        }
      });

      return Array.from(groups.entries())
        .map(([name, data]) => ({
          name,
          count: data.count,
          lastOccurrence: data.lastOccurrence,
        }))
        .sort((a, b) => b.count - a.count);
    },
    enabled: !!siteId,
  });
}
