import { Link } from "react-router-dom";
import { BarChart3, Github, Twitter, Mail, ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "GitHub", href: "https://github.com/yourusername/metric", external: true },
  ],
  community: [
    { label: "Contributing", href: "https://github.com/yourusername/metric/blob/main/CONTRIBUTING.md", external: true },
    { label: "Discussions", href: "https://github.com/yourusername/metric/discussions", external: true },
    { label: "Issues", href: "https://github.com/yourusername/metric/issues", external: true },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "MIT License", href: "https://github.com/yourusername/metric/blob/main/LICENSE", external: true },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-base-200 border-t border-base-300">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base-300/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                <BarChart3 className="h-5 w-5 text-primary-content" />
              </div>
              <span className="font-display text-2xl font-bold">Metric</span>
            </Link>
            
            <p className="mt-6 text-base-content/60 max-w-sm leading-relaxed">
              Privacy-first analytics that respects your users. No cookies, no tracking across sites, just the insights you need.
            </p>
            
            {/* Social Links */}
            <div className="mt-8 flex items-center gap-3">
              <a 
                href="#" 
                className="btn btn-circle btn-sm bg-base-300/50 border-0 hover:bg-primary hover:text-primary-content transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="btn btn-circle btn-sm bg-base-300/50 border-0 hover:bg-primary hover:text-primary-content transition-all duration-300"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="btn btn-circle btn-sm bg-base-300/50 border-0 hover:bg-primary hover:text-primary-content transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-base-content/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-base-content/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                      {link.external && (
                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-4">
                Community
              </h3>
              <ul className="space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-base-content/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                      {link.external && (
                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-base-content/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                      {link.external && (
                        <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-base-300/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-base-content/50">
            © {currentYear} Metric Analytics. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-base-content/50">
            <span>Built for</span>
            <span className="text-primary font-medium">privacy</span>
            <span>·</span>
            <span>Loved by</span>
            <span className="text-primary font-medium">developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
