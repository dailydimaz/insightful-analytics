<p align="center">
  <img src="public/favicon.ico" alt="Metric Logo" width="80" height="80">
</p>

<h1 align="center">Metric</h1>

<p align="center">
  <strong>Privacy-first, open-source web analytics</strong>
</p>

<p align="center">
  Simple, fast, and privacy-focused analytics for your websites and applications.
  <br />
  No cookies. GDPR compliant. Self-hostable.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#self-hosting">Self-Hosting</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## ✨ Features

- **Privacy-First**: No cookies, no personal data collection, GDPR/CCPA compliant
- **Lightweight**: < 1KB tracking script, zero impact on Core Web Vitals
- **Real-time Analytics**: See visitors on your site as it happens
- **Custom Events**: Track button clicks, form submissions, and any custom events
- **Funnel Analysis**: Understand your conversion funnel and optimize user flow
- **Retention Cohorts**: Track user retention over time
- **Open Source**: MIT licensed, self-hostable, fully transparent

## 🚀 Getting Started

### Quick Start (Cloud)

1. Visit [metric.example.com](https://metric.example.com) and sign up
2. Add your first website
3. Copy the tracking script to your site's `<head>` tag
4. Start collecting insights!

### Self-Hosting

Metric can be self-hosted using Supabase as the backend.

#### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

#### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/metric.git
cd metric

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your Supabase credentials in .env
# VITE_SUPABASE_PROJECT_ID=your-project-id
# VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
# VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Run database migrations
# (Apply the SQL files in supabase/migrations/ to your Supabase project)

# Start development server
npm run dev
```

#### Production Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` folder to any static hosting provider:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Your own server

## 📊 Usage

### Adding the Tracking Script

Add this script to your website's `<head>` tag:

```html
<script defer src="https://your-metric-instance.com/track.js" data-site="YOUR_TRACKING_ID"></script>
```

### Tracking Custom Events

```javascript
// Track a custom event
metric.track('button_click', { button_id: 'cta-hero' });

// Track a form submission
metric.track('form_submit', { form_name: 'newsletter' });
```

## 🏗️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, DaisyUI, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: TanStack Query

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## 📄 License

Metric is open-source software licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Inspired by [Umami](https://umami.is), [Plausible](https://plausible.io), and other privacy-focused analytics tools.

---

<p align="center">
  Made with ❤️ for privacy
</p>
