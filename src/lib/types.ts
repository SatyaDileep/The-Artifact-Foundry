export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Quote {
  id: string;
  content_id: string;
  text: string;
  timestamp?: string | null;
}

export interface Flashcard {
  id: string;
  content_id: string;
  front: string;
  back: string;
}

export interface TopMoment {
  id: string;
  content_id: string;
  title: string;
  summary: string;
  timestamp_ref?: string | null;
}

export interface Content {
  id: string;
  slug: string;
  title: string;
  source_url?: string | null;
  platform?: string | null;
  category_id?: string | null;
  cover_image_url?: string | null;
  transcript?: string | null;
  tags?: string[] | null;
  role_slugs?: string[] | null;
  is_published: boolean;
  created_at: string;
  category?: Category | null;
  quotes: Quote[];
  flashcards: Flashcard[];
  top_moments: TopMoment[];
}

export interface RoleSource {
  id: string;
  role_id: string;
  name: string;
  title?: string | null;
  domain?: string | null;
  url?: string | null;
  note?: string | null;
  sort_order?: number | null;
}

export interface Role {
  id: string;
  slug: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  accent: string;
  sort_order?: number | null;
  sources: RoleSource[];
}

export interface RandomQuote extends Quote {
  content: Pick<
    Content,
    "id" | "slug" | "title" | "source_url" | "category"
  > & {
    category: Category | null;
  };
}
