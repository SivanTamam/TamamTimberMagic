-- Migration: 004_seed_data
-- Description: Insert initial sample data for services and gallery
-- Created: 2026-01-16
-- Note: This is optional - only run if you want sample data

-- Insert sample services
INSERT INTO services (name_en, name_he, description_en, description_he, price_from, price_to, is_active) VALUES
('Custom Furniture', 'ריהוט מותאם אישית', 'Handcrafted custom furniture tailored to your exact specifications and style preferences.', 'ריהוט בעבודת יד מותאם למפרט ולסגנון שלך.', 2000, 15000, TRUE),
('Kitchen Cabinets', 'ארונות מטבח', 'Beautiful, functional kitchen cabinets designed and built to maximize your space.', 'ארונות מטבח יפים ופונקציונליים שתוכננו ונבנו למקסם את המרחב שלך.', 5000, 30000, TRUE),
('Wood Restoration', 'שיקום עץ', 'Expert restoration of antique and damaged wooden furniture and fixtures.', 'שיקום מומחה של ריהוט ואביזרי עץ עתיקים ופגומים.', 500, 5000, TRUE),
('Built-in Wardrobes', 'ארונות קיר', 'Custom built-in wardrobes that maximize storage while complementing your interior design.', 'ארונות קיר מותאמים אישית שממקסמים אחסון תוך השלמה לעיצוב הפנים שלך.', 3000, 20000, TRUE),
('Wooden Decks', 'דקים מעץ', 'Durable and beautiful outdoor wooden decks for gardens and patios.', 'דקים חיצוניים עמידים ויפים מעץ לגינות ומרפסות.', 4000, 25000, TRUE),
('Pergolas', 'פרגולות', 'Custom wooden pergolas for outdoor shade and style.', 'פרגולות עץ מותאמות אישית להצללה וסגנון בחוץ.', 3000, 20000, TRUE),
('Wooden Stairs', 'מדרגות עץ', 'Beautiful custom wooden staircases and railings.', 'גרמי מדרגות ומעקות עץ יפים בהתאמה אישית.', 5000, 25000, TRUE),
('Door & Window Frames', 'משקופים ומסגרות', 'Custom wooden door and window frames crafted with precision.', 'משקופי דלתות וחלונות מעץ בהתאמה אישית בדיוק מרבי.', 1000, 8000, TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample gallery items (using local images)
INSERT INTO gallery (title_en, title_he, description_en, description_he, image_url, thumbnail_url, category, is_featured) VALUES
('Covered Wooden Deck', 'דק עץ מקורה', 'Beautiful covered wooden deck with stairs and built-in seating area.', 'דק עץ מקורה יפהפה עם מדרגות ואזור ישיבה מובנה.', '/img/gallery-deck-1.jpeg', '/img/gallery-deck-1.jpeg', 'Decks', TRUE),
('Garden Pergola', 'פרגולה לגינה', 'Custom wooden pergola with corrugated roof, perfect for outdoor living.', 'פרגולת עץ מותאמת אישית עם גג גלי, מושלמת לחיים בחוץ.', '/img/gallery-pergola-1.jpeg', '/img/gallery-pergola-1.jpeg', 'Pergolas', TRUE),
('Wooden Pergola Structure', 'מבנה פרגולה מעץ', 'Sturdy wooden pergola with scenic mountain views.', 'פרגולת עץ יציבה עם נוף הרים מרהיב.', '/img/gallery-pergola-2.jpeg', '/img/gallery-pergola-2.jpeg', 'Pergolas', TRUE),
('Custom Wooden Staircase', 'גרם מדרגות עץ מותאם', 'Elegant L-shaped wooden staircase with matching handrail.', 'גרם מדרגות עץ אלגנטי בצורת L עם מעקה תואם.', '/img/gallery-stairs-1.jpeg', '/img/gallery-stairs-1.jpeg', 'Stairs', TRUE),
('Patio Pergola', 'פרגולה לפטיו', 'Spacious patio pergola with transparent roofing for natural light.', 'פרגולת פטיו מרווחת עם גג שקוף לאור טבעי.', '/img/gallery-pergola-3.jpeg', '/img/gallery-pergola-3.jpeg', 'Pergolas', FALSE),
('Modern Wooden Stairs', 'מדרגות עץ מודרניות', 'Clean modern staircase with dark wood finish and wooden handrail.', 'גרם מדרגות מודרני ונקי עם גימור עץ כהה ומעקה עץ.', '/img/gallery-stairs-2.jpeg', '/img/gallery-stairs-2.jpeg', 'Stairs', FALSE)
ON CONFLICT DO NOTHING;
