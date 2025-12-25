import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { RetentionMatrix } from "@/components/analytics/RetentionMatrix";
import { RetentionChart } from "@/components/analytics/RetentionChart";
import { useRetentionCohorts, useRetentionTrend } from "@/hooks/useRetention";
import { useSites } from "@/hooks/useSites";
import { ArrowLeft, Users, TrendingUp, Calendar } from "lucide-react";
import { DateRange } from "@/hooks/useAnalytics";

export default function Retention() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteIdParam = searchParams.get("siteId");
  
  const { sites } = useSites();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // Get the first available site if no siteId provided
  const siteId = siteIdParam || sites[0]?.id;
  const site = sites.find(s => s.id === siteId);

  const { data: cohortData, isLoading: cohortsLoading } = useRetentionCohorts(siteId, dateRange);
  const { data: trendData, isLoading: trendLoading } = useRetentionTrend(siteId, dateRange);

  if (!siteId || !site) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No site selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a site to view retention analytics.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate summary stats
  const avgDay1 = cohortData?.summary?.find(s => s.day === 1)?.average_rate || 0;
  const avgDay7 = cohortData?.summary?.find(s => s.day === 7)?.average_rate || 0;
  const avgDay30 = cohortData?.summary?.find(s => s.day === 30)?.average_rate || 0;
  const totalCohorts = cohortData?.cohorts?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/dashboard/sites/${siteId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Retention Cohorts</h1>
              <p className="text-muted-foreground">{site.name}</p>
            </div>
          </div>

          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Day 1 Retention</p>
                  <p className="text-2xl font-bold">{avgDay1}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Day 7 Retention</p>
                  <p className="text-2xl font-bold">{avgDay7}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Day 30 Retention</p>
                  <p className="text-2xl font-bold">{avgDay30}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cohorts</p>
                  <p className="text-2xl font-bold">{totalCohorts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retention Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Retention Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <RetentionChart data={trendData || undefined} isLoading={trendLoading} />
          </CardContent>
        </Card>

        {/* Cohort Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Cohort Retention Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <RetentionMatrix
              cohorts={cohortData?.cohorts}
              summary={cohortData?.summary}
              isLoading={cohortsLoading}
            />
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">How to read this data</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Each row represents a cohort of users who first visited on that date</li>
              <li>• Columns show what percentage of that cohort returned on Day 1, 3, 7, 14, and 30</li>
              <li>• Darker colors indicate higher retention rates</li>
              <li>• The average row shows overall retention performance across all cohorts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
