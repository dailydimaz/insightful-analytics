import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TimeSeriesData } from "@/hooks/useAnalytics";
import { format, parseISO } from "date-fns";

interface VisitorChartProps {
  data: TimeSeriesData[] | undefined;
  isLoading: boolean;
}

export function VisitorChart({ data, isLoading }: VisitorChartProps) {
  if (isLoading) {
    return (
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-sm font-medium">Visitors Over Time</h3>
          <div className="skeleton h-64 w-full mt-4"></div>
        </div>
      </div>
    );
  }

  const chartData = data?.map(d => ({
    ...d,
    displayDate: format(parseISO(d.date), "MMM d"),
  })) || [];

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h3 className="card-title text-sm font-medium">Visitors Over Time</h3>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="pageviews"
                name="Pageviews"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorPageviews)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Visitors"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorVisitors)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
