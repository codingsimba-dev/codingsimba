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
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { EmptyState } from "~/components/empty-state";
import { Container } from "./container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { format } from "date-fns";

/**
 * Tag information associated with a bookmark
 */
export interface BookmarkTag {
  /** Tag data with name and optional color */
  tag: {
    /** Display name of the tag */
    name: string;
    /** Optional color for the tag (hex or named color) */
    color?: string | null;
  };
}

/**
 * Content information associated with a bookmark
 */
export interface BookmarkContent {
  /** Unique identifier for the content */
  id: string;
  /** Type of bookmarked content */
  type: "ARTICLE" | "TUTORIAL";
  /** Number of views the content has received */
  views: number;
}

/**
 * Complete bookmark data structure
 */
export interface Bookmark {
  /** Unique identifier for the bookmark */
  id: string;
  /** Optional personal notes about the bookmark */
  notes?: string | null;
  /** Date when the bookmark was created */
  createdAt: Date;
  /** Content information for the bookmarked item */
  content: BookmarkContent;
  /** Array of tags associated with this bookmark */
  bookmarkTags: BookmarkTag[];
}

/**
 * Props for the Bookmarks component
 */
export interface BookmarksProps {
  /** Array of user bookmarks with content and tag information */
  bookmarks: Bookmark[];
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
 * The component has been refactored into smaller, focused components:
 * - BookmarkSearchBar: Handles search input
 * - BookmarkFilters: Content type and tag filtering
 * - BookmarkGrid: Grid layout for bookmark cards
 * - BookmarkCard: Individual bookmark display
 * - Custom hook useBookmarkFilters: Manages filtering state and logic
 *
 * @param {BookmarksProps} props - Component configuration
 * @param {Array} props.bookmarks - Array of user bookmarks with content and tag data
 *
 * @returns {JSX.Element} A bookmarks management interface
 */
export function Bookmarks({ bookmarks }: BookmarksProps) {
  const {
    searchQuery,
    setSearchQuery,
    contentTypeFilter,
    setContentTypeFilter,
    tagFilter,
    setTagFilter,
    allTags,
    filteredBookmarks,
  } = useBookmarkFilters(bookmarks);

  if (bookmarks.length === 0) {
    return <BookmarksEmptyState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container title="Bookmarks">
        <div className="mb-6 space-y-4">
          <BookmarkSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <BookmarkFilters
            contentTypeFilter={contentTypeFilter}
            onContentTypeChange={setContentTypeFilter}
            tagFilter={tagFilter}
            onTagChange={setTagFilter}
            availableTags={allTags}
          />
        </div>

        <BookmarkResultsHeader
          filteredCount={filteredBookmarks.length}
          totalCount={bookmarks.length}
        />

        <BookmarkGrid bookmarks={filteredBookmarks} />
      </Container>
    </motion.div>
  );
}

/**
 * Custom hook for managing bookmark filtering state and logic.
 *
 * Provides search and filter functionality for bookmarks, including:
 * - Text search across notes, content type, and tag names
 * - Content type filtering (articles/tutorials)
 * - Tag-based filtering
 * - Automatic extraction of unique tags for filter options
 * - Memoized filtered results for performance
 *
 * @param {Bookmark[]} bookmarks - Array of bookmarks to filter
 * @returns {Object} Filtering state and handlers
 * @returns {string} returns.searchQuery - Current search query
 * @returns {Function} returns.setSearchQuery - Handler to update search query
 * @returns {string} returns.contentTypeFilter - Current content type filter
 * @returns {Function} returns.setContentTypeFilter - Handler to update content type filter
 * @returns {string} returns.tagFilter - Current tag filter
 * @returns {Function} returns.setTagFilter - Handler to update tag filter
 * @returns {string[]} returns.allTags - Array of all unique tag names
 * @returns {Bookmark[]} returns.filteredBookmarks - Filtered array of bookmarks
 */
export function useBookmarkFilters(bookmarks: Bookmark[]) {
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

  return {
    searchQuery,
    setSearchQuery,
    contentTypeFilter,
    setContentTypeFilter,
    tagFilter,
    setTagFilter,
    allTags,
    filteredBookmarks,
  };
}

/**
 * Props for the BookmarkSearchBar component
 */
interface BookmarkSearchBarProps {
  /** Current search query value */
  searchQuery: string;
  /** Handler called when search query changes */
  onSearchChange: (query: string) => void;
}

/**
 * Search input component for filtering bookmarks.
 *
 * Provides a text input with search icon for filtering bookmarks by
 * notes, content type, or tag names.
 *
 * @param {BookmarkSearchBarProps} props - Component props
 * @param {string} props.searchQuery - Current search query value
 * @param {Function} props.onSearchChange - Handler called when search query changes
 * @returns {JSX.Element} Search input with icon
 */
export function BookmarkSearchBar({
  searchQuery,
  onSearchChange,
}: BookmarkSearchBarProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder="Search bookmarks by notes, content type, or tags..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

/**
 * Props for the BookmarkFilters component
 */
interface BookmarkFiltersProps {
  /** Current content type filter value */
  contentTypeFilter: string;
  /** Handler called when content type filter changes */
  onContentTypeChange: (value: string) => void;
  /** Current tag filter value */
  tagFilter: string;
  /** Handler called when tag filter changes */
  onTagChange: (value: string) => void;
  /** Array of available tag names for filtering */
  availableTags: string[];
}

/**
 * Filter controls component for bookmarks.
 *
 * Provides dropdown selectors for filtering bookmarks by content type
 * (articles/tutorials) and tags. The tag filter is populated dynamically
 * based on the tags present in the user's bookmarks.
 *
 * @param {BookmarkFiltersProps} props - Component props
 * @param {string} props.contentTypeFilter - Current content type filter value
 * @param {Function} props.onContentTypeChange - Handler called when content type filter changes
 * @param {string} props.tagFilter - Current tag filter value
 * @param {Function} props.onTagChange - Handler called when tag filter changes
 * @param {string[]} props.availableTags - Array of available tag names for filtering
 * @returns {JSX.Element} Filter controls with dropdowns
 */
export function BookmarkFilters({
  contentTypeFilter,
  onContentTypeChange,
  tagFilter,
  onTagChange,
  availableTags,
}: BookmarkFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Filter className="size-4" />
        <span className="text-sm font-medium">Filter by:</span>
      </div>

      <Select value={contentTypeFilter} onValueChange={onContentTypeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All content</SelectItem>
          <SelectItem value="article">Articles</SelectItem>
          <SelectItem value="tutorial">Tutorials</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tagFilter} onValueChange={onTagChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {availableTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Props for the BookmarkResultsHeader component
 */
interface BookmarkResultsHeaderProps {
  /** Number of bookmarks after filtering */
  filteredCount: number;
  /** Total number of bookmarks before filtering */
  totalCount: number;
}

/**
 * Results count display component for bookmarks.
 *
 * Shows how many bookmarks are currently visible after filtering
 * out of the total number of bookmarks.
 *
 * @param {BookmarkResultsHeaderProps} props - Component props
 * @param {number} props.filteredCount - Number of bookmarks after filtering
 * @param {number} props.totalCount - Total number of bookmarks before filtering
 * @returns {JSX.Element} Results count text
 */
export function BookmarkResultsHeader({
  filteredCount,
  totalCount,
}: BookmarkResultsHeaderProps) {
  return (
    <div className="text-muted-foreground mb-4 text-sm">
      Showing {filteredCount} of {totalCount} bookmarks
    </div>
  );
}

/**
 * Props for the BookmarkGrid component
 */
interface BookmarkGridProps {
  /** Array of bookmarks to display */
  bookmarks: Bookmark[];
}

/**
 * Grid container component for bookmark cards.
 *
 * Displays bookmarks in a responsive grid layout or shows an empty state
 * if no bookmarks match the current filters. Uses CSS Grid with responsive
 * breakpoints for optimal display across device sizes.
 *
 * @param {BookmarkGridProps} props - Component props
 * @param {Bookmark[]} props.bookmarks - Array of bookmarks to display
 * @returns {JSX.Element} Grid of bookmark cards or empty state
 */
export function BookmarkGrid({ bookmarks }: BookmarkGridProps) {
  if (bookmarks.length === 0) {
    return (
      <EmptyState
        icon={<Search className="text-muted-foreground size-10" />}
        title="No bookmarks found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
}

/**
 * Props for the BookmarkCard component
 */
interface BookmarkCardProps {
  /** The bookmark data to display */
  bookmark: Bookmark;
}

/**
 * Individual bookmark card component.
 *
 * Displays a complete bookmark with header (content type, creation date)
 * and content (notes, tags, view count, action button). Includes hover
 * effects and is composed of smaller sub-components for maintainability.
 *
 * @param {BookmarkCardProps} props - Component props
 * @param {Bookmark} props.bookmark - The bookmark data to display
 * @returns {JSX.Element} A bookmark card with complete information
 */
export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const contentType = bookmark.content.type.toLowerCase();
  const contentTypePath = contentType === "article" ? "articles" : "tutorials";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <BookmarkCardHeader bookmark={bookmark} />
      <BookmarkCardContent
        bookmark={bookmark}
        contentType={contentType}
        contentTypePath={contentTypePath}
      />
    </Card>
  );
}

/**
 * Bookmark card header component.
 *
 * Displays the top section of a bookmark card including content type icon,
 * content type badge, and creation date.
 *
 * @param {Object} props - Component props
 * @param {Bookmark} props.bookmark - The bookmark data
 * @returns {JSX.Element} Bookmark card header
 */
function BookmarkCardHeader({ bookmark }: { bookmark: Bookmark }) {
  const contentType = bookmark.content.type.toLowerCase();

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
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
          {format(bookmark.createdAt, "MMM d, yyyy")}
        </div>
      </div>
    </CardHeader>
  );
}

/**
 * Props for the BookmarkCardContent component
 */
interface BookmarkCardContentProps {
  /** The bookmark data */
  bookmark: Bookmark;
  /** Lowercase content type string */
  contentType: string;
  /** URL path for the content type */
  contentTypePath: string;
}

/**
 * Bookmark card content component.
 *
 * Displays the main content section of a bookmark card including
 * personal notes, tags, and footer with view count and action button.
 *
 * @param {BookmarkCardContentProps} props - Component props
 * @param {Bookmark} props.bookmark - The bookmark data
 * @param {string} props.contentType - Lowercase content type string
 * @param {string} props.contentTypePath - URL path for the content type
 * @returns {JSX.Element} Bookmark card content section
 */
function BookmarkCardContent({
  bookmark,
  contentType,
  contentTypePath,
}: BookmarkCardContentProps) {
  return (
    <CardContent className="pt-0">
      {bookmark.notes ? <BookmarkNotes notes={bookmark.notes} /> : null}

      {bookmark.bookmarkTags.length > 0 && (
        <BookmarkTags tags={bookmark.bookmarkTags} />
      )}

      <BookmarkFooter
        views={bookmark.content.views}
        contentType={contentType}
        contentTypePath={contentTypePath}
        itemId={bookmark.content.id}
      />
    </CardContent>
  );
}

/**
 * Bookmark notes component.
 *
 * Displays personal notes associated with a bookmark. Notes are
 * truncated with CSS line clamping for consistent card heights.
 *
 * @param {Object} props - Component props
 * @param {string} props.notes - The personal notes text
 * @returns {JSX.Element} Notes paragraph with line clamping
 */
function BookmarkNotes({ notes }: { notes: string }) {
  return (
    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{notes}</p>
  );
}

/**
 * Bookmark tags component.
 *
 * Displays all tags associated with a bookmark as colored badges.
 * Tags can have custom colors or use the default secondary styling.
 *
 * @param {Object} props - Component props
 * @param {Bookmark["bookmarkTags"]} props.tags - Array of bookmark tags
 * @returns {JSX.Element} Flexbox container with tag badges
 */
function BookmarkTags({ tags }: { tags: Bookmark["bookmarkTags"] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1">
      {tags.map((bt) => (
        <Badge
          key={bt.tag.name}
          variant="secondary"
          className="text-xs"
          style={{
            backgroundColor: bt.tag.color ?? undefined,
            color: bt.tag.color ? "white" : undefined,
          }}
        >
          <Tag className="mr-1 size-3" />
          {bt.tag.name}
        </Badge>
      ))}
    </div>
  );
}

/**
 * Props for the BookmarkFooter component
 */
interface BookmarkFooterProps {
  /** Number of views for the content */
  views: number;
  /** Content type for the button label */
  contentType: string;
  /** URL path for the content type */
  contentTypePath: string;
  /** Unique identifier for the content */
  itemId: string;
}

/**
 * Bookmark card footer component.
 *
 * Contains the view count and action button to navigate to the
 * original content. Displays view count with proper formatting.
 *
 * @param {BookmarkFooterProps} props - Component props
 * @param {number} props.views - Number of views for the content
 * @param {string} props.contentType - Content type for the button label
 * @param {string} props.contentTypePath - URL path for the content type
 * @param {string} props.itemId - Unique identifier for the content
 * @returns {JSX.Element} Footer with view count and action button
 */
function BookmarkFooter({
  views,
  contentType,
  contentTypePath,
  itemId,
}: BookmarkFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-xs">
        {views.toLocaleString()} views
      </div>
      <Button asChild size="sm" variant="outline">
        <Link to={`/${contentTypePath}/${itemId}`}>View {contentType}</Link>
      </Button>
    </div>
  );
}

/**
 * Empty state component for when no bookmarks exist.
 *
 * Displays a friendly message, icon, and action button when the user
 * hasn't created any bookmarks yet. Includes navigation to browse content.
 *
 * @returns {JSX.Element} Empty state with animation and call-to-action
 */
export function BookmarksEmptyState() {
  const navigate = useNavigate();

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
            onClick: () => navigate("/articles"),
          }}
        />
      </Container>
    </motion.div>
  );
}
