import { Link } from "react-router-dom";
import {
  Check,
  Clock,
  BarChart3,
  Users,
  TrendingDown,
  Globe,
  Smartphone,
  Languages,
  Filter,
  Zap,
  UserPlus,
  MousePointer,
  Database,
  Target,
  Share2,
  Lightbulb,
  Layers,
  Link2,
  Image,
  GitCompare,
  Workflow,
  DollarSign,
  Route,
  Magnet,
  Shield,
  Cookie,
  HardDrive,
  Cloud,
  Gauge,
  Upload,
  Download,
  Mail,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  icon: typeof Check;
  implemented: boolean;
  difficulty: "easy" | "medium" | "hard";
  category: "analytics" | "insights" | "privacy" | "cloud";
}

const features: Feature[] = [
  // IMPLEMENTED - Easy
  {
    name: "Page Views",
    description: "Track which pages get the most traffic",
    icon: BarChart3,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Visitors",
    description: "Get detailed visitor information like device, browser, OS",
    icon: Users,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Bounce Rate",
    description: "See which pages keep visitors engaged",
    icon: TrendingDown,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Traffic Sources",
    description: "See where your traffic comes from",
    icon: Globe,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Location",
    description: "Country, city, and region breakdowns",
    icon: Globe,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Devices",
    description: "Popular devices used by visitors",
    icon: Smartphone,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Languages",
    description: "Most popular languages among visitors",
    icon: Languages,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Realtime Data",
    description: "Data available in seconds, not days",
    icon: Zap,
    implemented: true,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "No Cookies",
    description: "No cookie banner required",
    icon: Cookie,
    implemented: true,
    difficulty: "easy",
    category: "privacy",
  },
  {
    name: "GDPR & CCPA",
    description: "Fully compliant with privacy laws",
    icon: Shield,
    implemented: true,
    difficulty: "easy",
    category: "privacy",
  },

  // IMPLEMENTED - Medium
  {
    name: "Custom Events",
    description: "Track signups, checkouts, and more",
    icon: MousePointer,
    implemented: true,
    difficulty: "medium",
    category: "analytics",
  },
  {
    name: "UTM Tracking",
    description: "Measure campaign effectiveness",
    icon: Target,
    implemented: true,
    difficulty: "medium",
    category: "analytics",
  },
  {
    name: "Teams",
    description: "Share website access with team members",
    icon: UserPlus,
    implemented: true,
    difficulty: "medium",
    category: "analytics",
  },
  {
    name: "Data Export",
    description: "Export all your analytics data",
    icon: Download,
    implemented: true,
    difficulty: "medium",
    category: "cloud",
  },

  // IMPLEMENTED - Hard
  {
    name: "Funnels",
    description: "Understand conversion and drop-off rates",
    icon: Workflow,
    implemented: true,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Retention",
    description: "Track how often users return",
    icon: TrendingDown,
    implemented: true,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Goals",
    description: "Track goals for pageviews and events",
    icon: Target,
    implemented: true,
    difficulty: "hard",
    category: "insights",
  },

  // NOT IMPLEMENTED - Easy
  {
    name: "Filtering",
    description: "Apply filters like country, browser, URL",
    icon: Filter,
    implemented: false,
    difficulty: "easy",
    category: "analytics",
  },
  {
    name: "Data Anonymization",
    description: "All visitor data anonymized",
    icon: Shield,
    implemented: false,
    difficulty: "easy",
    category: "privacy",
  },

  // NOT IMPLEMENTED - Medium
  {
    name: "Sharing",
    description: "Share stats via secure unique URL",
    icon: Share2,
    implemented: false,
    difficulty: "medium",
    category: "analytics",
  },
  {
    name: "Segments",
    description: "Save commonly used filters",
    icon: Layers,
    implemented: false,
    difficulty: "medium",
    category: "insights",
  },
  {
    name: "Compare",
    description: "Compare metrics against previous periods",
    icon: GitCompare,
    implemented: false,
    difficulty: "medium",
    category: "insights",
  },
  {
    name: "Links",
    description: "Monitor clicks on specific URLs",
    icon: Link2,
    implemented: false,
    difficulty: "medium",
    category: "analytics",
  },
  {
    name: "Pixels",
    description: "Embed tracking pixels anywhere",
    icon: Image,
    implemented: false,
    difficulty: "medium",
    category: "analytics",
  },
  {
    name: "Data Import",
    description: "Import existing analytics data",
    icon: Upload,
    implemented: false,
    difficulty: "medium",
    category: "cloud",
  },

  // NOT IMPLEMENTED - Hard
  {
    name: "Insights",
    description: "Build custom insights for specific sites",
    icon: Lightbulb,
    implemented: false,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Cohorts",
    description: "Group users based on specific actions",
    icon: Users,
    implemented: false,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Breakdown",
    description: "Dive deeper with segments and filters",
    icon: Database,
    implemented: false,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Journey",
    description: "Visualize how users navigate your site",
    icon: Route,
    implemented: false,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Revenue",
    description: "Track ecommerce and spending data",
    icon: DollarSign,
    implemented: false,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Attribution",
    description: "See what drives conversions",
    icon: Magnet,
    implemented: false,
    difficulty: "hard",
    category: "insights",
  },
  {
    name: "Email Reports",
    description: "Send scheduled email summaries",
    icon: Mail,
    implemented: false,
    difficulty: "hard",
    category: "cloud",
  },
  {
    name: "High Performance",
    description: "Optimized for billions of records",
    icon: Gauge,
    implemented: false,
    difficulty: "hard",
    category: "cloud",
  },
];

