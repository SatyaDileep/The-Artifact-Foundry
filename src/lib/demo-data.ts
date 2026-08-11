import type { Category, Content, RandomQuote, Role } from "./types";

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_ADMIN_EMAIL = "curator@artifactfoundry.demo";

export const demoCategories: Category[] = [
  { id: "demo-cat-1", name: "Agentic AI", slug: "agentic-ai" },
  { id: "demo-cat-2", name: "Behavioral Psychology", slug: "behavioral-psychology" },
  { id: "demo-cat-3", name: "Leadership", slug: "leadership" },
  { id: "demo-cat-4", name: "Productivity", slug: "productivity" },
  { id: "demo-cat-5", name: "Philosophy", slug: "philosophy" },
  { id: "demo-cat-6", name: "Technology", slug: "technology" },
  { id: "demo-cat-7", name: "Business", slug: "business" },
  { id: "demo-cat-8", name: "Health", slug: "health" },
];

export const demoContent: Content[] = [
  {
    id: "demo-atomic-habits",
    slug: "atomic-habits",
    title: "Atomic Habits — How Tiny Changes Compound",
    source_url: "https://www.youtube.com/watch?v=U_nzqnXWvSo",
    platform: "YouTube",
    category_id: "demo-cat-4",
    cover_image_url: null,
    tags: ["Habits", "Systems", "Identity"],
    is_published: true,
    created_at: "2026-07-20T09:00:00Z",
    category: demoCategories[3],
    quotes: [
      {
        id: "demo-q1",
        content_id: "demo-atomic-habits",
        text: "You do not rise to the level of your goals. You fall to the level of your systems.",
        timestamp: "12:40",
      },
      {
        id: "demo-q2",
        content_id: "demo-atomic-habits",
        text: "Every action you take is a vote for the type of person you wish to become.",
        timestamp: "18:05",
      },
      {
        id: "demo-q3",
        content_id: "demo-atomic-habits",
        text: "Habits are the compound interest of self-improvement.",
        timestamp: "03:15",
      },
    ],
    flashcards: [
      {
        id: "demo-f1",
        content_id: "demo-atomic-habits",
        front: "What is the 1% rule of habit change?",
        back: "Improving by just 1% every day compounds to roughly 37x better after a year.",
      },
      {
        id: "demo-f2",
        content_id: "demo-atomic-habits",
        front: "What are the four laws of behavior change?",
        back: "Make it obvious, make it attractive, make it easy, make it satisfying.",
      },
      {
        id: "demo-f3",
        content_id: "demo-atomic-habits",
        front: "Why do people fail to maintain habits?",
        back: "They focus on goals and outcomes instead of the systems and identity behind the behavior.",
      },
      {
        id: "demo-f4",
        content_id: "demo-atomic-habits",
        front: "What is habit stacking?",
        back: "Pairing a new habit with an existing one: 'After I [current habit], I will [new habit].'",
      },
      {
        id: "demo-f5",
        content_id: "demo-atomic-habits",
        front: "What is the two-minute rule?",
        back: "Scale any habit down to under two minutes to lower the barrier to starting.",
      },
    ],
    top_moments: [
      {
        id: "demo-m1",
        content_id: "demo-atomic-habits",
        title: "Systems beat goals",
        summary:
          "Winners and losers share the same goals. What separates them is the system of small daily decisions.",
        timestamp_ref: "06:20",
      },
      {
        id: "demo-m2",
        content_id: "demo-atomic-habits",
        title: "Identity-based habits",
        summary:
          "The most powerful shift is changing who you believe you are, not just what you want to achieve.",
        timestamp_ref: "18:05",
      },
      {
        id: "demo-m3",
        content_id: "demo-atomic-habits",
        title: "Design the environment",
        summary:
          "Make good habits the path of least resistance by shaping your surroundings before willpower is needed.",
        timestamp_ref: "24:10",
      },
    ],
  },
  {
    id: "demo-psych-money",
    slug: "psychology-of-money",
    title: "The Psychology of Money — Rich vs Poor Thinking",
    source_url: "https://open.spotify.com/episode/4lLpXoUcMk1xVgIYrQ0g2A",
    platform: "Podcast",
    category_id: "demo-cat-2",
    cover_image_url: null,
    tags: ["Money", "Wealth", "Mindset"],
    is_published: true,
    created_at: "2026-07-12T14:30:00Z",
    category: demoCategories[1],
    quotes: [
      {
        id: "demo-pq1",
        content_id: "demo-psych-money",
        text: "Doing well with money has a little to do with how smart you are and a lot to do with how you behave.",
        timestamp: "02:50",
      },
      {
        id: "demo-pq2",
        content_id: "demo-psych-money",
        text: "Wealth is what you don't see. It's the money you didn't spend on things you didn't need.",
        timestamp: "21:15",
      },
    ],
    flashcards: [
      {
        id: "demo-pf1",
        content_id: "demo-psych-money",
        front: "What is the difference between being rich and being wealthy?",
        back: "Rich is your current income; wealth is the money you keep and grow over time.",
      },
      {
        id: "demo-pf2",
        content_id: "demo-psych-money",
        front: "What is the 'Peacock Effect'?",
        back: "Spending to signal status, which undermines long-term wealth building.",
      },
    ],
    top_moments: [
      {
        id: "demo-pm1",
        content_id: "demo-psych-money",
        title: "Behavior beats intelligence",
        summary:
          "Financial success is driven more by habits and temperament than by raw IQ or knowledge.",
        timestamp_ref: "02:50",
      },
      {
        id: "demo-pm2",
        content_id: "demo-psych-money",
        title: "The power of compounding",
        summary:
          "Time is the most powerful force in investing; starting early matters more than being brilliant.",
        timestamp_ref: "15:40",
      },
    ],
  },
  {
    id: "demo-naval-wealth",
    slug: "naval-get-rich-without-getting-lucky",
    title: "Naval — How to Get Rich Without Getting Lucky",
    source_url: "https://www.youtube.com/watch?v=3qHkcs3kG44",
    platform: "YouTube",
    category_id: "demo-cat-7",
    cover_image_url: null,
    tags: ["Startups", "Wealth", "Leverage"],
    role_slugs: ["software-architect"],
    is_published: true,
    created_at: "2026-06-28T08:00:00Z",
    category: demoCategories[6],
    quotes: [
      {
        id: "demo-nq1",
        content_id: "demo-naval-wealth",
        text: "Seek wealth, not money. Wealth is assets that earn while you sleep.",
        timestamp: "04:10",
      },
      {
        id: "demo-nq2",
        content_id: "demo-naval-wealth",
        text: "Play long-term games with long-term people.",
        timestamp: "11:45",
      },
      {
        id: "demo-nq3",
        content_id: "demo-naval-wealth",
        text: "Leverage is a force multiplier for your judgment.",
        timestamp: "28:30",
      },
    ],
    flashcards: [
      {
        id: "demo-nf1",
        content_id: "demo-naval-wealth",
        front: "What are the three types of leverage?",
        back: "Labor (people working for you), capital (money working for you), and code/media (products that work for you).",
      },
      {
        id: "demo-nf2",
        content_id: "demo-naval-wealth",
        front: "What is 'specific knowledge'?",
        back: "Knowledge you can't be trained for; it's learned through curiosity and play, not schooling.",
      },
      {
        id: "demo-nf3",
        content_id: "demo-naval-wealth",
        front: "What is the difference between wealth and money?",
        back: "Money transfers wealth; wealth is the assets that generate income while you sleep.",
      },
    ],
    top_moments: [
      {
        id: "demo-nm1",
        content_id: "demo-naval-wealth",
        title: "Earn with your mind, not your time",
        summary:
          "Rent out your time and you'll always be limited; own assets and you scale without working more hours.",
        timestamp_ref: "04:10",
      },
      {
        id: "demo-nm2",
        content_id: "demo-naval-wealth",
        title: "Code and media are the great equalizers",
        summary:
          "These permissionless forms of leverage let anyone multiply output without needing a boss or capital.",
        timestamp_ref: "28:30",
      },
    ],
  },
  {
    id: "demo-pm-podcast",
    slug: "great-product-managers-decide",
    title: "Lenny's Podcast — How Great Product Managers Decide",
    source_url: "https://www.youtube.com/watch?v=vDcK8XJ0j1A",
    platform: "Podcast",
    category_id: "demo-cat-3",
    cover_image_url: null,
    tags: ["Product", "Decisions", "Roadmap"],
    role_slugs: ["product-manager"],
    is_published: true,
    created_at: "2026-07-25T10:00:00Z",
    category: demoCategories[2],
    quotes: [
      {
        id: "demo-pmq1",
        content_id: "demo-pm-podcast",
        text: "Your job as a PM is not to ship features. It's to produce outcomes.",
        timestamp: "02:10",
      },
      {
        id: "demo-pmq2",
        content_id: "demo-pm-podcast",
        text: "The best PMs are obsessed with the problem, not the solution.",
        timestamp: "08:30",
      },
      {
        id: "demo-pmq3",
        content_id: "demo-pm-podcast",
        text: "Prioritization is saying no to good ideas so that great ones survive.",
        timestamp: "17:45",
      },
    ],
    flashcards: [
      {
        id: "demo-pmf1",
        content_id: "demo-pm-podcast",
        front: "What's the difference between output and outcome for a PM?",
        back: "Output is features shipped; outcome is the change in user behavior or business results you produce.",
      },
      {
        id: "demo-pmf2",
        content_id: "demo-pm-podcast",
        front: "What is the 'jobs to be done' lens?",
        back: "Customers hire products to do a job; understand the job before falling in love with a solution.",
      },
      {
        id: "demo-pmf3",
        content_id: "demo-pm-podcast",
        front: "What does a PM actually own?",
        back: "The product vision and its outcome — not the team, not the code.",
      },
    ],
    top_moments: [
      {
        id: "demo-pmm1",
        content_id: "demo-pm-podcast",
        title: "Outcomes over outputs",
        summary:
          "Great PMs measure success by behavior change and business results, not by shipped features.",
        timestamp_ref: "02:10",
      },
      {
        id: "demo-pmm2",
        content_id: "demo-pm-podcast",
        title: "Problem obsession",
        summary:
          "Falling in love with the problem, not the solution, is what separates senior judgment.",
        timestamp_ref: "08:30",
      },
    ],
  },
  {
    id: "demo-pragmatic-engineer",
    slug: "scaling-engineering-beyond-100",
    title: "The Pragmatic Engineer — Scaling Engineering Beyond 100 Engineers",
    source_url: "https://newsletter.pragmaticengineer.com/",
    platform: "Article",
    category_id: "demo-cat-6",
    cover_image_url: null,
    tags: ["Engineering", "Scaling", "Teams"],
    role_slugs: ["software-architect", "product-manager"],
    is_published: true,
    created_at: "2026-07-18T16:00:00Z",
    category: demoCategories[5],
    quotes: [
      {
        id: "demo-preq1",
        content_id: "demo-pragmatic-engineer",
        text: "Scaling engineering is a people problem disguised as a technology problem.",
        timestamp: "01:20",
      },
      {
        id: "demo-preq2",
        content_id: "demo-pragmatic-engineer",
        text: "The senior engineer's job is to reduce complexity, not add it.",
        timestamp: "06:15",
      },
      {
        id: "demo-preq3",
        content_id: "demo-pragmatic-engineer",
        text: "Systems fail at the seams — that's where your attention belongs.",
        timestamp: "14:50",
      },
    ],
    flashcards: [
      {
        id: "demo-pref1",
        content_id: "demo-pragmatic-engineer",
        front: "Why do systems fail at the seams?",
        back: "Integration points concentrate hidden assumptions and mismatches between components.",
      },
      {
        id: "demo-pref2",
        content_id: "demo-pragmatic-engineer",
        front: "What changes when engineering teams pass ~100 people?",
        back: "Communication overhead grows; you need platform teams and stronger ownership boundaries.",
      },
      {
        id: "demo-pref3",
        content_id: "demo-pragmatic-engineer",
        front: "What is the senior engineer's primary responsibility?",
        back: "Managing complexity and growing others — not writing the most code.",
      },
    ],
    top_moments: [
      {
        id: "demo-prem1",
        content_id: "demo-pragmatic-engineer",
        title: "People, not technology",
        summary:
          "Most scaling failures come from communication and ownership breakdowns, not the stack.",
        timestamp_ref: "01:20",
      },
      {
        id: "demo-prem2",
        content_id: "demo-pragmatic-engineer",
        title: "Complexity is a tax",
        summary:
          "Every abstraction adds cost; senior engineers remove complexity rather than adding cleverness.",
        timestamp_ref: "06:15",
      },
    ],
  },
  {
    id: "demo-ml-systems",
    slug: "designing-machine-learning-systems",
    title: "Chip Huyen — Designing Machine Learning Systems",
    source_url: "https://www.youtube.com/watch?v=lhVwCnCFK0U",
    platform: "YouTube",
    category_id: "demo-cat-6",
    cover_image_url: null,
    tags: ["Machine Learning", "Production", "Systems"],
    role_slugs: ["data-scientist", "software-architect"],
    is_published: true,
    created_at: "2026-07-05T12:00:00Z",
    category: demoCategories[5],
    quotes: [
      {
        id: "demo-mlq1",
        content_id: "demo-ml-systems",
        text: "Most ML projects fail in production, not in the notebook.",
        timestamp: "00:50",
      },
      {
        id: "demo-mlq2",
        content_id: "demo-ml-systems",
        text: "Model performance is 10% of the problem; the system is the other 90%.",
        timestamp: "05:40",
      },
      {
        id: "demo-mlq3",
        content_id: "demo-ml-systems",
        text: "Your biggest bottleneck is not the algorithm — it's the data.",
        timestamp: "12:20",
      },
    ],
    flashcards: [
      {
        id: "demo-mlf1",
        content_id: "demo-ml-systems",
        front: "Why do ML systems fail in production?",
        back: "Data drift, distribution shifts, and integration complexity — not model accuracy.",
      },
      {
        id: "demo-mlf2",
        content_id: "demo-ml-systems",
        front: "What is data drift?",
        back: "The statistical properties of input data changing over time, degrading model performance.",
      },
      {
        id: "demo-mlf3",
        content_id: "demo-ml-systems",
        front: "What is the difference between a model and an ML system?",
        back: "A system includes data pipelines, monitoring, serving, and retraining — the model is just a component.",
      },
    ],
    top_moments: [
      {
        id: "demo-mlm1",
        content_id: "demo-ml-systems",
        title: "Production is the real challenge",
        summary:
          "Research solves the model; engineering solves reliability, monitoring, and data quality.",
        timestamp_ref: "00:50",
      },
      {
        id: "demo-mlm2",
        content_id: "demo-ml-systems",
        title: "Data is the bottleneck",
        summary:
          "Clean, consistent data pipelines matter more than tuning the algorithm.",
        timestamp_ref: "12:20",
      },
    ],
  },
  {
    id: "demo-refactoring-ui",
    slug: "refactoring-ui-design-principles",
    title: "Refactoring UI — Design Principles That Make Interfaces Look Great",
    source_url: "https://www.refactoringui.com/",
    platform: "Web",
    category_id: "demo-cat-6",
    cover_image_url: null,
    tags: ["Design", "UI", "Frontend"],
    role_slugs: ["designer", "software-architect"],
    is_published: true,
    created_at: "2026-06-15T09:00:00Z",
    category: demoCategories[5],
    quotes: [
      {
        id: "demo-ruq1",
        content_id: "demo-refactoring-ui",
        text: "Start with a feature, not a layout.",
        timestamp: "01:30",
      },
      {
        id: "demo-ruq2",
        content_id: "demo-refactoring-ui",
        text: "Good design is about hierarchy: not everything can be important.",
        timestamp: "07:10",
      },
      {
        id: "demo-ruq3",
        content_id: "demo-refactoring-ui",
        text: "Whitespace is not wasted space — it's the frame for your content.",
        timestamp: "13:25",
      },
    ],
    flashcards: [
      {
        id: "demo-ruf1",
        content_id: "demo-refactoring-ui",
        front: "What does 'hierarchy' mean in UI design?",
        back: "Making clear what matters most via size, color, and spacing so users scan correctly.",
      },
      {
        id: "demo-ruf2",
        content_id: "demo-refactoring-ui",
        front: "Why start with a feature, not a layout?",
        back: "Layouts without a feature lead to generic designs; the feature shapes the interface.",
      },
      {
        id: "demo-ruf3",
        content_id: "demo-refactoring-ui",
        front: "What's the quickest way to improve a design?",
        back: "Remove borders and use whitespace and color to create separation.",
      },
    ],
    top_moments: [
      {
        id: "demo-rum1",
        content_id: "demo-refactoring-ui",
        title: "Design is hierarchy",
        summary:
          "The biggest wins come from clear visual hierarchy, not decoration.",
        timestamp_ref: "07:10",
      },
      {
        id: "demo-rum2",
        content_id: "demo-refactoring-ui",
        title: "Whitespace as a tool",
        summary:
          "Breathing room guides attention better than more borders and boxes.",
        timestamp_ref: "13:25",
      },
    ],
  },
];

