import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { DateRange } from "@/hooks/useAnalytics";

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

interface ExportData {
  id: string;
  event_name: string;
  url: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  created_at: string;
  visitor_id: string | null;
  session_id: string | null;
}

export async function fetchExportData(
  siteId: string,
  dateRange: DateRange
): Promise<ExportData[]> {
  const { start, end } = getDateRangeFilter(dateRange);

  const { data, error } = await supabase
    .from("events")
    .select("id, event_name, url, referrer, country, city, browser, os, device_type, created_at, visitor_id, session_id")
    .eq("site_id", siteId)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export function exportToCSV(data: ExportData[], filename: string): void {
  const headers = [
    "Date",
    "Time",
    "Event",
    "URL",
    "Referrer",
    "Country",
    "City",
    "Browser",
    "OS",
    "Device",
    "Visitor ID",
    "Session ID",
  ];

  const rows = data.map(event => {
    const date = new Date(event.created_at);
    return [
      format(date, "yyyy-MM-dd"),
      format(date, "HH:mm:ss"),
      event.event_name,
      event.url || "",
      event.referrer || "",
      event.country || "",
      event.city || "",
      event.browser || "",
      event.os || "",
      event.device_type || "",
      event.visitor_id || "",
      event.session_id || "",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportToJSON(data: ExportData[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, "application/json");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