// Sort: implemented first, then by difficulty (easy -> medium -> hard)
const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
const sortedFeatures = [...features].sort((a, b) => {
  if (a.implemented !== b.implemented) return a.implemented ? -1 : 1;
  return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
});

const categoryColors = {
  analytics: "from-primary/20 to-primary/5 border-primary/20",
  insights: "from-secondary/20 to-secondary/5 border-secondary/20",
  privacy: "from-success/20 to-success/5 border-success/20",
  cloud: "from-info/20 to-info/5 border-info/20",
};

const categoryLabels = {
  analytics: "Analytics",
  insights: "Insights",
  privacy: "Privacy",
  cloud: "Cloud",
};

const difficultyBadge = {
  easy: "badge-success",
  medium: "badge-warning",
  hard: "badge-error",
};

export default function Roadmap() {
  const implementedCount = features.filter((f) => f.implemented).length;
  const totalCount = features.length;
  const progress = Math.round((implementedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-content" />
              </div>
              <span className="font-display text-xl font-bold">Metric</span>
            </Link>
            <Link to="/" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Feature Roadmap
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Building the Future of
            <span className="text-primary"> Privacy Analytics</span>
          </h1>
          <p className="text-lg text-base-content/70 mb-8">
            We're building a comprehensive analytics platform. Here's our progress and what's coming next.
          </p>

          {/* Progress Bar */}
          <div className="bg-base-200 rounded-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold text-primary">
                {implementedCount}/{totalCount} features
              </span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-base-content/50 mt-2">{progress}% complete</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Easy</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span>Hard</span>
          </div>
          <div className="divider divider-horizontal"></div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-success" />
            <span>Implemented</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-base-content/50" />
            <span>Planned</span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className={`
                  relative group rounded-2xl border p-5 transition-all duration-300
                  bg-gradient-to-br ${categoryColors[feature.category]}
                  ${
                    feature.implemented
                      ? "opacity-100 hover:scale-[1.02] hover:shadow-lg"
                      : "opacity-70 hover:opacity-90"
                  }
                `}
              >
                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  {feature.implemented ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-content">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-base-300 text-base-content/50">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`
                  flex h-10 w-10 items-center justify-center rounded-xl mb-3
                  ${feature.implemented ? "bg-primary/20 text-primary" : "bg-base-300 text-base-content/50"}
                `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <h3 className="font-semibold mb-1">{feature.name}</h3>
                <p className="text-sm text-base-content/60 mb-3 line-clamp-2">{feature.description}</p>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge badge-sm ${difficultyBadge[feature.difficulty]}`}>{feature.difficulty}</span>
                  <span className="badge badge-sm badge-outline">{categoryLabels[feature.category]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const categoryFeatures = features.filter((f) => f.category === (key as keyof typeof categoryLabels));
            const implemented = categoryFeatures.filter((f) => f.implemented).length;
            return (
              <div key={key} className="bg-base-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {implemented}/{categoryFeatures.length}
                </div>
                <div className="text-sm text-base-content/60">{label}</div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Want to contribute?</h2>
          <p className="text-base-content/70 mb-6 max-w-lg mx-auto">
            Metric is open source. Help us build the best privacy-first analytics platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/dailydimaz/metric"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View on GitHub
            </a>
            <Link to="/auth" className="btn btn-outline">
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-base-300 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-base-content/50">
          © {new Date().getFullYear()} Metric Analytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
