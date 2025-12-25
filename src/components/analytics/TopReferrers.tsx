import { Link2 } from "lucide-react";
import { TopReferrer } from "@/hooks/useAnalytics";

interface TopReferrersProps {
  referrers: TopReferrer[] | undefined;
  isLoading: boolean;
}

export function TopReferrers({ referrers, isLoading }: TopReferrersProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-base-content/70" />
          <h3 className="card-title text-sm font-medium">Top Referrers</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="skeleton h-4 w-32"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
            ))}
          </div>
        ) : referrers && referrers.length > 0 ? (
          <div className="space-y-3 mt-4">
            {referrers.map((ref, index) => (
              <div key={index} className="relative">
                <div 
                  className="absolute inset-0 bg-primary/10 rounded"
                  style={{ width: `${ref.percentage}%` }}
                />
                <div className="relative flex items-center justify-between py-2 px-3">
                  <span className="text-sm truncate max-w-[150px]" title={ref.referrer}>
                    {ref.referrer}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{ref.visits}</span>
                    <span className="text-xs text-base-content/60 w-12 text-right">
                      {ref.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
            <Link2 className="h-8 w-8 mb-2" />
            <p>No referrer data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
