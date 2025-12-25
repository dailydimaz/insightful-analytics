import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "./useAnalytics";

export interface Goal {
  id: string;
  site_id: string;
  name: string;
  event_name: string;
  url_match: string | null;
  match_type: "exact" | "contains" | "starts_with" | "regex";
  created_at: string;
  updated_at: string;
}

export interface GoalStats {
  goal: Goal;
  conversions: number;
  conversionRate: number;
}

interface GoalsParams {
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

export function useGoals(siteId: string) {
  return useQuery({
    queryKey: ["goals", siteId],
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!siteId,
  });
}

export function useGoalStats({ siteId, dateRange }: GoalsParams) {
  const { start, end } = getDateRangeFilter(dateRange);

  return useQuery({
    queryKey: ["goal-stats", siteId, dateRange],
    queryFn: async (): Promise<GoalStats[]> => {
      // Get goals
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("site_id", siteId);

      if (goalsError) throw goalsError;

      if (!goals || goals.length === 0) return [];

      // Get unique visitors for conversion rate
      const { data: visitorData, error: visitorError } = await supabase
        .from("events")
        .select("visitor_id")
        .eq("site_id", siteId)
        .eq("event_name", "pageview")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (visitorError) throw visitorError;

      const totalVisitors = new Set(visitorData?.map(e => e.visitor_id)).size;

      // Get events for matching
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("event_name, url, visitor_id")
        .eq("site_id", siteId)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (eventsError) throw eventsError;

      // Calculate conversions for each goal
      return (goals as Goal[]).map(goal => {
        let matchingEvents = events || [];

        // Filter by event name
        matchingEvents = matchingEvents.filter(e => e.event_name === goal.event_name);

        // Filter by URL match if specified
        if (goal.url_match) {
          matchingEvents = matchingEvents.filter(e => {
            if (!e.url) return false;
            switch (goal.match_type) {
              case "exact":
                return e.url === goal.url_match;
              case "contains":
                return e.url.includes(goal.url_match!);
              case "starts_with":
                return e.url.startsWith(goal.url_match!);
              case "regex":
                try {
                  return new RegExp(goal.url_match!).test(e.url);
                } catch {
                  return false;
                }
              default:
                return false;
            }
          });
        }

        // Count unique visitors who converted
        const convertedVisitors = new Set(matchingEvents.map(e => e.visitor_id));
        const conversions = convertedVisitors.size;
        const conversionRate = totalVisitors > 0 ? (conversions / totalVisitors) * 100 : 0;

        return {
          goal,
          conversions,
          conversionRate,
        };
      });
    },
    enabled: !!siteId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Omit<Goal, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("goals")
        .insert(goal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals", variables.site_id] });
      queryClient.invalidateQueries({ queryKey: ["goal-stats", variables.site_id] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, siteId }: { id: string; siteId: string }) => {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, siteId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals", variables.siteId] });
      queryClient.invalidateQueries({ queryKey: ["goal-stats", variables.siteId] });
    },
  });
}
