# Content Management System Documentation

## Overview

The content management system provides a comprehensive solution for creating, managing, and delivering educational content. It integrates MDX processing, Sanity CMS, and custom content types to support tutorials, courses, articles, and interactive learning materials.

## Architecture

### Core Components

1. **MDX Processing** - Markdown with React components
2. **Sanity CMS** - Headless content management
3. **Content Types** - Articles, tutorials, courses, challenges
4. **Asset Management** - Images, videos, code examples
5. **Search & Discovery** - Content indexing and retrieval

## MDX Processing System

### MDX Server Utilities

```typescript
import { bundleMDX as bMDX } from "mdx-bundler";
import { rehypeInlineCodeProperty } from "react-shiki";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import rehypeSlug from "rehype-slug";
import remarkContainers from "remark-flexible-containers";

export async function bundleMDX({
  source,
  files,
}: {
  source: string;
  files?: Record<string, string>;
}) {
  return bMDX({
    source,
    files,
    mdxOptions(options) {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkGfm,
        remarkMath,
        remarkContainers,
      ];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        rehypeMathjax,
        rehypeInlineCodeProperty,
      ];
      return options;
    },
    globals: {
      // UI components available in MDX
      Button: "Button",
      Card: "Card",
      Badge: "Badge",
      Alert: "Alert",
      Tabs: "Tabs",
      // ... more components
    },
  });
}
```

### MDX Components

#### Typography Components

```typescript
// Heading components with proper styling
export function H1({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <motion.h1
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      {...props}
    >
      {children}
    </motion.h1>
  );
}

// Code block with syntax highlighting
export function Code({
  inline,
  className,
  children,
  sandpackTemplates,
  ...props
}: CodeHighlightProps) {
  const [theme] = useTheme();
  const isDark = theme === "dark";
  const currentTheme = isDark ? "night-owl" : "one-light";

  // Handle different code types
  if (isSandpack) {
    return <Sandpack sandpackTemplate={template} />;
  }

  if (isMermaid) {
    return <Mermaid chart={code} />;
  }

  return (
    <div className="relative text-sm">
      <CopyButton code={code} />
      <ShikiHighlighter
        language={language}
        theme={currentTheme}
        {...props}
      >
        {code}
      </ShikiHighlighter>
    </div>
  );
}
```

## Sanity CMS Integration

### Configuration

```typescript
import { createClient } from "@sanity/client";

const config: ClientConfig = {
  projectId: "3alj5od9",
  dataset: SANITY_STUDIO_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
};

export const client = createClient(config);
```

### Content Types

#### Article Schema

```typescript
// Sanity schema for articles
export default {
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        { type: "code" },
        { type: "image" },
        { type: "callout" },
      ],
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    },
    {
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    },
  ],
};
```

### Content Queries

#### Article Queries

```typescript
// Get all articles with author and tags
export const articlesQuery = groq`*[_type == "article"] {
  _id,
  title,
  "slug": slug.current,
  "author": author->{
    name,
    "image": image.asset->url,
    "slug": slug.current
  },
  "tags": tags[]->{
    title,
    "slug": slug.current
  },
  publishedAt,
  "excerpt": pt::text(content[0...200]),
  "readingTime": round(length(pt::text(content)) / 200)
} | order(publishedAt desc)`;

// Get single article with full content
export const articleQuery = groq`*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  "author": author->{
    name,
    "image": image.asset->url,
    "slug": slug.current,
    bio
  },
  content,
  "tags": tags[]->{
    title,
    "slug": slug.current
  },
  publishedAt,
  "readingTime": round(length(pt::text(content)) / 200)
}`;
```

## Content Server Utilities

### Content Loading

