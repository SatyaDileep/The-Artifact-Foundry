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
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  source_url text,
  platform text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  cover_image_url text,
  transcript text,
  tags jsonb,
  role_slugs jsonb,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Persisted transcript/context used for RAG indexing (added to existing tables)
ALTER TABLE content ADD COLUMN IF NOT EXISTS transcript text;

-- Career Role Paths (primary navigation)
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text UNIQUE NOT NULL,
  title text,
  tagline text,
  description text,
  accent text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Curated sources for each role path (the "taste" layer)
CREATE TABLE IF NOT EXISTS role_sources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  title text,
  domain text,
  url text,
  note text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (role_id, name)
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

-- Top Moments: titled, timestamped summaries for the deep-dive
CREATE TABLE IF NOT EXISTS top_moments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id uuid REFERENCES content(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  timestamp_ref text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_published ON content(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_content ON quotes(content_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_content ON flashcards(content_id);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category_id);
CREATE INDEX IF NOT EXISTS idx_top_moments_content ON top_moments(content_id);
CREATE INDEX IF NOT EXISTS idx_roles_order ON roles(sort_order);
CREATE INDEX IF NOT EXISTS idx_role_sources_role ON role_sources(role_id);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);

-- Insert default career roles
INSERT INTO roles (slug, name, title, tagline, description, accent, sort_order) VALUES
  ('product-manager', 'Product Manager', 'Become a Senior Product Manager',
   'Learn how the best PMs think, decide, and communicate.',
   'The path for aspiring product managers in India. Instead of chasing trending posts, follow the people working product leaders actually cite — the frameworks, judgment, and habits that separate juniors from seniors.',
   'from-indigo-500 to-violet-500', 1),
  ('software-architect', 'Software Engineer & Architect', 'Become a Senior Engineer & Architect',
   'The signal behind systems design, clean code, and engineering careers.',
   'For engineers who want to move from writing code to designing systems. Curated from what working seniors actually share on scaling, architecture, and getting hired in Big Tech.',
   'from-emerald-500 to-teal-500', 2),
  ('data-scientist', 'Data Scientist', 'Become a Senior Data Scientist',
   'From Kaggle notebooks to production ML systems.',
   'The path for data professionals who want to move beyond tutorials. Follow what working data scientists and ML engineers actually recommend — fundamentals, production engineering, and decision science.',
   'from-amber-500 to-orange-500', 3),
  ('designer', 'Product Designer', 'Become a Senior Product Designer',
   'Build taste for interfaces, systems, and human behavior.',
   'For designers and developer-designers who want real craft. Curated from the sources working designers actually cite for visual hierarchy, UX foundations, and design careers.',
   'from-pink-500 to-rose-500', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert default role sources
INSERT INTO role_sources (role_id, name, title, domain, url, note, sort_order)
SELECT r.id, s.name, s.title, s.domain, s.url, s.note, s.sort_order
FROM roles r
JOIN (
  VALUES
    ('product-manager', 'Shreyas Doshi', 'Ex-Stripe, ex-Twitter PM', 'X / Twitter', 'https://twitter.com/shreyas', 'A masterclass in product judgment. His threads on PM mental models are the most-shared content among working product managers.', 1),
    ('product-manager', 'Lenny Rachitsky', 'Ex-Airbnb PM', 'Newsletter & Podcast', 'https://www.lennysnewsletter.com/', 'Interviews with PMs at Airbnb, Stripe, and Netflix on how real product decisions actually get made.', 2),
    ('product-manager', 'Marty Cagan', 'Author of ''Inspired''', 'Book & Blog', 'https://www.svpg.com/', 'The canonical book on what great product teams do differently. Start here, before any framework.', 3),
    ('product-manager', 'Sriram Krishnan', 'Ex-Meta, ex-Twitter PM', 'X / Twitter', 'https://twitter.com/sriramk', 'An Indian-origin PM who rose to the top of Big Tech. Practical takes on careers and product, not hype.', 4),
    ('product-manager', 'Julie Zhuo', 'Ex-VP of Design at Facebook', 'Newsletter', 'https://www.lookingglass.blog/', 'Writes with unusual clarity about management, strategy, and the craft of building products.', 5),
    ('product-manager', 'Products That Count', 'PM community', 'Community & Podcast', 'https://productsthatcount.com/', 'Free talks from senior PMs. A low-effort way to see what the industry is discussing each week.', 6),
    ('software-architect', 'Martin Fowler', 'Chief Scientist, ThoughtWorks', 'Blog', 'https://martinfowler.com/', 'The architect''s architect. Patterns, refactoring, and the craft of software design written with rare rigor.', 1),
    ('software-architect', 'The Pragmatic Engineer', 'Gergely Orosz', 'Newsletter', 'https://newsletter.pragmaticengineer.com/', 'What Big Tech engineering is actually like — scaling teams, interview prep, and compensation data.', 2),
    ('software-architect', 'ByteByteGo', 'Alex Xu', 'Newsletter & YouTube', 'https://bytebytego.com/', 'The single most-shared resource for system design interviews in India. Visual, practical, current.', 3),
    ('software-architect', 'Kent Beck', 'Father of XP & TDD', 'X / Twitter', 'https://twitter.com/KentBeck', 'Timeless advice on writing code that survives contact with reality. Short, dense, quotable.', 4),
    ('software-architect', 'Paul Graham', 'Y Combinator co-founder', 'Essays', 'https://paulgraham.com/articles.html', 'Startup-era engineering and founder thinking that engineers across the world quote constantly.', 5),
    ('software-architect', 'System Design Primer', 'donnemartin', 'GitHub', 'https://github.com/donnemartin/system-design-primer', 'The free open-source repo most aspirants start from. Learn it once, then read the paid guides.', 6),
    ('data-scientist', 'Andrew Ng', 'Founder, DeepLearning.AI', 'Courses & Newsletter', 'https://www.deeplearning.ai/', 'The starting point for nearly every data scientist. Teaches the fundamentals with unusual clarity.', 1),
    ('data-scientist', 'Chip Huyen', 'Author, ''Designing ML Systems''', 'Book & Blog', 'https://huyenchip.com/', 'The gap between ML in a notebook and ML in production. The book senior ML engineers recommend.', 2),
    ('data-scientist', 'Cassie Kozyrkov', 'Google''s first Chief Decision Scientist', 'X / Twitter & Blog', 'https://twitter.com/quaesita', 'The best voice on making decisions with data — statistics without the dogma.', 3),
    ('data-scientist', 'StatQuest', 'Josh Starmer', 'YouTube', 'https://www.youtube.com/@StatQuest', 'The clearest visual explanations of statistics and ML concepts. Perfect when a paper confuses you.', 4),
    ('data-scientist', 'Kaggle', 'Data science community', 'Community', 'https://www.kaggle.com/', 'Where Indian data scientists prove themselves. Study winning solutions to learn competitive taste.', 5),
    ('data-scientist', 'The Batch', 'Weekly AI digest', 'Newsletter', 'https://www.deeplearning.ai/the-batch/', 'A weekly AI news digest that keeps you current without the noise of X timelines.', 6),
    ('designer', 'Refactoring UI', 'Adam Wathan & Steve Schoger', 'Book & Tutorial', 'https://www.refactoringui.com/', 'The most actionable resource for building beautiful UIs without a design degree. Read it twice.', 1),
    ('designer', 'Don Norman', 'Author, ''The Design of Everyday Things''', 'Book', 'https://jnd.org/', 'The foundation of UX thinking — why good design is invisible and bad design blames the user.', 2),
    ('designer', 'Julie Zhuo', 'Ex-VP of Design at Facebook', 'Newsletter', 'https://www.lookingglass.blog/', 'Design leadership and craft written with unusual honesty. Essential for career progression.', 3),
    ('designer', 'Tobias van Schneider', 'Indie designer', 'Newsletter', 'https://www.tvsv.de/', 'The indie design voice — personal brand, craft, and building products without a team.', 4),
    ('designer', 'Interaction Design Foundation', 'IxDF', 'Courses', 'https://www.interaction-design.org/', 'Structured, respected UX education with certifications employers actually recognize.', 5),
    ('designer', 'Mobbin & Dribbble', 'Reference libraries', 'Reference', 'https://mobbin.com/', 'Taste calibration — study what strong products do before you invent patterns from scratch.', 6)
) AS s(slug, name, title, domain, url, note, sort_order)
ON s.slug = r.slug
ON CONFLICT (role_id, name) DO NOTHING;

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
ALTER TABLE top_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view published content" ON content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view quotes" ON quotes
  FOR SELECT USING (true);

CREATE POLICY "Public can view flashcards" ON flashcards
  FOR SELECT USING (true);

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view top moments" ON top_moments
  FOR SELECT USING (true);

CREATE POLICY "Public can view roles" ON roles
  FOR SELECT USING (true);

CREATE POLICY "Public can view role sources" ON role_sources
  FOR SELECT USING (true);

-- -------------------------------------------------------------------------
-- Production hardening: admin-only writes + admin read of drafts
-- -------------------------------------------------------------------------
-- Admin allowlist. Insert the owner's email in the Supabase SQL editor:
--   INSERT INTO admin_users (email) VALUES ('you@example.com');
CREATE TABLE IF NOT EXISTS admin_users (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email'));
$$;

CREATE POLICY "Admins can view admin list" ON admin_users
  FOR SELECT USING (is_admin());

-- Admins can read every row (drafts included); the public policy above still
-- limits visitors to published content only.
CREATE POLICY "Admins can view all content" ON content
  FOR SELECT USING (is_admin());

-- Replace broad "any authenticated user" write access with admin-only.
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content;
DROP POLICY IF EXISTS "Authenticated users can update content" ON content;
DROP POLICY IF EXISTS "Authenticated users can delete content" ON content;
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can delete quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can insert flashcards" ON flashcards;
DROP POLICY IF EXISTS "Authenticated users can update flashcards" ON flashcards;
DROP POLICY IF EXISTS "Authenticated users can delete flashcards" ON flashcards;
DROP POLICY IF EXISTS "Authenticated users can insert top moments" ON top_moments;
DROP POLICY IF EXISTS "Authenticated users can update top moments" ON top_moments;
DROP POLICY IF EXISTS "Authenticated users can delete top moments" ON top_moments;
DROP POLICY IF EXISTS "Authenticated users can insert roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can update roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can delete roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can insert role sources" ON role_sources;
DROP POLICY IF EXISTS "Authenticated users can update role sources" ON role_sources;
DROP POLICY IF EXISTS "Authenticated users can delete role sources" ON role_sources;

CREATE POLICY "Admins can insert content" ON content
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update content" ON content
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete content" ON content
  FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert quotes" ON quotes
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update quotes" ON quotes
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete quotes" ON quotes
  FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert flashcards" ON flashcards
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update flashcards" ON flashcards
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete flashcards" ON flashcards
  FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert top moments" ON top_moments
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update top moments" ON top_moments
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete top moments" ON top_moments
  FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert roles" ON roles
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update roles" ON roles
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete roles" ON roles
  FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert role sources" ON role_sources
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update role sources" ON role_sources
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete role sources" ON role_sources
  FOR DELETE USING (is_admin());

-- -------------------------------------------------------------------------
-- Semantic search (RAG): artifact chunks + pgvector
-- -------------------------------------------------------------------------
-- Supabase installs extensions into the `extensions` schema; reference types
-- explicitly so these RPCs work from any search_path. (If `vector` is already
-- enabled in `public` on an existing project, drop the `WITH SCHEMA extensions`
-- clause and use `vector(384)` unqualified instead.)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Searchable chunks distilled from each artifact (quotes, flashcards, key
-- moments, transcript windows). Populated by the index-artifacts edge function,
-- which embeds with the free built-in gte-small model (384 dims) via
-- Supabase.ai.Session — no external embedding API or key required.
CREATE TABLE IF NOT EXISTS artifact_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  text text NOT NULL,
  token_count int,
  embedding extensions.vector(384),
  created_at timestamptz DEFAULT now(),
  UNIQUE (content_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_chunks_content ON artifact_chunks(content_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON artifact_chunks USING hnsw (embedding extensions.vector_cosine_ops);

ALTER TABLE artifact_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view chunks" ON artifact_chunks
  FOR SELECT USING (is_admin());

-- Vector search over published artifacts. query_embedding is passed as text
-- (e.g. "[0.1,0.2,...]") so PostgREST can marshal it — we cast to vector inside.
CREATE OR REPLACE FUNCTION search_artifacts(
  query_embedding text,
  match_count int DEFAULT 6
) RETURNS TABLE (
  chunk_id uuid,
  content_id uuid,
  chunk_text text,
  slug text,
  title text,
  category_name text,
  similarity float
)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    ac.id,
    ac.content_id,
    ac.text,
    c.slug,
    c.title,
    cat.name,
    1 - (ac.embedding <=> query_embedding::extensions.vector) AS similarity
  FROM artifact_chunks ac
  JOIN content c ON c.id = ac.content_id AND c.is_published = true
  LEFT JOIN categories cat ON cat.id = c.category_id
  ORDER BY ac.embedding <=> query_embedding::extensions.vector
  LIMIT match_count;
$$;

-- Keyword fallback used when chunks aren't embedded yet or vector search fails.
CREATE OR REPLACE FUNCTION search_artifacts_keyword(
  q text,
  match_count int DEFAULT 6
) RETURNS TABLE (
  chunk_id uuid,
  content_id uuid,
  chunk_text text,
  slug text,
  title text,
  category_name text,
  similarity float
)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    ac.id,
    ac.content_id,
    ac.text,
    c.slug,
    c.title,
    cat.name,
    0.5::float
  FROM artifact_chunks ac
  JOIN content c ON c.id = ac.content_id AND c.is_published = true
  LEFT JOIN categories cat ON cat.id = c.category_id
  WHERE ac.text ILIKE '%' || q || '%' OR c.title ILIKE '%' || q || '%'
  ORDER BY c.created_at DESC
  LIMIT match_count;
$$;
