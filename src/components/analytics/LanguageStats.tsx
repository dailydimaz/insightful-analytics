import { Languages } from "lucide-react";
import { LanguageStat } from "@/hooks/useAnalytics";

interface LanguageStatsProps {
  languages: LanguageStat[] | undefined;
  isLoading: boolean;
}

// Language code to name mapping
const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  cs: "Czech",
  el: "Greek",
  he: "Hebrew",
  hu: "Hungarian",
  ro: "Romanian",
  uk: "Ukrainian",
  bg: "Bulgarian",
  sk: "Slovak",
  hr: "Croatian",
  ca: "Catalan",
  ms: "Malay",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu",
  fa: "Persian",
  sw: "Swahili",
  tl: "Filipino",
};

function getLanguageName(code: string): string {
  return languageNames[code.toLowerCase()] || code.toUpperCase();
}

export function LanguageStats({ languages, isLoading }: LanguageStatsProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-base-content/70" />
          <h3 className="card-title text-sm font-medium">Languages</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-4 w-24"></div>
                </div>
                <div className="skeleton h-4 w-12"></div>
              </div>
            ))}
          </div>
        ) : languages && languages.length > 0 ? (
          <div className="space-y-2 mt-4">
            {languages.map((lang, index) => (
              <div key={index} className="relative">
                <div 
                  className="absolute inset-0 bg-accent/10 rounded"
                  style={{ width: `${lang.percentage}%` }}
                />
                <div className="relative flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-base-300 px-1.5 py-0.5 rounded uppercase">
                      {lang.language}
                    </span>
                    <span className="text-sm">{getLanguageName(lang.language)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{lang.visits}</span>
                    <span className="text-xs text-base-content/60 w-12 text-right">
                      {lang.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
            <Languages className="h-8 w-8 mb-2" />
            <p>No language data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
