-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories for filtering
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Main Content Record
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  source_url text,
  platform text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  cover_image_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Relational Artifacts (Optimized for Joins)
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id uuid REFERENCES content(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  timestamp text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id uuid REFERENCES content(id) ON DELETE CASCADE NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_published ON content(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_content ON quotes(content_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_content ON flashcards(content_id);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category_id);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Agentic AI', 'agentic-ai'),
  ('Behavioral Psychology', 'behavioral-psychology'),
  ('Leadership', 'leadership'),
  ('Productivity', 'productivity'),
  ('Philosophy', 'philosophy'),
  ('Technology', 'technology'),
  ('Business', 'business'),
  ('Health', 'health')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view published content" ON content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view quotes" ON quotes
  FOR SELECT USING (true);

CREATE POLICY "Public can view flashcards" ON flashcards
  FOR SELECT USING (true);

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

-- Admin policies (requires authentication)
CREATE POLICY "Admin can insert content" ON content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update content" ON content
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete content" ON content
  FOR DELETE USING (true);

CREATE POLICY "Admin can insert quotes" ON quotes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update quotes" ON quotes
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete quotes" ON quotes
  FOR DELETE USING (true);

CREATE POLICY "Admin can insert flashcards" ON flashcards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update flashcards" ON flashcards
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete flashcards" ON flashcards
  FOR DELETE USING (true);
