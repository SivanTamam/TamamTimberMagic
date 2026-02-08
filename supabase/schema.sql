-- Tamam Timber Magic Database Schema
-- Run this in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(255) NOT NULL,
  name_he VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_he TEXT,
  price_from DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_to DECIMAL(10, 2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en VARCHAR(255) NOT NULL,
  title_he VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_he TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requests_customer_id ON requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_gallery_is_featured ON gallery(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Public read access for services and gallery
CREATE POLICY "Public can read active services" ON services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can read gallery" ON gallery
  FOR SELECT USING (TRUE);

-- Service role has full access (for Netlify Functions)
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

-- Insert sample data for services
INSERT INTO services (name_en, name_he, description_en, description_he, price_from, price_to, is_active) VALUES
('Custom Furniture', 'ריהוט מותאם אישית', 'Handcrafted custom furniture tailored to your exact specifications and style preferences.', 'ריהוט בעבודת יד מותאם למפרט ולסגנון שלך.', 2000, 15000, TRUE),
('Kitchen Cabinets', 'ארונות מטבח', 'Beautiful, functional kitchen cabinets designed and built to maximize your space.', 'ארונות מטבח יפים ופונקציונליים שתוכננו ונבנו למקסם את המרחב שלך.', 5000, 30000, TRUE),
('Wood Restoration', 'שיקום עץ', 'Expert restoration of antique and damaged wooden furniture and fixtures.', 'שיקום מומחה של ריהוט ואביזרי עץ עתיקים ופגומים.', 500, 5000, TRUE),
('Built-in Wardrobes', 'ארונות קיר', 'Custom built-in wardrobes that maximize storage while complementing your interior design.', 'ארונות קיר מותאמים אישית שממקסמים אחסון תוך השלמה לעיצוב הפנים שלך.', 3000, 20000, TRUE),
('Wooden Decks', 'דקים מעץ', 'Durable and beautiful outdoor wooden decks for gardens and patios.', 'דקים חיצוניים עמידים ויפים מעץ לגינות ומרפסות.', 4000, 25000, TRUE),
('Door & Window Frames', 'משקופים ומסגרות', 'Custom wooden door and window frames crafted with precision.', 'משקופי דלתות וחלונות מעץ בהתאמה אישית בדיוק מרבי.', 1000, 8000, TRUE);

-- Insert sample gallery items
INSERT INTO gallery (title_en, title_he, description_en, description_he, image_url, thumbnail_url, category, is_featured) VALUES
('Modern Oak Dining Table', 'שולחן אוכל מאלון מודרני', 'A stunning 8-seater dining table crafted from solid oak with a natural finish.', 'שולחן אוכל מרהיב ל-8 סועדים מאלון מלא עם גימור טבעי.', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400', 'Furniture', TRUE),
('Walnut Kitchen Cabinets', 'ארונות מטבח מאגוז', 'Complete kitchen renovation with custom walnut cabinets and integrated lighting.', 'שיפוץ מטבח מלא עם ארונות אגוז מותאמים אישית ותאורה משולבת.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'Kitchen', TRUE),
('Restored Antique Dresser', 'שידה עתיקה משוחזרת', 'Victorian-era dresser carefully restored to its original glory.', 'שידה מתקופת ויקטוריה ששוחזרה בקפידה לתפארתה המקורית.', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 'Restoration', TRUE),
('Cedar Garden Deck', 'דק גינה מארז', 'Spacious outdoor deck made from premium cedar wood with built-in seating.', 'דק חיצוני מרווח מעץ ארז פרימיום עם ישיבה מובנית.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', 'Outdoor', FALSE),
('Custom Bookshelf Wall', 'קיר ספריה מותאם', 'Floor-to-ceiling bookshelf system with integrated desk workspace.', 'מערכת מדפי ספרים מרצפה עד תקרה עם שולחן עבודה משולב.', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400', 'Furniture', FALSE);
