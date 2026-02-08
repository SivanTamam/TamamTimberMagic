-- Migration: 003_rls_policies
-- Description: Enable Row Level Security and create access policies
-- Created: 2026-01-16

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Public read access for services and gallery (for website visitors)
CREATE POLICY "Public can read active services" ON services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can read gallery" ON gallery
  FOR SELECT USING (TRUE);

-- Service role has full access (for Netlify Functions backend)
CREATE POLICY "Service role has full access to customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to services" ON services
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to gallery" ON gallery
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to requests" ON requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to invoice_items" ON invoice_items
  FOR ALL USING (auth.role() = 'service_role');
