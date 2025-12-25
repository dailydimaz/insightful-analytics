import { Monitor, Smartphone, Tablet, Globe, Chrome } from "lucide-react";
import { DeviceStat } from "@/hooks/useAnalytics";

interface DeviceStatsProps {
  browsers: DeviceStat[] | undefined;
  operatingSystems: DeviceStat[] | undefined;
  devices: DeviceStat[] | undefined;
  isLoading: boolean;
}

function getDeviceIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

function StatList({ 
  title, 
  items, 
  icon, 
  isLoading 
}: { 
  title: string; 
  items: DeviceStat[] | undefined; 
  icon: React.ReactNode; 
  isLoading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base-content/70">{icon}</span>
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="skeleton h-3 w-20"></div>
              <div className="skeleton h-3 w-10"></div>
            </div>
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-2">
          {items.slice(0, 5).map((item, index) => (
            <div key={index} className="relative">
              <div 
                className="absolute inset-0 bg-primary/10 rounded"
                style={{ width: `${item.percentage}%` }}
              />
              <div className="relative flex items-center justify-between py-1.5 px-2">
                <span className="text-sm">{item.name}</span>
                <span className="text-xs text-base-content/60">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-base-content/50">No data</p>
      )}
    </div>
  );
}

export function DeviceStats({ browsers, operatingSystems, devices, isLoading }: DeviceStatsProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h3 className="card-title text-sm font-medium mb-4">Devices & Browsers</h3>
        
        <div className="grid gap-6 md:grid-cols-3">
          <StatList
            title="Device Type"
            items={devices}
            icon={<Monitor className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <StatList
            title="Browser"
            items={browsers}
            icon={<Chrome className="h-4 w-4" />}
            isLoading={isLoading}
          />
          <StatList
            title="Operating System"
            items={operatingSystems}
            icon={<Globe className="h-4 w-4" />}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
