# Contributing to Metric

First off, thank you for considering contributing to Metric! It's people like you that make Metric such a great tool for privacy-focused analytics.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps**.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** if possible.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Provide specific examples to demonstrate the steps** or point out the part of Metric where the suggestion is related to.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Explain why this enhancement would be useful** to most Metric users.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or bun
- A Supabase account (for backend)

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/metric.git
cd metric

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Fill in your Supabase credentials in .env

# Start development server
npm run dev
```

### Project Structure

```
metric/
├── src/
│   ├── components/     # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── dashboard/  # Dashboard components
│   │   └── landing/    # Landing page components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── integrations/   # External service integrations
│   └── lib/            # Utility functions
├── supabase/
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

### Code Style

- We use TypeScript for type safety
- We use Tailwind CSS for styling
- We follow the [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- Run `npm run lint` before committing

## Database Changes

If your contribution requires database changes:

1. Create a new migration file in `supabase/migrations/`
2. Include both the up and down migrations
3. Test the migration locally before submitting

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