```typescript
// Load content from Sanity
export async function loadContent(query: string, params?: any) {
  try {
    const data = await client.fetch(query, params);
    return { data, error: null };
  } catch (error) {
    console.error("Error loading content:", error);
    return { data: null, error };
  }
}

// Load and process MDX content
export async function loadMdxContent(slug: string) {
  const { data: article } = await loadContent(articleQuery, { slug });

  if (!article) {
    return null;
  }

  // Process MDX content
  const { code } = await bundleMDX({
    source: article.content,
  });

  return {
    ...article,
    content: code,
  };
}
```

### Content Caching

```typescript
// Cache content for performance
const contentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedContent(
  key: string,
  fetcher: () => Promise<any>,
) {
  const cached = contentCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetcher();
  contentCache.set(key, { data, timestamp: Date.now() });

  return data;
}
```

## Content Types

### Articles

```typescript
// Article structure
interface Article {
  _id: string;
  title: string;
  slug: string;
  author: Author;
  content: string;
  tags: Tag[];
  publishedAt: string;
  readingTime: number;
  excerpt: string;
}

// Article loading
export async function getArticles(limit = 10) {
  return await loadContent(articlesQuery, { limit });
}

export async function getArticle(slug: string) {
  return await loadMdxContent(slug);
}
```

### Tutorials

```typescript
// Tutorial structure with lessons
interface Tutorial {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessons: Lesson[];
  estimatedTime: number;
  tags: Tag[];
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  order: number;
  exercises: Exercise[];
}

// Tutorial loading
export async function getTutorials() {
  return await loadContent(tutorialsQuery);
}

export async function getTutorial(slug: string) {
  const tutorial = await loadContent(tutorialQuery, { slug });

  if (!tutorial.data) {
    return null;
  }

  // Process lesson content
  const processedLessons = await Promise.all(
    tutorial.data.lessons.map(async (lesson: Lesson) => ({
      ...lesson,
      content: (await bundleMDX({ source: lesson.content })).code,
    })),
  );

  return {
    ...tutorial.data,
    lessons: processedLessons,
  };
}
```

### Courses

```typescript
// Course structure with modules
interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  modules: Module[];
  prerequisites: string[];
  learningOutcomes: string[];
  certificate: boolean;
}

interface Module {
  _id: string;
  title: string;
  lessons: Lesson[];
  order: number;
  quiz: Quiz;
}

// Course loading
export async function getCourses() {
  return await loadContent(coursesQuery);
}

export async function getCourse(slug: string) {
  return await loadContent(courseQuery, { slug });
}
```

## Asset Management

### Image Handling

```typescript
// Image component with optimization
export function Img({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="aspect-video" />;
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn("rounded-lg", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    />
  );
}
```

### Video Integration

```typescript
// Video component with multiple providers
export function Video({ src, type = "youtube", ...props }: VideoProps) {
  if (type === "youtube") {
    return <YouTubeVideo videoId={src} {...props} />;
  }

  if (type === "bunny") {
    return <BunnyVideo videoId={src} {...props} />;
  }

  return <video src={src} controls {...props} />;
}
```

## Search and Discovery

### Content Indexing

```typescript
// Index content for search
export async function indexContent() {
  const articles = await getArticles();
  const tutorials = await getTutorials();
  const courses = await getCourses();

  const searchIndex = [
    ...articles.map((article) => ({
      type: "article",
      title: article.title,
      content: article.excerpt,
      tags: article.tags.map((tag) => tag.title),
      url: `/articles/${article.slug}`,
    })),
    ...tutorials.map((tutorial) => ({
      type: "tutorial",
      title: tutorial.title,
      content: tutorial.description,
      tags: tutorial.tags.map((tag) => tag.title),
      url: `/tutorials/${tutorial.slug}`,
    })),
    // ... more content types
  ];

  return searchIndex;
}
```

### Search Implementation

```typescript
// Simple search function
export function searchContent(query: string, content: SearchItem[]) {
  const searchTerm = query.toLowerCase();

  return content.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(searchTerm);
    const contentMatch = item.content.toLowerCase().includes(searchTerm);
    const tagMatch = item.tags.some((tag) =>
      tag.toLowerCase().includes(searchTerm),
    );

    return titleMatch || contentMatch || tagMatch;
  });
}
```

