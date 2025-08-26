# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production with Turbo
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` or `pnpm prettier` - Format code with Prettier
- `pnpm tsc` - Type check without emitting files
- `pnpm tsc:watch` - Type check in watch mode

## Architecture

This is a Next.js 15 application using the App Router architecture:

- **Framework**: Next.js with App Router (pages in `src/app/`)
- **Styling**: Tailwind CSS with Tailwind v4
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Package Manager**: pnpm (evidenced by pnpm-lock.yaml)
- **TypeScript**: Full TypeScript setup with strict configuration

### Key Dependencies
- **Animation**: Framer Motion (`motion` package)
- **Styling**: Tailwind CSS with merge utilities and animation plugin
- **Development**: Comprehensive ESLint setup with multiple plugins for Next.js, React Hooks, a11y, and Prettier integration

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `public/screens/` - Contains image assets (bre.png, dydy.png)
- Root layout handles font loading and global styles
- Current homepage displays two full-screen images in a vertical layout