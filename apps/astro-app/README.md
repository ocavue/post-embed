# Astro App with React and tRPC

This is a simple Astro application that demonstrates how to use React components and tRPC in a monorepo structure. It provides a clean example of type-safe client-server communication with a modern UI built using Tailwind CSS.

## Features

- **React Integration**: Interactive UI components built with React
- **tRPC**: Type-safe API calls between client and server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Multi-Page Application**: Simple navigation between pages
- **Monorepo Structure**: Part of a larger monorepo using PNPM workspaces

## Project Structure

```text
/
├── public/              # Static assets
│   └── favicon.svg
├── src/
│   ├── components/      # React components
│   │   ├── HomePage.tsx # Home page component with interactive elements
│   │   ├── AboutPage.tsx # About page component with tRPC post management
│   │   └── Navigation.tsx # Site navigation component
│   ├── layouts/         # Shared layouts
│   │   └── Layout.astro # Main layout with navigation
│   ├── pages/           # Route pages
│   │   ├── index.astro  # Home page route
│   │   ├── about.astro  # About page route
│   │   └── api/         # API routes
│   │       └── trpc/    # tRPC API endpoints
│   └── styles/          # Global styles
│       └── global.css   # Global CSS with Tailwind imports
└── package.json         # Project dependencies
```

## What This Example Shows

- How to structure a React + Astro application
- How to implement interactive components in React
- How to set up tRPC for type-safe API communication
- How to use Tailwind CSS for styling
- How to create a simple multi-page application

## Getting Started

1. **Install dependencies**:

   ```
   pnpm install
   ```

2. **Start the development server**:

   ```
   pnpm dev
   ```

   This will start the application at `http://localhost:3001`

3. **Build for production**:
   ```
   pnpm build
   ```

## Pages

- **Home Page** (`/`): Shows a simple React counter and post list UI
- **About Page** (`/about`): Demonstrates tRPC functionality with post management

## Using tRPC

This app demonstrates how to use tRPC to create type-safe APIs:

1. The server defines procedures in the `packages/api` directory
2. The client connects to these procedures with full type safety
3. No manual API documentation or type definitions needed

## Commands

| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `pnpm install` | Install dependencies                         |
| `pnpm dev`     | Start development server at `localhost:3001` |
| `pnpm build`   | Build for production to `./dist/`            |
| `pnpm preview` | Preview production build locally             |
