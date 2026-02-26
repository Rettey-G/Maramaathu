# Changelog

All notable changes to the Maraamathu project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Admin user management via Supabase Edge Function
- CORS support for Vercel production domain
- Row Level Security (RLS) policies with recursion fix
- Timeout handling for all database queries
- Debug logging for auth and data loading

### Fixed
- Infinite loading spinner on refresh
- CORS preflight errors on admin-user Edge Function
- RLS infinite recursion on profiles table
- ensureProfile timeout during auth state changes

### Security
- Implemented `is_admin()` security definer function
- Added SERVICE_ROLE_KEY secret for Edge Function
- Updated RLS policies to prevent recursion

## [1.0.0] - 2026-02-26

### Added
- Initial release of Maraamathu service marketplace
- Supabase authentication integration
- Google OAuth sign-in support
- Role-based access control (Customer, Worker, Admin)
- Customer dashboard with job posting
- Worker dashboard with job browsing and quoting
- Admin dashboard with user management
- Real-time data synchronization via Supabase
- Service request workflow (Open → Accepted → In Progress → Completed)
- Quote submission and approval system
- Worker profile management
- Review and rating system
- Responsive design for mobile and desktop
- PWA support with offline capabilities

### Features

#### Customer Features
- Post service requests with details, budget, urgency
- Browse interested workers
- Compare worker quotes
- Accept/reject quotes
- Track job progress
- Review completed jobs
- View service history

#### Worker Features
- Create detailed profile with skills, categories
- Browse available jobs
- Express interest in jobs
- Submit custom quotes
- Accept job assignments
- Update job progress
- Receive customer reviews
- Build reputation with ratings

#### Admin Features
- View all users (customers, workers)
- Create new users with temporary passwords
- Reset user passwords
- Activate/deactivate user accounts
- Delete user accounts
- View all service requests
- Monitor platform activity
- Full user management via Edge Function

### Technical
- React 18 with TypeScript
- Vite build system
- Tailwind CSS styling
- Supabase backend (Auth, Database, Realtime)
- Edge Functions for admin operations
- Row Level Security (RLS) policies
- Environment-based configuration
- GitHub + Vercel CI/CD

### Infrastructure
- Supabase project: yzxphvnuovtppqkgguyk
- Vercel deployment: https://maramaathu.vercel.app
- GitHub repository: https://github.com/Rettey-G/Maramaathu

## [0.9.0] - 2026-02-20

### Added
- LocalStorage-based demo mode
- Mock data for testing
- Basic UI components
- Role selection flow

### Changed
- Migrated from LocalStorage to Supabase

## Migration Notes

### From v0.9.0 to v1.0.0
1. Create Supabase project
2. Run database schema from `supabase-schema.sql`
3. Set environment variables in `.env.local`
4. Deploy Edge Function `admin-users`
5. Update Vercel environment variables
6. Configure Google OAuth in Supabase

## Known Issues

### Resolved
- ✅ Admin dashboard loading timeout
- ✅ CORS errors on Edge Function
- ✅ RLS infinite recursion
- ✅ Auth state change hanging

### Under Development
- Payment integration
- Push notifications
- Mobile app (React Native)
- Advanced analytics dashboard

---

## Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Deploy Edge Functions
- [ ] Update Vercel deployment
- [ ] Update documentation
- [ ] Create release notes
- [ ] Tag release on GitHub
