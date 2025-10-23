# TradeTimer

**Track time. Manage clients. Get paid faster.**

TradeTimer is a modern time tracking and invoicing tool built for freelancers, contractors, and small businesses. Track your billable hours, manage client information, generate professional invoices, and gain insights into your earnings.

## Features

- ⏱️ **One-Tap Time Tracking** - Start and stop tracking with a single click
- 👥 **Client Management** - Store client details, hourly rates, and contact information
- 📊 **Reports & Analytics** - Comprehensive reports with time heatmaps, client health scores, and earnings projections
- 📧 **Invoice Generation** - Generate and export professional invoices
- 📈 **Goal Tracking** - Set and monitor revenue and time goals
- 🎯 **Time Distribution** - Visualize how you spend your time across clients
- 🔐 **Secure** - Built with Supabase Row Level Security for data protection
- 💡 **Onboarding Experience** - Guided first-time user experience

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **UI Components**: Custom components with Headless UI and Framer Motion
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/tradetimer.git
cd tradetimer
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up the database**

Run the SQL schema in your Supabase project:

```bash
# The schema is in supabase-schema.sql
# You can run this in the Supabase SQL Editor
```

The schema includes:
- `clients` table - Store client information
- `time_entries` table - Track time entries
- `invoices` table - Generate invoices
- `user_preferences` table - Store user onboarding preferences
- Row Level Security policies for all tables

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
tradetimer/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── signup/              # Signup page
│   ├── login/               # Login page
│   ├── dashboard/           # Main dashboard
│   ├── reports/             # Reports & analytics
│   ├── profile/             # User profile
│   ├── help/                # Help center with FAQ
│   └── auth/                # Auth callbacks
├── components/              # React components
│   ├── ui/                  # Base UI components (Button, etc.)
│   ├── timer.tsx            # Time tracking component
│   ├── add-client-form.tsx  # Client management
│   ├── clients-list.tsx     # Client list display
│   ├── dashboard-content.tsx # Main dashboard layout
│   ├── reports-content.tsx  # Reports page
│   ├── onboarding/          # Onboarding flow components
│   └── help/                # Help center components
├── lib/                     # Utilities and helpers
│   ├── supabase/            # Supabase client setup
│   └── utils.ts             # Helper functions
├── supabase/                # Supabase migrations
└── public/                  # Static assets
```

## Features Overview

### Dashboard
- Quick-access time tracker with live timer
- Client selector with hourly rate display
- Add new clients inline
- Real-time earnings calculation
- Recent time entries list

### Time Tracking
- Start/stop timer for any client
- Add optional notes to time entries
- View estimated earnings while timer runs
- Automatic duration calculation

### Client Management
- Add, edit, and delete clients
- Store client name, email, phone, and hourly rate
- Quick client selection in timer

### Reports & Analytics
- **Earnings Overview**: Total, average, and projected earnings
- **Time Distribution**: Pie chart showing time by client
- **Time Heatmap Calendar**: Visual representation of work patterns
- **Client Health Score**: Risk assessment for client relationships
- **Comparative Analytics**: Week-over-week and month-over-month comparisons
- **Goal Progress**: Track towards revenue and time goals
- **Export & Share**: Download reports as HTML

### Help Center
- Comprehensive FAQ sections
- Contact form for support
- Contextual help throughout the app

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Database Schema

The app uses Supabase (PostgreSQL) with the following tables:

- **clients** - Client information (name, email, phone, hourly_rate)
- **time_entries** - Time tracking records (start_time, end_time, duration, amount)
- **invoices** - Invoice records (invoice_number, amount, due_date, status)
- **user_preferences** - User settings and onboarding data

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

The app is optimized for Vercel's Edge Runtime and includes automatic SSL, CDN, and serverless functions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For questions or issues, please open an issue on GitHub.

---

**Built with Next.js, Supabase, and Tailwind CSS**
