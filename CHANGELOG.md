# Changelog

All notable changes to the Tech Dashboard will be documented in this file.

## [0.0.0] - 2026-01-19

### Added
- Initial project setup with React 19 and Vite
- Dashboard, Layout, and Projects components
- Gemini AI integration for dynamic tech summaries (optional - falls back to static message if API key not configured)
- TypeScript configuration
- Cloudflare Pages deployment

### Notes
- **Gemini API Key**: The `GEMINI_API_KEY` environment variable is optional. Without it, the dashboard displays a static welcome message instead of AI-generated summaries.
