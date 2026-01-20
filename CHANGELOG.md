# Changelog

All notable changes to the Tech Dashboard will be documented in this file.

## [0.3.0] - 2026-01-20

### Added
- **Live Monitoring Dashboard** - Real-time data from GitHub and Cloudflare APIs
- **Repositories page** - Monitor all GitHub repos for The-Jersey-Bee organization
  - Health status indicators (healthy/warning/critical based on commit recency)
  - CI status, open issues, and PR counts
  - Recent activity feed showing commits, PRs, and issues
- **Cloudflare Resources page** - View all Cloudflare infrastructure
  - Workers with status and last modified timestamps
  - Pages projects with deployment status, domains, and latest commit info
  - D1 databases with creation dates and IDs
  - Filterable tabs (All, Workers, Pages, D1)
- **Dashboard API Worker** - Cloudflare Worker backend (`dashboard-api`)
  - GitHub API integration for repos, commits, and activity
  - Cloudflare API integration for Workers, Pages, and D1
  - KV-based caching to reduce API calls
  - D1 database for health checks and alerts
  - Scheduled health checks every 5 minutes
- **Health, Activity, and Controls pages** - UI shells ready for future features

### Fixed
- **CORS preflight handling** - Added dedicated OPTIONS handler before middleware to return proper 204 responses
- **Production API detection** - Frontend auto-detects production environment (pages.dev, jerseybee.org) and uses correct API URL
- **Custom domain CORS** - Added jerseybee.org to allowed origins for tech.jerseybee.org access

### Technical Notes
- Backend uses Hono framework on Cloudflare Workers
- Secrets managed via `wrangler secret put` (GITHUB_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- D1 database `jersey-bee-dashboard` stores health check configs and results
- KV namespace `CACHE` provides fast caching with configurable TTLs
- Frontend API service at `services/api.ts` with typed endpoints

---

## [0.2.0] - 2026-01-19

### Added
- **Google Sign-In authentication** - Users must authenticate with Google to access the dashboard
- **Domain-based access control** - Only users with `@comminfo.org` or `@jerseybee.org` emails can sign in
- **Invited users list** - Ability to grant access to specific external email addresses via `config/allowedUsers.ts`
- **Login page** - Full-page login with Jersey Bee branding and official Google Sign-In button
- **Session persistence** - Auth state stored in localStorage with automatic token expiry handling
- **User profile in sidebar** - Displays authenticated user's name, email, and Google profile picture
- **Route protection** - Unauthenticated users are redirected to login page

### Technical Notes
- Uses `@react-oauth/google` library (~10KB) for client-side OAuth
- JWT tokens decoded client-side to extract user info
- No backend required - suitable for static hosting on Cloudflare Pages
- Environment variable `VITE_GOOGLE_CLIENT_ID` required for Google OAuth

---

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
- **Cloudflare Pages deployment** - Configured build command (`npm run build`) and output directory (`dist`) for proper production builds

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
