import { useState } from "react";
import { Target, Radio, Megaphone } from "lucide-react";
import { UTMStats as UTMStatsType } from "@/hooks/useAnalytics";

interface UTMStatsProps {
  utmStats: UTMStatsType | undefined;
  isLoading: boolean;
}

type UTMTab = "sources" | "mediums" | "campaigns";

const tabConfig: Record<UTMTab, { label: string; icon: typeof Target; emptyText: string }> = {
  sources: { label: "Sources", icon: Radio, emptyText: "No source data yet" },
  mediums: { label: "Mediums", icon: Target, emptyText: "No medium data yet" },
  campaigns: { label: "Campaigns", icon: Megaphone, emptyText: "No campaign data yet" },
};

export function UTMStats({ utmStats, isLoading }: UTMStatsProps) {
  const [activeTab, setActiveTab] = useState<UTMTab>("sources");
  
  const currentData = utmStats?.[activeTab] || [];
  const { icon: Icon, emptyText } = tabConfig[activeTab];

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-base-content/70" />
            <h3 className="card-title text-sm font-medium">UTM Campaigns</h3>
          </div>
          <div className="tabs tabs-boxed tabs-sm">
            {(Object.keys(tabConfig) as UTMTab[]).map((tab) => (
              <button 
                key={tab}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tabConfig[tab].label}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="skeleton h-4 w-32"></div>
                <div className="skeleton h-4 w-12"></div>
              </div>
            ))}
          </div>
        ) : currentData.length > 0 ? (
          <div className="space-y-2 mt-4">
            {currentData.map((item, index) => (
              <div key={index} className="relative">
                <div 
                  className="absolute inset-0 bg-primary/10 rounded"
                  style={{ width: `${item.percentage}%` }}
                />
                <div className="relative flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-base-content/70" />
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.visits}</span>
                    <span className="text-xs text-base-content/60 w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
            <Icon className="h-8 w-8 mb-2" />
            <p>{emptyText}</p>
            <p className="text-xs mt-1">Add ?utm_source=... to your URLs</p>
          </div>
        )}
      </div>
    </div>
  );
}
