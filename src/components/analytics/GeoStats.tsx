import { MapPin } from "lucide-react";
import { GeoStat } from "@/hooks/useAnalytics";

interface GeoStatsProps {
  countries: GeoStat[] | undefined;
  isLoading: boolean;
}

// Country code to flag emoji
function getCountryFlag(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return "🌍";
  const offset = 127397;
  return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + offset));
}

// Country code to name (basic mapping)
const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  AU: "Australia",
  JP: "Japan",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  KR: "South Korea",
  RU: "Russia",
  MX: "Mexico",
  ID: "Indonesia",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  AT: "Austria",
  CH: "Switzerland",
  BE: "Belgium",
  PT: "Portugal",
  IE: "Ireland",
  NZ: "New Zealand",
  SG: "Singapore",
  HK: "Hong Kong",
};

function getCountryName(code: string): string {
  return countryNames[code.toUpperCase()] || code;
}

export function GeoStats({ countries, isLoading }: GeoStatsProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-base-content/70" />
          <h3 className="card-title text-sm font-medium">Top Countries</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-5 w-5 rounded"></div>
                  <div className="skeleton h-4 w-24"></div>
                </div>
                <div className="skeleton h-4 w-12"></div>
              </div>
            ))}
          </div>
        ) : countries && countries.length > 0 ? (
          <div className="space-y-2 mt-4">
            {countries.map((country, index) => (
              <div key={index} className="relative">
                <div 
                  className="absolute inset-0 bg-primary/10 rounded"
                  style={{ width: `${country.percentage}%` }}
                />
                <div className="relative flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCountryFlag(country.country)}</span>
                    <span className="text-sm">{getCountryName(country.country)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{country.visits}</span>
                    <span className="text-xs text-base-content/60 w-12 text-right">
                      {country.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
            <MapPin className="h-8 w-8 mb-2" />
            <p>No location data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