## Content Delivery

### Route Implementation

```typescript
// Article route
export async function loader({ params }: LoaderArgs) {
  const { slug } = params;

  if (!slug) {
    throw new Response("Not found", { status: 404 });
  }

  const article = await getArticle(slug);

  if (!article) {
    throw new Response("Not found", { status: 404 });
  }

  return {
    article,
    meta: {
      title: article.title,
      description: article.excerpt,
      keywords: article.tags.map((tag) => tag.title).join(", "),
    },
  };
}
```

### SEO Optimization

```typescript
// SEO meta tags
export function generateMetaTags(content: any) {
  return {
    title: content.title,
    description: content.excerpt,
    keywords: content.tags?.map((tag: any) => tag.title).join(", "),
    "og:title": content.title,
    "og:description": content.excerpt,
    "og:image": content.author?.image,
    "twitter:card": "summary_large_image",
    "twitter:title": content.title,
    "twitter:description": content.excerpt,
  };
}
```

## Content Management UI

### Admin Interface

```typescript
// Content management dashboard
export default function ContentDashboard() {
  const { articles, tutorials, courses } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContentCard
          title="Articles"
          count={articles.length}
          href="/admin/articles"
        />
        <ContentCard
          title="Tutorials"
          count={tutorials.length}
          href="/admin/tutorials"
        />
        <ContentCard
          title="Courses"
          count={courses.length}
          href="/admin/courses"
        />
      </div>

      <ContentTable data={articles} type="article" />
    </div>
  );
}
```

### Content Editor

```typescript
// MDX editor component
export function ContentEditor({ value, onChange }: ContentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing..." }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-lg">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

## Performance Optimization

### Content Preloading

```typescript
// Preload critical content
export async function preloadContent() {
  const [articles, tutorials] = await Promise.all([
    getArticles(5),
    getTutorials(5),
  ]);

  return { articles, tutorials };
}
```

### Lazy Loading

```typescript
// Lazy load content components
const LazySandpack = React.lazy(() => import("./Sandpack"));
const LazyMermaid = React.lazy(() => import("./Mermaid"));

export function LazyContent({ type, ...props }: LazyContentProps) {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      {type === "sandpack" && <LazySandpack {...props} />}
      {type === "mermaid" && <LazyMermaid {...props} />}
    </Suspense>
  );
}
```

## Testing

### Content Tests

```typescript
// Test content loading
test("loads article content", async () => {
  const article = await getArticle("test-article");

  expect(article).toBeDefined();
  expect(article.title).toBe("Test Article");
  expect(article.content).toContain("processed content");
});

// Test MDX processing
test("processes MDX content", async () => {
  const source = "# Hello World\n\nThis is **bold** text.";
  const { code } = await bundleMDX({ source });

  expect(code).toContain("Hello World");
  expect(code).toContain("bold");
});
```

## Monitoring and Analytics

### Content Metrics

```typescript
// Track content engagement
export async function trackContentView(contentId: string, userId?: string) {
  await analytics.track("content_view", {
    contentId,
    userId,
    timestamp: new Date(),
  });
}

// Content performance analytics
export async function getContentAnalytics() {
  const views = await analytics.getEvents("content_view", {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });

  return views.map((view) => ({
    contentId: view.contentId,
    views: view.count,
    uniqueUsers: view.uniqueUsers,
  }));
}
```

## Related Files

- `app/utils/mdx.server.ts` - MDX processing utilities
- `app/utils/content.server/` - Content loading and management
- `app/components/mdx/` - MDX components
- `app/routes/articles/` - Article routes
- `app/routes/tutorials/` - Tutorial routes
- `app/routes/courses/` - Course routes
- `content/pages/` - Static content pages
