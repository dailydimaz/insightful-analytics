import { useState } from "react";
import { MapPin, Building2 } from "lucide-react";
import { GeoStat, CityStat } from "@/hooks/useAnalytics";

interface GeoStatsProps {
  countries: GeoStat[] | undefined;
  cities: CityStat[] | undefined;
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

export function GeoStats({ countries, cities, isLoading }: GeoStatsProps) {
  const [activeTab, setActiveTab] = useState<"countries" | "cities">("countries");

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-base-content/70" />
            <h3 className="card-title text-sm font-medium">Locations</h3>
          </div>
          <div className="tabs tabs-boxed tabs-sm">
            <button 
              className={`tab ${activeTab === "countries" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("countries")}
            >
              Countries
            </button>
            <button 
              className={`tab ${activeTab === "cities" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("cities")}
            >
              Cities
            </button>
          </div>
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
        ) : activeTab === "countries" ? (
          countries && countries.length > 0 ? (
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
              <p>No country data yet</p>
            </div>
          )
        ) : (
          cities && cities.length > 0 ? (
            <div className="space-y-2 mt-4">
              {cities.map((city, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute inset-0 bg-secondary/10 rounded"
                    style={{ width: `${city.percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-base-content/70" />
                      <span className="text-sm">{city.city}</span>
                      <span className="text-xs text-base-content/50">
                        {getCountryFlag(city.country)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{city.visits}</span>
                      <span className="text-xs text-base-content/60 w-12 text-right">
                        {city.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
              <Building2 className="h-8 w-8 mb-2" />
              <p>No city data yet</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
