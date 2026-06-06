# SupportDesk — Customer Support CRM

**Live demo:** [https://cms-chi-orpin.vercel.app](https://cms-chi-orpin.vercel.app/)

A modern, productivity-focused customer support ticketing system built with Next.js. Features a clean, Linear/Notion-inspired UI with a deep forest green palette, soft rounded corners, and real-time analytics.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Database:** NeonDB (PostgreSQL via `@neondatabase/serverless`)
- **Charts:** Recharts
- **Styling:** Tailwind CSS v4 + custom CSS design tokens
- **Font:** Inter (geometric sans) + JetBrains Mono (tabular data)
- **Notifications:** react-hot-toast

## Features

### Core Features

| Feature | Description |
|---|---|
| **Create Tickets** | Form with customer name, email, subject, description, and priority level. Auto-generates TKT-XXX ticket IDs. |
| **List All Tickets** | Table view with sortable columns: Ticket ID, Customer, Subject, Status, Date. |
| **Search** | Debounced search-as-you-type across customer name, email, ticket ID, subject, and description. |
| **Filter by Status** | Dropdown filter for Open / In Progress / Closed. |
| **Filter by Priority** | Dropdown filter for Low / Medium / High / Urgent. |
| **View Ticket Details** | Full detail page with customer info, description, status/priority controls, and notes timeline. |
| **Update Tickets** | Change status and priority inline on the detail page. |
| **Notes / Comments** | Add internal notes to any ticket with a persistent timeline. |

### Dashboard & Analytics

- **KPI Cards:** Total Tickets, Closed, In Progress, Open with trend indicators
- **Ticket Analytics Chart:** Daily ticket volume bar chart with day-of-week labels
- **Resolution Gauge:** Semi-circle gauge with hatched background pattern showing resolution rate
- **Team Collaboration:** Avatar-stacked recent activity feed
- **Ticket Queue:** Upcoming due tickets with color-coded items
- **Response Timer:** Persistent floating timer widget with play/pause/stop controls
- **Skeleton Loading:** Animated shimmer placeholders during data fetch

### Visual Design

- **Color Palette:** Two-tone deep forest green (`#1B4332` to `#52B788`) on white/light gray backgrounds
- **Rounded Corners:** Consistent 8-16px radii on cards, buttons, badges, inputs, and chart elements
- **Badges:** Pill-shaped status badges (Open/In Progress/Closed) and priority badges (Urgent/High/Medium/Low)
- **Buttons:** Filled primary CTAs, ghost buttons, bordered secondary buttons, green outline buttons
- **Typography:** Inter geometric sans, large bold KPI numerals with light supporting text
- **Data Viz:** Two-tone charts with subtle textures — hatched diagonal stripes for inactive gauge states

### Extra Features

- **CSV Export:** Download all tickets as CSV with one click
- **Auto-Refresh:** Ticket list auto-refreshes every 30 seconds
- **Copy Ticket ID:** Click to copy with visual feedback
- **Priority System:** Low/Medium/High/Urgent with color-coded badges
- **Keyboard Shortcuts:** `⌘F` to focus search, `Escape` to clear, `⌘Enter` to submit notes
- **404 Handling:** Friendly not-found state for invalid ticket IDs

## Database

Two PostgreSQL tables managed via NeonDB:

```sql
tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     TEXT UNIQUE NOT NULL,       -- e.g. TKT-001
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject       TEXT NOT NULL,
  description   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Open',       -- Open | In Progress | Closed
  priority      TEXT NOT NULL DEFAULT 'Medium',     -- Low | Medium | High | Urgent
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     TEXT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  note_text     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## API Endpoints

| Method | Endpoint | Description | Query Params |
|---|---|---|---|
| `POST` | `/api/tickets` | Create a new ticket | — |
| `GET` | `/api/tickets` | List all tickets | `?status=`, `?priority=`, `?search=` |
| `GET` | `/api/tickets/[ticket_id]` | Get single ticket with notes | — |
| `PUT` | `/api/tickets/[ticket_id]` | Update ticket status/priority + add note | — |
| `GET` | `/api/analytics` | Dashboard analytics data | — |

### POST /api/tickets

```json
// Request
{ "customer_name": "John Doe", "customer_email": "john@example.com", "subject": "Payment Issue", "description": "Unable to complete payment", "priority": "High" }

// Response (201)
{ "ticket_id": "TKT-001", "created_at": "2026-06-07T12:00:00.000Z" }
```

### PUT /api/tickets/{ticket_id}

```json
// Request
{ "status": "Closed", "priority": "Low", "note_text": "Issue resolved via refund" }

// Response
{ "success": true, "updated_at": "2026-06-07T12:30:00.000Z" }
```

## Getting Started

### Prerequisites

- Node.js 20+
- A NeonDB PostgreSQL database

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd cms
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Add your NeonDB connection string to .env.local
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# 4. Initialize the database tables
npm run db:init

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:init` | Initialize database tables |

## Project Structure

```
app/
├── api/
│   ├── analytics/route.ts      # Dashboard analytics endpoint
│   └── tickets/
│       ├── route.ts             # List + Create tickets
│       └── [ticket_id]/route.ts # Get + Update single ticket
├── components/
│   ├── BarChart.tsx             # Reusable bar chart
│   ├── GaugeChart.tsx           # Semi-circle resolution gauge
│   ├── Header.tsx               # App header with search + user
│   ├── Navbar.tsx               # Sidebar re-export (backward compat)
│   ├── NotesSection.tsx         # Notes timeline + composer
│   ├── PieChart.tsx             # Priority distribution pie chart
│   ├── PriorityBadge.tsx        # Pill badge for priority
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── StatsCard.tsx            # Dashboard stat card
│   ├── StatusBadge.tsx          # Pill badge for status
│   └── TicketChart.tsx          # Daily ticket volume bar chart
├── lib/db.ts                    # Database connection pool
├── globals.css                  # Design tokens + utility classes
├── layout.tsx                   # Root layout (sidebar + header)
├── page.tsx                     # Dashboard page
├── error.tsx                    # Global error boundary
├── loading.tsx                  # Route-level loading
└── tickets/
    ├── page.tsx                 # All tickets list
    ├── new/page.tsx             # Create ticket form
    └── [ticket_id]/page.tsx     # Ticket detail page
scripts/
├── init-db.mjs                  # Database initialization script
```

## Design System

The UI uses CSS custom properties defined in `app/globals.css`:

- **Spacing:** 4px increments with generous whitespace
- **Radii:** `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-full: 9999px`
- **Shadows:** `--shadow-xs` through `--shadow-lg` with subtle elevation
- **Green palette:** 10 shades from `--green-950: #0D2B1D` to `--green-50: #F0FDF4`
- **Status colors:** Blue (Open), Amber (In Progress), Emerald (Closed)
- **Priority colors:** Red (Urgent), Orange (High), Yellow (Medium), Green (Low)