export const demoRoles: Role[] = [
  {
    id: "demo-role-pm",
    slug: "product-manager",
    name: "Product Manager",
    title: "Become a Senior Product Manager",
    tagline: "Learn how the best PMs think, decide, and communicate.",
    description:
      "The path for aspiring product managers in India. Instead of chasing trending posts, follow the people working product leaders actually cite — the frameworks, judgment, and habits that separate juniors from seniors.",
    accent: "from-indigo-500 to-violet-500",
    sort_order: 1,
    sources: [
      {
        id: "demo-rs-pm-1",
        role_id: "demo-role-pm",
        name: "Shreyas Doshi",
        title: "Ex-Stripe, ex-Twitter PM",
        domain: "X / Twitter",
        url: "https://twitter.com/shreyas",
        note: "A masterclass in product judgment. His threads on PM mental models are the most-shared content among working product managers.",
        sort_order: 1,
      },
      {
        id: "demo-rs-pm-2",
        role_id: "demo-role-pm",
        name: "Lenny Rachitsky",
        title: "Ex-Airbnb PM",
        domain: "Newsletter & Podcast",
        url: "https://www.lennysnewsletter.com/",
        note: "Interviews with PMs at Airbnb, Stripe, and Netflix on how real product decisions actually get made.",
        sort_order: 2,
      },
      {
        id: "demo-rs-pm-3",
        role_id: "demo-role-pm",
        name: "Marty Cagan",
        title: "Author of 'Inspired'",
        domain: "Book & Blog",
        url: "https://www.svpg.com/",
        note: "The canonical book on what great product teams do differently. Start here, before any framework.",
        sort_order: 3,
      },
      {
        id: "demo-rs-pm-4",
        role_id: "demo-role-pm",
        name: "Sriram Krishnan",
        title: "Ex-Meta, ex-Twitter PM",
        domain: "X / Twitter",
        url: "https://twitter.com/sriramk",
        note: "An Indian-origin PM who rose to the top of Big Tech. Practical takes on careers and product, not hype.",
        sort_order: 4,
      },
      {
        id: "demo-rs-pm-5",
        role_id: "demo-role-pm",
        name: "Julie Zhuo",
        title: "Ex-VP of Design at Facebook",
        domain: "Newsletter",
        url: "https://www.lookingglass.blog/",
        note: "Writes with unusual clarity about management, strategy, and the craft of building products.",
        sort_order: 5,
      },
      {
        id: "demo-rs-pm-6",
        role_id: "demo-role-pm",
        name: "Products That Count",
        title: "PM community",
        domain: "Community & Podcast",
        url: "https://productsthatcount.com/",
        note: "Free talks from senior PMs. A low-effort way to see what the industry is discussing each week.",
        sort_order: 6,
      },
    ],
  },
  {
    id: "demo-role-arch",
    slug: "software-architect",
    name: "Software Engineer & Architect",
    title: "Become a Senior Engineer & Architect",
    tagline: "The signal behind systems design, clean code, and engineering careers.",
    description:
      "For engineers who want to move from writing code to designing systems. Curated from what working seniors actually share on scaling, architecture, and getting hired in Big Tech.",
    accent: "from-emerald-500 to-teal-500",
    sort_order: 2,
    sources: [
      {
        id: "demo-rs-arch-1",
        role_id: "demo-role-arch",
        name: "Martin Fowler",
        title: "Chief Scientist, ThoughtWorks",
        domain: "Blog",
        url: "https://martinfowler.com/",
        note: "The architect's architect. Patterns, refactoring, and the craft of software design written with rare rigor.",
        sort_order: 1,
      },
      {
        id: "demo-rs-arch-2",
        role_id: "demo-role-arch",
        name: "The Pragmatic Engineer",
        title: "Gergely Orosz",
        domain: "Newsletter",
        url: "https://newsletter.pragmaticengineer.com/",
        note: "What Big Tech engineering is actually like — scaling teams, interview prep, and compensation data.",
        sort_order: 2,
      },
      {
        id: "demo-rs-arch-3",
        role_id: "demo-role-arch",
        name: "ByteByteGo",
        title: "Alex Xu",
        domain: "Newsletter & YouTube",
        url: "https://bytebytego.com/",
        note: "The single most-shared resource for system design interviews in India. Visual, practical, current.",
        sort_order: 3,
      },
      {
        id: "demo-rs-arch-4",
        role_id: "demo-role-arch",
        name: "Kent Beck",
        title: "Father of XP & TDD",
        domain: "X / Twitter",
        url: "https://twitter.com/KentBeck",
        note: "Timeless advice on writing code that survives contact with reality. Short, dense, quotable.",
        sort_order: 4,
      },
      {
        id: "demo-rs-arch-5",
        role_id: "demo-role-arch",
        name: "Paul Graham",
        title: "Y Combinator co-founder",
        domain: "Essays",
        url: "https://paulgraham.com/articles.html",
        note: "Startup-era engineering and founder thinking that engineers across the world quote constantly.",
        sort_order: 5,
      },
      {
        id: "demo-rs-arch-6",
        role_id: "demo-role-arch",
        name: "System Design Primer",
        title: "donnemartin",
        domain: "GitHub",
        url: "https://github.com/donnemartin/system-design-primer",
        note: "The free open-source repo most aspirants start from. Learn it once, then read the paid guides.",
        sort_order: 6,
      },
    ],
  },
  {
    id: "demo-role-ds",
    slug: "data-scientist",
    name: "Data Scientist",
    title: "Become a Senior Data Scientist",
    tagline: "From Kaggle notebooks to production ML systems.",
    description:
      "The path for data professionals who want to move beyond tutorials. Follow what working data scientists and ML engineers actually recommend — fundamentals, production engineering, and decision science.",
    accent: "from-amber-500 to-orange-500",
    sort_order: 3,
    sources: [
      {
        id: "demo-rs-ds-1",
        role_id: "demo-role-ds",
        name: "Andrew Ng",
        title: "Founder, DeepLearning.AI",
        domain: "Courses & Newsletter",
        url: "https://www.deeplearning.ai/",
        note: "The starting point for nearly every data scientist. Teaches the fundamentals with unusual clarity.",
        sort_order: 1,
      },
      {
        id: "demo-rs-ds-2",
        role_id: "demo-role-ds",
        name: "Chip Huyen",
        title: "Author, 'Designing ML Systems'",
        domain: "Book & Blog",
        url: "https://huyenchip.com/",
        note: "The gap between ML in a notebook and ML in production. The book senior ML engineers recommend.",
        sort_order: 2,
      },
      {
        id: "demo-rs-ds-3",
        role_id: "demo-role-ds",
        name: "Cassie Kozyrkov",
        title: "Google's first Chief Decision Scientist",
        domain: "X / Twitter & Blog",
        url: "https://twitter.com/quaesita",
        note: "The best voice on making decisions with data — statistics without the dogma.",
        sort_order: 3,
      },
      {
        id: "demo-rs-ds-4",
        role_id: "demo-role-ds",
        name: "StatQuest",
        title: "Josh Starmer",
        domain: "YouTube",
        url: "https://www.youtube.com/@StatQuest",
        note: "The clearest visual explanations of statistics and ML concepts. Perfect when a paper confuses you.",
        sort_order: 4,
      },
      {
        id: "demo-rs-ds-5",
        role_id: "demo-role-ds",
        name: "Kaggle",
        title: "Data science community",
        domain: "Community",
        url: "https://www.kaggle.com/",
        note: "Where Indian data scientists prove themselves. Study winning solutions to learn competitive taste.",
        sort_order: 5,
      },
      {
        id: "demo-rs-ds-6",
        role_id: "demo-role-ds",
        name: "The Batch",
        title: "Weekly AI digest",
        domain: "Newsletter",
        url: "https://www.deeplearning.ai/the-batch/",
        note: "A weekly AI news digest that keeps you current without the noise of X timelines.",
        sort_order: 6,
      },
    ],
  },
  {
    id: "demo-role-des",
    slug: "designer",
    name: "Product Designer",
    title: "Become a Senior Product Designer",
    tagline: "Build taste for interfaces, systems, and human behavior.",
    description:
      "For designers and developer-designers who want real craft. Curated from the sources working designers actually cite for visual hierarchy, UX foundations, and design careers.",
    accent: "from-pink-500 to-rose-500",
    sort_order: 4,
    sources: [
      {
        id: "demo-rs-des-1",
        role_id: "demo-role-des",
        name: "Refactoring UI",
        title: "Adam Wathan & Steve Schoger",
        domain: "Book & Tutorial",
        url: "https://www.refactoringui.com/",
        note: "The most actionable resource for building beautiful UIs without a design degree. Read it twice.",
        sort_order: 1,
      },
      {
        id: "demo-rs-des-2",
        role_id: "demo-role-des",
        name: "Don Norman",
        title: "Author, 'The Design of Everyday Things'",
        domain: "Book",
        url: "https://jnd.org/",
        note: "The foundation of UX thinking — why good design is invisible and bad design blames the user.",
        sort_order: 2,
      },
      {
        id: "demo-rs-des-3",
        role_id: "demo-role-des",
        name: "Julie Zhuo",
        title: "Ex-VP of Design at Facebook",
        domain: "Newsletter",
        url: "https://www.lookingglass.blog/",
        note: "Design leadership and craft written with unusual honesty. Essential for career progression.",
        sort_order: 3,
      },
      {
        id: "demo-rs-des-4",
        role_id: "demo-role-des",
        name: "Tobias van Schneider",
        title: "Indie designer",
        domain: "Newsletter",
        url: "https://www.tvsv.de/",
        note: "The indie design voice — personal brand, craft, and building products without a team.",
        sort_order: 4,
      },
      {
        id: "demo-rs-des-5",
        role_id: "demo-role-des",
        name: "Interaction Design Foundation",
        title: "IxDF",
        domain: "Courses",
        url: "https://www.interaction-design.org/",
        note: "Structured, respected UX education with certifications employers actually recognize.",
        sort_order: 5,
      },
      {
        id: "demo-rs-des-6",
        role_id: "demo-role-des",
        name: "Mobbin & Dribbble",
        title: "Reference libraries",
        domain: "Reference",
        url: "https://mobbin.com/",
        note: "Taste calibration — study what strong products do before you invent patterns from scratch.",
        sort_order: 6,
      },
    ],
  },
];

export function getDemoRole(slug: string): Role | null {
  return demoRoles.find((r) => r.slug === slug) ?? null;
}

function buildRandomQuotes(): RandomQuote[] {
  const pool: RandomQuote[] = [];
  for (const content of demoContent) {
    for (const quote of content.quotes) {
      pool.push({
        ...quote,
        content: {
          id: content.id,
          slug: content.slug,
          title: content.title,
          source_url: content.source_url,
          category: content.category ?? null,
        },
      });
    }
  }
  return pool;
}

const demoRandomQuotes = buildRandomQuotes();

export function randomDemoQuote(): RandomQuote | null {
  if (demoRandomQuotes.length === 0) return null;
  return demoRandomQuotes[Math.floor(Math.random() * demoRandomQuotes.length)];
}
