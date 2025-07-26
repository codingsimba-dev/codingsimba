import React from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Search,
  Tag,
  Calendar,
  FileText,
  Play,
  Filter,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/empty-state";
import { Container } from "./container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

/**
 * Props for the Bookmarks component
 */
interface BookmarksProps {
  /** Array of user bookmarks with content and tag information */
  bookmarks: Array<{
    id: string;
    notes?: string | null;
    createdAt: Date;
    content: {
      id: string;
      sanityId: string;
      type: "ARTICLE" | "TUTORIAL";
      views: number;
    };
    bookmarkTags: Array<{
      tag: {
        name: string;
        color?: string | null;
      };
    }>;
  }>;
}

/**
 * A comprehensive bookmarks management component for the profile page.
 *
 * This component displays all user bookmarks with:
 * - Search functionality to find specific bookmarks
 * - Filtering by content type (articles/tutorials)
 * - Tag-based filtering
 * - Visual display of bookmark metadata (notes, tags, creation date)
 * - Links to the original content
 * - Empty state when no bookmarks exist
 *
 * @param {BookmarksProps} props - Component configuration
 * @param {Array} props.bookmarks - Array of user bookmarks with content and tag data
 *
 * @returns {JSX.Element} A bookmarks management interface
 */
export function Bookmarks({ bookmarks }: BookmarksProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [contentTypeFilter, setContentTypeFilter] =
    React.useState<string>("all");
  const [tagFilter, setTagFilter] = React.useState<string>("all");

  // Get unique tags for filtering
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    bookmarks.forEach((bookmark) => {
      bookmark.bookmarkTags.forEach((bt) => {
        tags.add(bt.tag.name);
      });
    });
    return Array.from(tags).sort();
  }, [bookmarks]);

  // Filter bookmarks based on search and filters
  const filteredBookmarks = React.useMemo(() => {
    return bookmarks.filter((bookmark) => {
      const matchesSearch =
        searchQuery === "" ||
        bookmark.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.content.type
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        bookmark.bookmarkTags.some((bt) =>
          bt.tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesContentType =
        contentTypeFilter === "all" ||
        bookmark.content.type.toLowerCase() === contentTypeFilter;

      const matchesTag =
        tagFilter === "all" ||
        bookmark.bookmarkTags.some((bt) => bt.tag.name === tagFilter);

      return matchesSearch && matchesContentType && matchesTag;
    });
  }, [bookmarks, searchQuery, contentTypeFilter, tagFilter]);

  if (bookmarks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Container title="Bookmarks">
          <EmptyState
            icon={<Bookmark className="text-muted-foreground size-10" />}
            title="No bookmarks yet"
            description="Start bookmarking articles and tutorials to see them here. You can add tags and notes to organize your content."
            action={{
              label: "Browse Content",
              onClick: () => (window.location.href = "/articles"),
            }}
          />
        </Container>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container title="Bookmarks">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search bookmarks by notes, content type, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="size-4" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>

            <Select
              value={contentTypeFilter}
              onValueChange={setContentTypeFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All content</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-muted-foreground mb-4 text-sm">
          Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
        </div>

        {/* Bookmarks Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>

        {filteredBookmarks.length === 0 && (
          <EmptyState
            icon={<Search className="text-muted-foreground size-10" />}
            title="No bookmarks found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        )}
      </Container>
    </motion.div>
  );
}

/**
 * Props for the BookmarkCard component
 */
interface BookmarkCardProps {
  /** The bookmark data to display */
  bookmark: {
    id: string;
    notes?: string | null;
    createdAt: Date;
    content: {
      id: string;
      sanityId: string;
      type: "ARTICLE" | "TUTORIAL";
      views: number;
    };
    bookmarkTags: Array<{
      tag: {
        name: string;
        color?: string | null;
      };
    }>;
  };
}

/**
 * Individual bookmark card component.
 *
 * Displays a single bookmark with its metadata, tags, and a link to the original content.
 * Shows the content type, creation date, notes, and associated tags.
 *
 * @param {BookmarkCardProps} props - Component configuration
 * @param {Object} props.bookmark - The bookmark data to display
 *
 * @returns {JSX.Element} A bookmark card with content information
 */
function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const contentType = bookmark.content.type.toLowerCase();
  const contentTypePath = contentType === "article" ? "articles" : "tutorials";

  return (
    <div className="border-border bg-card rounded-lg border p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {bookmark.content.type === "ARTICLE" ? (
            <FileText className="size-4 text-blue-500" />
          ) : (
            <Play className="size-4 text-green-500" />
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {contentType}
          </Badge>
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <Calendar className="size-3" />
          {new Date(bookmark.createdAt).toLocaleDateString()}
        </div>
      </div>

      {bookmark.notes && (
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
          {bookmark.notes}
        </p>
      )}

      {bookmark.bookmarkTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {bookmark.bookmarkTags.map((bt) => (
            <Badge
              key={bt.tag.name}
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: bt.tag.color || undefined,
                color: bt.tag.color ? "white" : undefined,
              }}
            >
              <Tag className="mr-1 size-3" />
              {bt.tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          {bookmark.content.views.toLocaleString()} views
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/${contentTypePath}/${bookmark.content.sanityId}`}>
            View {contentType}
          </Link>
        </Button>
      </div>
    </div>
  );
}
