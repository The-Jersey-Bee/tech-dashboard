# Changelog

All notable changes to the Tech Dashboard will be documented in this file.

## [0.1.0] - 2026-01-19

### Removed
- **Gemini AI integration** - Removed unnecessary AI dependency that added complexity without meaningful value. The dashboard now displays a static welcome message instead of making API calls for generic text generation.
- **CDN Tailwind** - Removed inefficient CDN-based Tailwind that loaded the entire ~3MB library
- **Import maps** - Removed ESM import maps that bypassed Vite's bundling optimizations
- **Unused code** - Removed unused `User` interface from types.ts

### Added
- **ErrorBoundary component** - Catches React errors gracefully with Jersey Bee branding and "Try Again" functionality
- **Proper Tailwind setup** - Installed Tailwind CSS with PostCSS for optimized, tree-shaken builds
- **Button functionality** - Sign Out button now shows confirmation dialog; Add Project shows "coming soon" message

### Fixed
- **Typo** - Fixed "ULR" → "URL" in the roadmap section
- **TypeScript strict mode** - Enabled `strict`, `noUnusedLocals`, and `noUnusedParameters` for better type safety

### Changed
- Dashboard "AI Insights" section renamed to "Status" with static welcome message
- Simplified vite.config.ts by removing unused environment variable handling

### Technical Notes
- The project now properly uses Vite's build system for all dependencies
- Tailwind CSS is purged at build time, reducing CSS bundle size by ~95%
- Error boundaries prevent white-screen crashes from component errors

---

## [0.0.0] - 2026-01-19

### Added
- Initial project setup with React 19 and Vite
- Dashboard, Layout, and Projects components
- TypeScript configuration
- Cloudflare Pages deployment
