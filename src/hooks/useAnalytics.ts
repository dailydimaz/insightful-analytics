import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export type DateRange = "today" | "7d" | "30d" | "90d";

interface AnalyticsParams {
  siteId: string;
  dateRange: DateRange;
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

export interface StatsData {
  totalPageviews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  pageviewsChange: number;
  visitorsChange: number;
}

export interface TimeSeriesData {
  date: string;
  pageviews: number;
  visitors: number;
}

export interface TopPage {
  url: string;
  pageviews: number;
  uniqueVisitors: number;
}

export interface TopReferrer {
  referrer: string;
  visits: number;
  percentage: number;
}

export interface DeviceStat {
  name: string;
  value: number;
  percentage: number;
}

export interface GeoStat {
  country: string;
  visits: number;
  percentage: number;
}

export interface CityStat {
  city: string;
  country: string;
  visits: number;
  percentage: number;
}

export interface LanguageStat {
  language: string;
  visits: number;
  percentage: number;
}

// Fetch overall stats
export function useAnalyticsStats({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-stats", siteId, dateRange],
    queryFn: async (): Promise<StatsData> => {
      // Get current period data
      const { data: events, error } = await supabase
        .from("events")
        .select("id, visitor_id, session_id, created_at")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) throw error;

      const totalPageviews = events?.length || 0;
      const uniqueVisitors = new Set(events?.map(e => e.visitor_id)).size;
      
      // Calculate sessions and bounce rate
      const sessions = new Map<string, number>();
      events?.forEach(e => {
        if (e.session_id) {
          sessions.set(e.session_id, (sessions.get(e.session_id) || 0) + 1);
        }
      });
      
      const singlePageSessions = Array.from(sessions.values()).filter(count => count === 1).length;
      const bounceRate = sessions.size > 0 ? (singlePageSessions / sessions.size) * 100 : 0;
      
      // Get previous period for comparison
      const periodLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const prevStart = subDays(start, periodLength);
      const prevEnd = subDays(end, periodLength);
      
      const { data: prevEvents } = await supabase
        .from("events")
        .select("id, visitor_id")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", prevStart.toISOString())
        .lte("created_at", prevEnd.toISOString());

      const prevPageviews = prevEvents?.length || 0;
      const prevVisitors = new Set(prevEvents?.map(e => e.visitor_id)).size;
      
      const pageviewsChange = prevPageviews > 0 
        ? ((totalPageviews - prevPageviews) / prevPageviews) * 100 
        : 0;
      const visitorsChange = prevVisitors > 0 
        ? ((uniqueVisitors - prevVisitors) / prevVisitors) * 100 
        : 0;

      return {
        totalPageviews,
        uniqueVisitors,
        avgSessionDuration: 0, // Would need session tracking
        bounceRate,
        pageviewsChange,
        visitorsChange,
      };
    },
    enabled: !!siteId,
  });
}

// Fetch time series data for charts
export function useAnalyticsTimeSeries({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-timeseries", siteId, dateRange],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("created_at, visitor_id")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const byDate = new Map<string, { pageviews: number; visitors: Set<string> }>();
      
      events?.forEach(event => {
        const date = format(new Date(event.created_at), "yyyy-MM-dd");
        if (!byDate.has(date)) {
          byDate.set(date, { pageviews: 0, visitors: new Set() });
        }
        const dayData = byDate.get(date)!;
        dayData.pageviews++;
        if (event.visitor_id) dayData.visitors.add(event.visitor_id);
      });

      // Fill in missing dates
      const result: TimeSeriesData[] = [];
      const current = new Date(start);
      while (current <= end) {
        const dateStr = format(current, "yyyy-MM-dd");
        const dayData = byDate.get(dateStr);
        result.push({
          date: dateStr,
          pageviews: dayData?.pageviews || 0,
          visitors: dayData?.visitors.size || 0,
        });
        current.setDate(current.getDate() + 1);
      }

      return result;
    },
    enabled: !!siteId,
  });
}

// Fetch top pages
export function useTopPages({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-pages", siteId, dateRange],
    queryFn: async (): Promise<TopPage[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("url, visitor_id")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) throw error;

      // Group by URL
      const byUrl = new Map<string, { pageviews: number; visitors: Set<string> }>();
      
      events?.forEach(event => {
        const url = event.url || "/";
        if (!byUrl.has(url)) {
          byUrl.set(url, { pageviews: 0, visitors: new Set() });
        }
        const urlData = byUrl.get(url)!;
        urlData.pageviews++;
        if (event.visitor_id) urlData.visitors.add(event.visitor_id);
      });

      return Array.from(byUrl.entries())
        .map(([url, data]) => ({
          url,
          pageviews: data.pageviews,
          uniqueVisitors: data.visitors.size,
        }))
        .sort((a, b) => b.pageviews - a.pageviews)
        .slice(0, 10);
    },
    enabled: !!siteId,
  });
}

