import { Check, Server, Infinity } from "lucide-react";
import { Link } from "react-router-dom";
import { isSelfHosted, PLANS, formatNumber } from "@/lib/billing";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Hobby",
    planKey: "free" as const,
    price: "Free",
    description: "Perfect for personal projects and small sites.",
    events: `Up to ${formatNumber(PLANS.free.eventsLimit)} events/mo`,
    features: [
      `${PLANS.free.sitesLimit} website`,
      "Core web analytics",
      `${PLANS.free.retentionDays}-day data retention`,
      "Email support"
    ],
    cta: "Start Free",
    highlighted: false
  },
  {
    name: "Pro",
    planKey: "pro" as const,
    price: "$19",
    period: "/month",
    description: "For growing businesses that need more insights.",
    events: `Up to ${formatNumber(PLANS.pro.eventsLimit)} events/mo`,
    features: [
      "Unlimited websites",
      "Custom event tracking",
      "Funnel analysis",
      "1-year data retention",
      "API access",
      "Priority support"
    ],
    cta: "Start Free Trial",
    highlighted: true
  },
  {
    name: "Business",
    planKey: "business" as const,
    price: "$79",
    period: "/month",
    description: "For teams that need advanced analytics.",
    events: `Up to ${formatNumber(PLANS.business.eventsLimit)} events/mo`,
    features: [
      "Everything in Pro",
      "Retention cohorts",
      "Team collaboration",
      "2-year data retention",
      "Custom dashboards",
      "Slack integration",
      "Dedicated support"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
];

export function Pricing() {
  const selfHosted = isSelfHosted();

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, usage-based pricing
          </h2>
          <p className="mt-4 text-lg text-base-content/70">
            Start free, scale as you grow. Only pay for what you use.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`card border ${
                tier.highlighted 
                  ? "border-primary bg-base-100 shadow-xl shadow-primary/10 scale-105 z-10" 
                  : "bg-base-100 border-base-300"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="badge badge-primary">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="card-body">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-sm text-base-content/70">{tier.description}</p>

                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-base-content/70">{tier.period}</span>
                  )}
                </div>

                <p className="text-sm font-medium text-primary">{tier.events}</p>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-actions mt-6">
                  <Link 
                    to="/auth?mode=signup"
                    className={`btn w-full ${tier.highlighted ? "btn-primary" : "btn-outline"}`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-base-content/70">
          Need more than 1M events? <a href="#" className="link link-primary">Contact us</a> for custom pricing.
        </p>

        {/* Self-hosted option */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="card border border-base-300 bg-base-100/50">
            <div className="card-body flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Self-Hosted
                    <Badge variant="outline" className="text-xs">Open Source</Badge>
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Deploy on your own infrastructure with unlimited everything
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary">
                    <Infinity className="w-4 h-4" />
                    <span className="font-semibold">Free forever</span>
                  </div>
                </div>
                <a 
                  href="https://github.com/user/metric" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        {selfHosted && (
          <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
            <p className="text-center text-sm text-primary">
              <strong>You're currently running in self-hosted mode</strong> — all features are unlocked with no limits.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
