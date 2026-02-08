# Database Migrations

This folder contains SQL migrations for the Tamam Timber Magic database.

## Migration Files

Run these migrations **in order** in your Supabase SQL Editor:

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Creates all database tables (customers, services, gallery, requests, invoices, invoice_items) |
| `002_indexes.sql` | Creates indexes for better query performance |
| `003_rls_policies.sql` | Enables Row Level Security and creates access policies |
| `004_seed_data.sql` | **(Optional)** Inserts sample services and gallery items |

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order
4. Click **Run** for each one

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Using psql (Direct PostgreSQL)

```bash
# Connect to your database
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_indexes.sql
\i supabase/migrations/003_rls_policies.sql
\i supabase/migrations/004_seed_data.sql
```

## Creating New Migrations

When adding new features, create a new migration file:

```
005_add_feature_name.sql
```

Always use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` to make migrations idempotent (safe to run multiple times).

## Rollback

To rollback, you'll need to manually write DROP statements. Example:

```sql
-- Rollback 001_initial_schema.sql
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
```

## Environment Variables

After running migrations, make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
