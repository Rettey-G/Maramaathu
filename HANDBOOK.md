# Maraamathu User Handbook

Complete guide for using the Maraamathu Service Marketplace Platform

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [For Customers](#for-customers)
3. [For Workers](#for-workers)
4. [For Admins](#for-admins)
5. [Understanding the Job Workflow](#understanding-the-job-workflow)
6. [Troubleshooting](#troubleshooting)
7. [FAQs](#faqs)
8. [Safety & Security](#safety--security)

---

## Getting Started

### What is Maraamathu?

Maraamathu is a service marketplace platform that connects:
- **Customers** who need services (home repairs, maintenance, etc.)
- **Workers** who provide skilled services (plumbers, electricians, AC technicians, etc.)
- **Admins** who manage the platform

### Accessing the Platform

1. Visit **https://maramaathu.vercel.app**
2. Click **"Sign In"**
3. Choose your sign-in method:
   - Google account (quick)
   - Email and password

### Install Maraamathu as an App (PWA)

You can install Maraamathu on your phone so it opens like an app.

- **Android (Chrome)**
  1. Open https://maramaathu.vercel.app
  2. Tap the menu (3 dots)
  3. Tap **"Install app"** or **"Add to Home screen"**

- **iPhone (Safari)**
  1. Open https://maramaathu.vercel.app in **Safari**
  2. Tap **Share**
  3. Tap **"Add to Home Screen"**

### Choosing Your Role

When you first sign up, you'll be asked to choose:

| Role | Choose If... |
|------|-------------|
| **Customer** | You need services done at your home/business |
| **Worker** | You provide skilled services and want more customers |
| **Admin** | You manage the platform (requires manual promotion) |

---

## For Customers

### Dashboard Overview

Your dashboard has tabs to manage your service requests:

- **New / Waiting** - Requests waiting for workers
- **Confirm Worker** - Workers have shown interest
- **Inspection** - Schedule and confirm inspections
- **Quote / Price** - Review and approve quotes
- **Work Schedule** - Confirm work dates
- **Completion** - Confirm work is done
- **Payment** - Track payment status
- **Completed** - History of finished jobs

### Posting a Service Request

1. Click **"New Request"** button
2. Fill the form:
   - **Category**: Select service type (AC, Plumbing, Electrical, etc.)
   - **Title**: Brief description (e.g., "AC not cooling")
   - **Description**: Detailed explanation of the problem
   - **Budget**: Your expected price range (optional)
   - **Urgency**: Low / Medium / High / Emergency
   - **Location**: Your address or area
3. Click **"Post Request"**

**Tips for better results:**
- Be specific about the problem
- Include photos if possible (feature coming soon)
- Set realistic budgets
- Respond quickly to worker interest

### Reviewing Interested Workers

When workers show interest:

1. Go to **"Confirm Worker"** tab
2. View worker profiles:
   - Ratings and reviews
   - Skills and experience
   - Completed jobs
3. Click **"View Profile"** to see more details
4. Click **"Accept"** to select a worker

### Managing Inspections

Inspections help workers assess the job before quoting:

1. **Worker proposes time** → You receive notification
2. Go to **"Inspection"** tab
3. Review proposed time
4. Click **"Confirm"** or suggest alternative
5. Both parties confirm when inspection is done

### Handling Quotes

After inspection, workers submit quotes:

1. Go to **"Quote / Price"** tab
2. Review all submitted quotes
3. Compare prices and worker ratings
4. Click **"Approve"** on your chosen quote
5. Job moves to scheduling phase

### Confirming Work Completion

1. When work is done, worker marks it complete
2. Go to **"Completion"** tab
3. Review the work
4. Click **"Confirm Completion"** if satisfied
5. Job moves to payment phase

### Leaving Reviews

After job completion:

1. Rate the worker (1-5 stars)
2. Write a brief review
3. Your feedback helps other customers

---

## For Workers

### Creating Your Profile

A strong profile attracts more customers:

1. Click **"Edit Profile"**
2. Add your details:
   - **Name**: Professional name
   - **Phone**: Contact number
   - **Categories**: Services you provide (AC, Plumbing, etc.)
   - **Skills**: Specific skills (e.g., "Split AC repair", "Pipe fitting")
   - **About**: Brief professional bio
   - **WhatsApp/Viber**: Alternative contact methods

**Profile Tips:**
- List all relevant categories
- Be specific about skills
- Keep contact info updated
- Professional photos help (feature coming soon)

### Dashboard Overview

- **Browse Requests** - Available jobs in your categories
- **Inspection** - Jobs awaiting inspection
- **Quote** - Jobs needing your quote
- **Schedule Work** - Jobs to schedule
- **Work** - Active jobs
- **Completion** - Jobs awaiting customer confirmation
- **Payment** - Track payments
- **Completed** - Your job history

### Finding Jobs

1. Go to **"Browse Requests"** tab
2. Filter by:
   - Your service categories
   - Location
   - Urgency
3. Click **"I'm Interested"** to express interest
4. Wait for customer to select you

### Submitting Quotes

When selected for inspection:

1. Visit customer location
2. Assess the work required
3. Go to **"Quote"** tab
4. Enter:
   - **Amount**: Your price (MVR)
   - **Notes**: What's included, timeline, etc.
5. Click **"Submit Quote"**

**Quote Tips:**
- Be competitive but fair
- Include all costs (materials, labor)
- Mention timeline
- Explain what's included

### Managing Your Schedule

After quote approval:

1. Go to **"Schedule Work"** tab
2. Propose available dates/times
3. Wait for customer confirmation
4. Do the work as scheduled
5. Mark work as complete

### Building Your Reputation

- Respond quickly to job requests
- Be punctual for inspections
- Provide fair quotes
- Do quality work
- Ask satisfied customers for reviews
- Maintain high ratings

---

## For Admins

### Becoming an Admin

Admins are manually assigned:

1. Sign up as regular user
2. Contact existing admin or platform owner
3. They will change your role in the database
4. Refresh and access Admin dashboard

### Admin Dashboard

The admin panel shows:
- Total customers, workers, and jobs
- Recent activity
- User management tools

### Creating Users

As admin, you can create accounts for others:

1. Go to **Admin Dashboard**
2. Click **"Create Customer"** or **"Create Worker"**
3. Enter:
   - **Email**: User's email
   - **Password**: Temporary password
   - **Name**: Full name
   - **Phone**: Contact number
4. User receives credentials
5. They should change password after first login

### Resetting Passwords

If users forget passwords:

1. Find user in the list
2. Click **"Reset Password"**
3. Enter temporary password
4. Share with user securely
5. User must change on next login

### Managing User Accounts

**Activate/Deactivate:**
- Toggle switch on user row
- Inactive users cannot log in
- Use for policy violations or payment issues

**Delete Users:**
- Click **"Delete"** on user row
- Permanently removes account
- Cannot be undone

### Monitoring the Platform

Use the dashboard to:
- View all active jobs
- See user statistics
- Monitor completion rates
- Identify issues

---

## Understanding the Job Workflow

### Complete Job Lifecycle

```
1. REQUEST
   Customer posts service request
   ↓
2. INTEREST
   Workers view and express interest
   ↓
3. SELECTION
   Customer reviews workers and selects one
   ↓
4. INSPECTION
   Worker visits, assesses the job
   Both confirm inspection done
   ↓
5. QUOTE
   Worker submits price quote
   Customer approves quote
   ↓
6. SCHEDULING
   Worker proposes work schedule
   Customer confirms dates
   ↓
7. WORK
   Worker completes the job
   ↓
8. COMPLETION
   Customer confirms work done
   ↓
9. PAYMENT
   Payment is made and recorded
   ↓
10. REVIEW
    Customer rates and reviews worker
    Job marked as COMPLETED
```

### Status Meanings

| Status | Meaning |
|--------|---------|
| **Open** | New request, waiting for workers |
| **Pending Confirmation** | Workers interested, customer needs to choose |
| **Inspection Pending** | Waiting for inspection scheduling |
| **Quote Pending** | Waiting for worker's price quote |
| **Work Scheduled** | Dates confirmed, work upcoming |
| **In Progress** | Work is being done |
| **Pending Payment** | Work done, waiting for payment |
| **Completed** | Job finished and paid |

---

## Troubleshooting

### Can't Log In

**Problem:** Login fails or times out

**Solutions:**
1. Check your internet connection
2. Clear browser cache (Ctrl+Shift+R)
3. Try Google sign-in instead of email
4. If still failing, contact admin for password reset

### Page Keeps Loading

**Problem:** Infinite loading spinner

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check browser console for errors (F12)
3. Log out and log back in
4. Try incognito/private mode

### Can't See Jobs/Workers

**Problem:** Dashboard shows "No data"

**Solutions:**
1. Check your role (customer vs worker)
2. Workers: Ensure you selected service categories in profile
3. Wait a few seconds for data to load
4. Refresh the page

### Quote/Action Buttons Not Working

**Problem:** Clicking buttons does nothing

**Solutions:**
1. Check you're in the correct workflow stage
2. Verify you have permission for this action
3. Refresh and try again
4. Check for error messages

### Notifications Not Showing

**Problem:** Not seeing updates

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Navigate to the relevant tab manually
4. Data updates every few seconds automatically

---

## FAQs

### General Questions

**Q: Is Maraamathu free to use?**
A: Yes, currently free for both customers and workers.

**Q: What services are available?**
A: AC repair, plumbing, electrical work, carpentry, painting, and general maintenance.

**Q: Is this only for Maldives?**
A: Yes, currently focused on Maldives with MVR currency.

### For Customers

**Q: How do I know workers are trustworthy?**
A: Check their ratings, reviews, and completed jobs count.

**Q: Can I cancel a job after posting?**
A: Yes, if no worker has been selected yet.

**Q: What if I'm not satisfied with the work?**
A: Don't confirm completion. Contact admin for assistance.

**Q: Is payment handled through the app?**
A: Currently, payment is arranged directly with workers.

### For Workers

**Q: How do I get more job requests?**
A: Complete your profile, select more categories, build good ratings.

**Q: Can I reject a job after accepting?**
A: Contact admin if you have a valid reason.

**Q: How do customers pay me?**
A: Arrange payment method directly with customer.

**Q: Can I update my service categories?**
A: Yes, edit your profile anytime.

---

## Safety & Security

### For Customers

- **Verify Workers**: Check ratings and reviews before accepting
- **Meet Safely**: For first meetings, consider public places or having someone with you
- **Payment**: Only pay after work is completed to your satisfaction
- **Report Issues**: Use admin contact for problems

### For Workers

- **Profile Accuracy**: Keep your information truthful and updated
- **Professional Conduct**: Maintain professionalism in all interactions
- **Safety**: Inform someone when visiting new customer locations
- **Payment Security**: Get agreement on payment before starting work

### Data Privacy

- Your data is stored securely on Supabase
- Only necessary information is shared
- Admins can access data for platform management
- You can request account deletion

### Reporting Problems

Report immediately if you encounter:
- Fraudulent users
- Harassment or abuse
- Payment disputes
- Technical issues

Contact: [GitHub Issues](https://github.com/Rettey-G/Maramaathu/issues)

---

## Tips for Success

### Customer Tips

1. **Be Detailed**: Clear descriptions get better quotes
2. **Responsive**: Reply quickly to worker messages
3. **Fair Budgets**: Unrealistic budgets get fewer responses
4. **Reviews Matter**: Rate workers honestly after jobs

### Worker Tips

1. **Complete Profile**: More info = more trust
2. **Quick Response**: Fast replies win jobs
3. **Fair Pricing**: Competitive but profitable
4. **Quality Work**: Good reviews bring more customers
5. **Professional**: Communication matters

---

## Glossary

| Term | Meaning |
|------|---------|
| **Service Request** | Job posting by customer |
| **Quote** | Price offer from worker |
| **Inspection** | Initial visit to assess job |
| **Category** | Type of service (AC, Plumbing, etc.) |
| **MVR** | Maldivian Rufiyaa (currency) |
| **RLS** | Row Level Security (database protection) |
| **Edge Function** | Server-side code for admin operations |

---

## Updates & Changes

This handbook is updated with each platform release. Check the [Changelog](./CHANGELOG.md) for recent changes.

**Version:** 1.0.0  
**Last Updated:** February 2026

---

**Need More Help?**

- Check [GitHub Issues](https://github.com/Rettey-G/Maramaathu/issues)
- Contact platform admin
- Review this handbook again

**Maraamathu - Get it done.**
