import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "@/hooks/useAnalytics";

export interface CohortData {
  cohort_date: string;
  cohort_size: number;
  retention: {
    day: number;
    retained: number;
    rate: number;
  }[];
}

export interface RetentionSummary {
  day: number;
  average_rate: number;
}

const getDateRangeFilter = (dateRange: DateRange) => {
  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate: now };
};

export function useRetentionCohorts(siteId: string | undefined, dateRange: DateRange = "30d") {
  return useQuery({
    queryKey: ["retention-cohorts", siteId, dateRange],
    queryFn: async () => {
      if (!siteId) return null;

      const { startDate, endDate } = getDateRangeFilter(dateRange);
      const retentionDays = [1, 3, 7, 14, 30];

      // Get all events for the site within the date range
      const { data: events, error } = await supabase
        .from("events")
        .select("visitor_id, created_at")
        .eq("site_id", siteId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!events || events.length === 0) return { cohorts: [], summary: [] };

      // Group events by visitor with their first visit date
      const visitorFirstVisit = new Map<string, Date>();
      const visitorVisitDates = new Map<string, Set<string>>();

      events.forEach(event => {
        if (!event.visitor_id) return;
        
        const eventDate = new Date(event.created_at);
        const dateStr = eventDate.toISOString().split('T')[0];

        if (!visitorFirstVisit.has(event.visitor_id)) {
          visitorFirstVisit.set(event.visitor_id, eventDate);
        }

        if (!visitorVisitDates.has(event.visitor_id)) {
          visitorVisitDates.set(event.visitor_id, new Set());
        }
        visitorVisitDates.get(event.visitor_id)!.add(dateStr);
      });

      // Group visitors by cohort (first visit date)
      const cohortVisitors = new Map<string, string[]>();
      
      visitorFirstVisit.forEach((firstVisit, visitorId) => {
        const cohortDate = firstVisit.toISOString().split('T')[0];
        if (!cohortVisitors.has(cohortDate)) {
          cohortVisitors.set(cohortDate, []);
        }
        cohortVisitors.get(cohortDate)!.push(visitorId);
      });

      // Calculate retention for each cohort
      const cohorts: CohortData[] = [];
      const sortedCohortDates = Array.from(cohortVisitors.keys()).sort();

      sortedCohortDates.forEach(cohortDate => {
        const visitors = cohortVisitors.get(cohortDate)!;
        const cohortSize = visitors.length;
        const cohortDateObj = new Date(cohortDate);

        const retention = retentionDays.map(day => {
          const targetDate = new Date(cohortDateObj);
          targetDate.setDate(targetDate.getDate() + day);
          const targetDateStr = targetDate.toISOString().split('T')[0];

          // Don't calculate retention for future dates
          if (targetDate > endDate) {
            return { day, retained: 0, rate: -1 }; // -1 indicates N/A
          }

          let retained = 0;
          visitors.forEach(visitorId => {
            const visitDates = visitorVisitDates.get(visitorId);
            if (visitDates?.has(targetDateStr)) {
              retained++;
            }
          });

          return {
            day,
            retained,
            rate: cohortSize > 0 ? Math.round((retained / cohortSize) * 100) : 0,
          };
        });

        cohorts.push({
          cohort_date: cohortDate,
          cohort_size: cohortSize,
          retention,
        });
      });

      // Calculate average retention rates
      const summary: RetentionSummary[] = retentionDays.map(day => {
        const validRates = cohorts
          .map(c => c.retention.find(r => r.day === day)?.rate || 0)
          .filter(r => r >= 0);
        
        const average = validRates.length > 0
          ? Math.round(validRates.reduce((a, b) => a + b, 0) / validRates.length)
          : 0;

        return { day, average_rate: average };
      });

      return { cohorts, summary };
    },
    enabled: !!siteId,
  });
}

export function useRetentionTrend(siteId: string | undefined, dateRange: DateRange = "30d") {
  return useQuery({
    queryKey: ["retention-trend", siteId, dateRange],
    queryFn: async () => {
      if (!siteId) return null;

      const { startDate, endDate } = getDateRangeFilter(dateRange);

      // Get all events
      const { data: events, error } = await supabase
        .from("events")
        .select("visitor_id, created_at")
        .eq("site_id", siteId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!events || events.length === 0) return [];

      // Calculate daily retention curve
      const visitorFirstVisit = new Map<string, Date>();
      const visitorVisitDays = new Map<string, Set<number>>();

      events.forEach(event => {
        if (!event.visitor_id) return;
        
        const eventDate = new Date(event.created_at);

        if (!visitorFirstVisit.has(event.visitor_id)) {
          visitorFirstVisit.set(event.visitor_id, eventDate);
          visitorVisitDays.set(event.visitor_id, new Set([0]));
        } else {
          const firstVisit = visitorFirstVisit.get(event.visitor_id)!;
          const daysSinceFirst = Math.floor(
            (eventDate.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24)
          );
          visitorVisitDays.get(event.visitor_id)!.add(daysSinceFirst);
        }
      });

      // Calculate retention for each day
      const maxDay = 30;
      const totalVisitors = visitorFirstVisit.size;
      const retentionCurve = [];

      for (let day = 0; day <= maxDay; day++) {
        let retained = 0;
        visitorVisitDays.forEach(days => {
          if (days.has(day)) retained++;
        });

        retentionCurve.push({
          day,
          retained,
          rate: totalVisitors > 0 ? Math.round((retained / totalVisitors) * 100) : 0,
        });
      }

      return retentionCurve;
    },
    enabled: !!siteId,
  });
}
