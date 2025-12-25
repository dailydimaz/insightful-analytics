import { Eye, Users, Clock, MousePointerClick, TrendingUp, TrendingDown } from "lucide-react";
import { StatsData } from "@/hooks/useAnalytics";

interface StatsCardsProps {
  stats: StatsData | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatCard({ title, value, change, icon, isLoading }: StatCardProps) {
  const isPositive = change && change >= 0;
  
  return (
    <div className="card bg-base-200">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-base-content/70">{title}</span>
          <span className="text-base-content/50">{icon}</span>
        </div>
        {isLoading ? (
          <div className="skeleton h-8 w-24 mt-2"></div>
        ) : (
          <div className="mt-2">
            <span className="text-2xl font-bold">{value}</span>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${isPositive ? 'text-success' : 'text-error'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Pageviews"
        value={formatNumber(stats?.totalPageviews || 0)}
        change={stats?.pageviewsChange}
        icon={<Eye className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Unique Visitors"
        value={formatNumber(stats?.uniqueVisitors || 0)}
        change={stats?.visitorsChange}
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Bounce Rate"
        value={`${(stats?.bounceRate || 0).toFixed(1)}%`}
        icon={<MousePointerClick className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Avg. Session"
        value={stats?.avgSessionDuration ? `${Math.round(stats.avgSessionDuration)}s` : "—"}
        icon={<Clock className="h-4 w-4" />}
        isLoading={isLoading}
      />
    </div>
  );
}
