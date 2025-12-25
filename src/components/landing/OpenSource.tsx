import { Github, Heart, Users, Star } from "lucide-react";

export function OpenSource() {
  return (
    <section className="py-24 bg-base-200/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-300/50 text-sm font-medium mb-8">
            <Heart className="h-4 w-4 text-error" />
            <span>Open Source</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Powered by{" "}
            <span className="text-primary">open source</span>
          </h2>
          
          <p className="mt-6 text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Metric is proudly open source and MIT licensed. Thousands of developers 
            worldwide can share and contribute to make analytics better for everyone.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body items-center py-6">
                <Github className="h-6 w-6 text-primary mb-2" />
                <span className="text-2xl font-bold">100%</span>
                <span className="text-sm text-base-content/70">Open Source</span>
              </div>
            </div>
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body items-center py-6">
                <Users className="h-6 w-6 text-primary mb-2" />
                <span className="text-2xl font-bold">MIT</span>
                <span className="text-sm text-base-content/70">Licensed</span>
              </div>
            </div>
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body items-center py-6">
                <Star className="h-6 w-6 text-primary mb-2" />
                <span className="text-2xl font-bold">Self-host</span>
                <span className="text-sm text-base-content/70">Your Data</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://github.com/yourusername/metric" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline gap-2"
            >
              <Github className="h-5 w-5" />
              View on GitHub
            </a>
            <a 
              href="https://github.com/yourusername/metric/blob/main/CONTRIBUTING.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-ghost gap-2"
            >
              <Heart className="h-5 w-5" />
              Contribute
            </a>
          </div>

          {/* Quote */}
          <div className="mt-16 p-8 rounded-2xl bg-base-100 border border-base-300 max-w-2xl mx-auto">
            <blockquote className="text-lg italic text-base-content/80">
              "Open source allows everyone to verify exactly how their data is handled. 
              No black boxes, no hidden tracking, just transparent analytics."
            </blockquote>
            <p className="mt-4 text-sm text-base-content/60">
              — Built with privacy in mind
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
