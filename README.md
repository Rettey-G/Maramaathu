# Maraamathu - Service Marketplace Platform

A service marketplace demo application connecting customers with skilled workers for home services. Built with React, TypeScript, and Tailwind CSS.

## ▶️ Run locally

### Prerequisites
- Node.js 18+ (recommended)
- npm (comes with Node.js)

### Steps
```bash
# 1) Clone
git clone <repository-url>

# 2) Go to project folder
cd maraamathu

# 3) Install dependencies
npm install

# 4) Start dev server
npm run dev
```

Then open the URL printed in the terminal (typically `http://localhost:5173`).

## 🔐 Supabase setup (required for real Auth + Admin user management)

This project can run with Supabase.

### Environment variables

Create a `.env.local` with:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### Admin user management (Edge Function)

The Admin panel can create users, delete users, and reset passwords via the Supabase Edge Function `admin-users`.

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

After deploying, log in as an Admin and use the Admin dashboard buttons:

- **Create** customer/worker (email + temp password)
- **Reset Password** per row
- **Delete** per row
- **Active/Inactive** toggle

### Production build (optional)
```bash
# Build
npm run build

# Preview the production build locally
npm run preview
```

## 🚀 Features

### Customer Experience
- **Service Request Creation**: Customers can create detailed service requests with budget, urgency, and location
- **Worker Discovery**: Browse and search for workers by service category with ratings and reviews
- **Full Workflow Management**: Track jobs through every stage from request to payment
- **Real-time Updates**: Instant UI updates as workers accept and progress through jobs

### Worker Experience
- **Job Management**: View and accept service requests matching their skills
- **Workflow Tools**: Schedule inspections, submit quotes, manage work schedules
- **Payment Tracking**: Mark payments as pending or paid
- **Profile Management**: Showcase skills, experience, ratings, and availability

### Complete Job Lifecycle
1. **Request** → Customer creates service request
2. **Interest / Quotations** → Multiple workers can mark interest and submit quotations (while request is still open)
3. **Select** → Customer selects a worker for inspection OR chooses a quotation offer
4. **Inspection** → Worker proposes inspection time → Customer confirms → Both confirm completion
5. **Quote** → Worker submits quote → Customer approves
6. **Schedule** → Worker schedules work → Customer confirms
7. **Work** → Worker completes job → Customer confirms completion
8. **Payment** → Worker marks payment status
9. **Complete** → Job marked as completed

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **State Management**: React hooks and local state
- **Database**: LocalStorage-based mock database with real-time updates
- **Authentication**: Mock auth with role-based access (customer/worker/admin)
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd maraamathu

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Project Structure

```
.
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── package.json
├── package-lock.json
├── .env.example
├── SETUP.md
└── src/
    ├── components/
    │   ├── Auth.tsx
    │   ├── AdminDashboard.tsx
    │   ├── CustomerDashboard.tsx
    │   ├── WorkerDashboard.tsx
    │   ├── ServiceRequestForm.tsx
    │   └── WorkerProfileForm.tsx
    └── lib/
        ├── db.ts
        ├── hooks.ts
        └── types.ts
```

## 🔐 Authentication

The app uses a mock authentication system with demo accounts:

### Customer Accounts
- **Email**: `customer@demo.com` → Select any customer profile
- **Role**: Customer

### Worker Accounts  
- **Email**: `worker@demo.com` → Select any worker profile
- **Role**: Worker

### Admin Account
- **Email**: `admin@demo.com`
- **Role**: Admin

## ✅ Completed Jobs tabs

- Customer Dashboard has a **Completed** tab.
- Worker Dashboard has a **Completed** tab.
- Completed jobs are separated from active jobs so the main lists stay clean.

## � Activate / Deactivate behavior

- Admin can toggle **Active / Inactive** for customers and workers.
- **Inactive users will not appear in the Sign in (demo) profile list**, and the app blocks key actions for deactivated users.

## �📊 Database Schema

### Core Entities
- **Users**: Customer profiles with contact information
- **Workers**: Service provider profiles with skills, rates, and ratings
- **Service Requests**: Job requests with workflow status tracking
- **Service Categories**: Available service types (AC, Plumbing, Electrical, Carpentry, Other)

Note: currency in the UI is **MVR**.

### Workflow States
Each service request progresses through these states:
- `open` → `pending_customer_confirmation` → `inspection_pending_worker_proposal` → `inspection_pending_customer_confirmation` → `inspection_scheduled` → `inspection_completed_pending_customer_confirm` → `awaiting_quote` → `quote_pending_approval` → `work_pending_worker_schedule` → `work_pending_customer_confirmation` → `work_scheduled` → `work_completed_pending_customer_confirm` → `payment_pending` → `completed`

## 🎨 UI Components

### Customer Dashboard Tabs
- **Find Workers**: Search and browse available workers
- **New / Waiting**: View open requests
- **Confirm Worker**: Accept worker proposals
- **Inspection**: Manage inspection scheduling and confirmation
- **Quote / Price**: Review and approve quotes
- **Work Schedule**: Confirm work schedules
- **Completion**: Confirm work completion
- **Payment**: View payment status
- **Completed**: View finished jobs

### Worker Dashboard Tabs
- **Browse Requests**: View and accept new job requests
- **Inspection**: Propose and complete inspections
- **Quote**: Submit price quotes
- **Schedule Work**: Plan and schedule work
- **Work**: Manage ongoing jobs
- **Completion**: Track completion confirmations
- **Payment**: Mark payment status
- **Completed**: View finished jobs

## 🔄 Real-time Features

- **Live Updates**: UI automatically refreshes when data changes
- **Event Listeners**: Mock subscription system for real-time updates
- **State Synchronization**: All components stay in sync with database changes

## 🧪 Testing

The application includes comprehensive mock data seeding and can be tested with:
- Different user roles (customer/worker)
- Complete workflow scenarios
- Edge cases and error handling

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive navigation and layouts
- Touch-friendly interface elements
- Optimized for all screen sizes

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent naming conventions
- Component-based architecture

## 🚀 Deployment

The application is ready for deployment to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📈 Future Enhancements

- Real messaging system between customers and workers
- Photo/file upload for job documentation
- Payment gateway integration
- Mobile app development
- Advanced filtering and search
- Notification system
- Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ for the Maraamathu service marketplace platform.


vhbTzJgQu3O6wwe7 superbasePW


project url 
https://yzxphvnuovtppqkgguyk.supabase.co
Publishable key
sb_publishable_V2YfGs2NwWMYADTSPqymRA_ms2ChGxq
Drect connection string
postgresql://postgres:[YOUR-PASSWORD]@db.yzxphvnuovtppqkgguyk.supabase.co:5432/postgres
Password 
vhbTzJgQu3O6wwe7
