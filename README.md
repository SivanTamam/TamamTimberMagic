# Tamam Timber Magic

A modern, bilingual (English/Hebrew) portfolio website for Tamam, a master carpenter with 40+ years of experience across South Africa, UK, and Israel.

## Features

- **Bilingual Support**: Full English and Hebrew translations with RTL support
- **Home/About Section**: Introducing Tamam and his expertise
- **Services Page**: Dynamic services loaded from database
- **Gallery Page**: Showcase of completed projects with lightbox view
- **Request Form**: Customer quote requests with email notifications
- **Admin Portal**: Secure admin area for managing:
  - Gallery images (with image compression)
  - Services
  - Customer requests
  - Invoices (with PDF generation)
  - Dashboard with statistics and charts

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Backend**: Netlify Functions
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Charts**: Chart.js + react-chartjs-2
- **PDF Generation**: jsPDF
- **Image Compression**: browser-image-compression

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Netlify account (for deployment)
- Resend account (for email notifications)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TamamTimberMagic
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_USERNAME=tamam
ADMIN_PASSWORD=your_secure_password
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_email@example.com
```

5. Set up the database:
   - Go to your Supabase project
   - Open the SQL Editor
   - Run the contents of `supabase/schema.sql`

6. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Development with Netlify Functions

To test Netlify Functions locally:
```bash
npm run netlify:dev
```

This will start both the Vite dev server and Netlify Functions.

## Project Structure

```
TamamTimberMagic/
├── netlify/
│   └── functions/          # Netlify serverless functions
│       ├── auth.ts
│       ├── services.ts
│       ├── gallery.ts
│       ├── requests.ts
│       ├── customers.ts
│       ├── invoices.ts
│       └── dashboard.ts
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   └── layout/         # Layout components (Navbar, Footer)
│   ├── contexts/           # React contexts (Language, Auth)
│   ├── i18n/               # Translations
│   ├── pages/              # Page components
│   │   └── admin/          # Admin portal pages
│   ├── services/           # API and Supabase clients
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── schema.sql          # Database schema
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── netlify.toml
```

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy!

Or use the Netlify CLI:
```bash
npm run build
netlify deploy --prod
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `ADMIN_EMAIL` | Email address to receive notifications |

## Admin Access

Navigate to `/admin` and log in with your admin credentials.

Default credentials (change in production!):
- Username: `tamam`
- Password: `admin123`

## License

Private - All rights reserved.

## Author

Built with ❤️ for Tamam Timber Magic