// Fetch top referrers
export function useTopReferrers({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-referrers", siteId, dateRange],
    queryFn: async (): Promise<TopReferrer[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("referrer")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .not("referrer", "is", null);

      if (error) throw error;

      // Group by referrer
      const byReferrer = new Map<string, number>();
      let totalWithReferrer = 0;
      
      events?.forEach(event => {
        if (event.referrer) {
          try {
            const url = new URL(event.referrer);
            const domain = url.hostname;
            byReferrer.set(domain, (byReferrer.get(domain) || 0) + 1);
            totalWithReferrer++;
          } catch {
            // Invalid URL, skip
          }
        }
      });

      return Array.from(byReferrer.entries())
        .map(([referrer, visits]) => ({
          referrer,
          visits,
          percentage: totalWithReferrer > 0 ? (visits / totalWithReferrer) * 100 : 0,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    },
    enabled: !!siteId,
  });
}

// Fetch device stats
export function useDeviceStats({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-devices", siteId, dateRange],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("events")
        .select("browser, os, device_type")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) throw error;

      const total = events?.length || 0;
      
      // Group by each category
      const browsers = new Map<string, number>();
      const operatingSystems = new Map<string, number>();
      const devices = new Map<string, number>();
      
      events?.forEach(event => {
        if (event.browser) browsers.set(event.browser, (browsers.get(event.browser) || 0) + 1);
        if (event.os) operatingSystems.set(event.os, (operatingSystems.get(event.os) || 0) + 1);
        if (event.device_type) devices.set(event.device_type, (devices.get(event.device_type) || 0) + 1);
      });

      const toStats = (map: Map<string, number>): DeviceStat[] => 
        Array.from(map.entries())
          .map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? (value / total) * 100 : 0,
          }))
          .sort((a, b) => b.value - a.value);

      return {
        browsers: toStats(browsers),
        operatingSystems: toStats(operatingSystems),
        devices: toStats(devices),
      };
    },
    enabled: !!siteId,
  });
}

// Fetch geo stats (countries)
export function useGeoStats({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-geo", siteId, dateRange],
    queryFn: async (): Promise<GeoStat[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("country")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .not("country", "is", null);

      if (error) throw error;

      const total = events?.length || 0;
      const byCountry = new Map<string, number>();
      
      events?.forEach(event => {
        if (event.country) {
          byCountry.set(event.country, (byCountry.get(event.country) || 0) + 1);
        }
      });

      return Array.from(byCountry.entries())
        .map(([country, visits]) => ({
          country,
          visits,
          percentage: total > 0 ? (visits / total) * 100 : 0,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    },
    enabled: !!siteId,
  });
}

// Fetch city stats
export function useCityStats({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-cities", siteId, dateRange],
    queryFn: async (): Promise<CityStat[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("city, country")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .not("city", "is", null);

      if (error) throw error;

      const total = events?.length || 0;
      const byCity = new Map<string, { country: string; visits: number }>();
      
      events?.forEach(event => {
        if (event.city) {
          const key = `${event.city}|${event.country || 'Unknown'}`;
          const existing = byCity.get(key);
          if (existing) {
            existing.visits++;
          } else {
            byCity.set(key, { country: event.country || 'Unknown', visits: 1 });
          }
        }
      });

      return Array.from(byCity.entries())
        .map(([key, data]) => ({
          city: key.split('|')[0],
          country: data.country,
          visits: data.visits,
          percentage: total > 0 ? (data.visits / total) * 100 : 0,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    },
    enabled: !!siteId,
  });
}

// Fetch language stats
export function useLanguageStats({ siteId, dateRange }: AnalyticsParams) {
  const { start, end } = getDateRangeFilter(dateRange);
  
  return useQuery({
    queryKey: ["analytics-languages", siteId, dateRange],
    queryFn: async (): Promise<LanguageStat[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("language")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .not("language", "is", null);

      if (error) throw error;

      const total = events?.length || 0;
      const byLanguage = new Map<string, number>();
      
      events?.forEach(event => {
        if (event.language) {
          byLanguage.set(event.language, (byLanguage.get(event.language) || 0) + 1);
        }
      });

      return Array.from(byLanguage.entries())
        .map(([language, visits]) => ({
          language,
          visits,
          percentage: total > 0 ? (visits / total) * 100 : 0,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    },
    enabled: !!siteId,
  });
}
