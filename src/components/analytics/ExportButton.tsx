import { useState } from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { DateRange } from "@/hooks/useAnalytics";
import { fetchExportData, exportToCSV, exportToJSON } from "@/utils/analyticsExport";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  siteId: string;
  siteName: string;
  dateRange: DateRange;
}

export function ExportButton({ siteId, siteName, dateRange }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    setDropdownOpen(false);

    try {
      const data = await fetchExportData(siteId, dateRange);
      
      if (data.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no events in the selected date range.",
          variant: "destructive",
        });
        return;
      }

      const filename = `${siteName.replace(/[^a-z0-9]/gi, "_")}_analytics_${dateRange}`;

      if (format === "csv") {
        exportToCSV(data, filename);
      } else {
        exportToJSON(data, filename);
      }

      toast({
        title: "Export complete",
        description: `Exported ${data.length} events to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <button 
        tabIndex={0}
        className="btn btn-ghost btn-sm"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={isExporting}
      >
        {isExporting ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
      </button>
      {dropdownOpen && (
        <ul 
          tabIndex={0} 
          className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300"
        >
          <li>
            <button onClick={() => handleExport("csv")} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </button>
          </li>
          <li>
            <button onClick={() => handleExport("json")} className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Export as JSON
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
