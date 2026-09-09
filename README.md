# Modern Monorepo Starter

A complete, ready-to-use starter template for building modern web applications in a monorepo structure. This template helps you build full-stack TypeScript applications with shared code between packages.

## What's Included

This starter comes with everything you need to build professional web applications:

- **React & Astro** - Build interactive UIs with React components in Astro
- **tRPC** - End-to-end type-safe APIs without schemas or code generation
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **TypeScript** - Full type safety across all packages
- **Turborepo** - High-performance build system for JavaScript/TypeScript monorepos
- **PNPM Workspaces** - Fast, disk-efficient package management
- **ESLint & Prettier** - Code quality tools configured and ready to use
- **Renovate** - Automated dependency updates
- **Documentation** - Clean documentation site using Starlight

## Quick Start

```bash
# Create a new project
npx degit ocavue/starter-monorepo my-project

# Navigate to the project
cd my-project

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

After running these commands:

- Astro app: http://localhost:3001
- Documentation: http://localhost:3002

## Project Structure

```graphql
starter-monorepo/
│
├── apps/                  # Applications
│   ├── astro-app/         # Main Astro application with React & tRPC
│   ├── nextjs-app/        # Main Next.js application
│   └── docs/              # Documentation site built with Starlight
│
└── packages/              # Packages
    ├── api/               # tRPC API definitions and server code
    └── utils/             # Shared utility functions
```

## Available Commands

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Start all development servers       |
| `pnpm build`     | Build all packages and applications |
| `pnpm typecheck` | Run TypeScript type checking        |
| `pnpm lint`      | Run ESLint on all files             |
| `pnpm fix`       | Fix linting and formatting issues   |

## Setting Up GitHub Integration

1. Push your repository to GitHub
2. Install the [Renovate](https://github.com/apps/renovate) app for automated dependency updates
3. Install the [Autofix CI](https://github.com/apps/autofix-ci) app to automatically fix linting/formatting in PRs

## Deployment

This monorepo is configured for seamless deployment to Vercel. Each app can be deployed independently:

1. Connect your GitHub repo to Vercel
2. Select the app's root directory (e.g., `apps/astro-app`)

The monorepo structure is fully compatible with Vercel's build system. For advanced configuration options, check [Vercel's monorepo docs](https://vercel.com/docs/monorepos).

Live demos:

- Astro app: https://starter-monorepo-astro-app.vercel.app/
- Next.js app: https://starter-monorepo-nextjs-app.vercel.app/
- Documentation: https://starter-monorepo-docs.vercel.app/

For every pull request, Vercel will automatically deploy the changes to a preview URL.

![Vercel pull request preview](https://github.com/user-attachments/assets/b90bc65f-0d83-4e30-b6bb-9b1e334b2405)
