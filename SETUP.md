# Maraamathu Setup Guide 🚀

This guide will help you set up the Maraamathu application locally.

This project is currently a **LocalStorage-based demo** (no Supabase required).

If you are using Supabase Auth + Admin user management, follow the section "Supabase setup" below.

## 📋 Prerequisites

- Node.js 18+ installed
- npm installed (comes with Node.js)

## 🛠️ Step 1: Install dependencies

### 1.1 Install Dependencies
```bash
npm install
```

## 🧪 Step 2: Run locally

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test the Application
1. Open http://localhost:5173
2. Sign in as any demo profile:
   - Customer: `customer@demo.com`
   - Worker: `worker@demo.com`
   - Admin: `admin@demo.com`
3. Create a service request as Customer
4. Open a second browser window as Worker and:
   - mark **I'm Interested**
   - optionally submit **Quotation (MVR)**
5. As Customer, choose a worker/quotation and progress the workflow

## 🔐 Supabase setup (Auth + Admin user management)

### Environment variables

Create a `.env.local` with:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### Deploy Admin user management Edge Function

The Admin panel uses the Supabase Edge Function `admin-users` to securely:

- Create users
- Delete users
- Reset passwords

1) Install Supabase CLI and login

```bash
npm i -g supabase
supabase login
```

2) Link your project

```bash
supabase link --project-ref <your-project-ref>
```

3) Set function secret (Service Role key)

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

4) Deploy the function

```bash
supabase functions deploy admin-users
```

5) Test

- Log in as an Admin
- Open the Admin dashboard
- Create a Customer/Worker (email + temp password)
- Use **Reset Password** / **Delete** / **Active/Inactive**

## ✅ Completed jobs

- Customer and Worker dashboards contain a **Completed** tab.
- Completed jobs are separated from active jobs.

## � Admin activation/deactivation

- Admin can activate/deactivate customers and workers.
- Deactivated profiles will not show up in the Sign in list.

## 🧹 Resetting demo data

Since the database is LocalStorage, you can reset state by clearing site data in your browser:

- Chrome/Edge: DevTools -> Application -> Storage -> Clear site data

## 📱 Step 5: Mobile Testing

The application is fully responsive. Test on:
- Mobile browsers (Safari on iOS, Chrome on Android)
- Tablet devices
- Different screen sizes

## 🔧 Step 6: Optional Enhancements

### 6.1 Add Storage for Profile Pictures
1. In Supabase, create a Storage bucket called `profiles`
2. Set up appropriate storage policies
3. Update the worker profile form to handle image uploads

### 6.2 Enable Email Notifications
1. Configure SMTP settings in Supabase
2. Create email templates for:
   - New booking notifications
   - Booking status updates
   - Review requests

### 6.3 Add Analytics
1. Sign up for Vercel Analytics
2. Enable in your Vercel project dashboard
3. Track user engagement and popular services

## 🐛 Troubleshooting

### Common Issues

**"I don't see Admin in the sign-in list"**
- Clear LocalStorage (see "Resetting demo data" above)
- Reload the page

**"A user disappeared from sign-in"**
- Admin may have deactivated that profile. Re-activate in Admin Dashboard.

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify all setup steps were completed
3. Check Supabase logs for database errors
4. Review Vercel deployment logs for deployment issues

## 🎉 You're Ready!

Your Maraamathu demo is ready! You can test:
- Multi-worker interest + quotations
- Full job workflow
- Completed jobs separation
- Admin CRUD + activate/deactivate
