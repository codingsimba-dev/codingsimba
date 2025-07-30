import React from "react";
import { motion } from "framer-motion";
import {
  Flag,
  Search,
  Calendar,
  FileText,
  Play,
  MessageSquare,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router";
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

/**
 * Possible status values for a content report
 */
export type ReportStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "DISMISSED";

/**
 * Content information associated with a report
 */
export interface ReportContent {
  /** Unique identifier for the content */
  id: string;
  /** Type of content being reported */
  type: "ARTICLE" | "TUTORIAL";
}

/**
 * Comment information associated with a report
 */
export interface ReportComment {
  /** Unique identifier for the comment */
  id: string;
  /** Text content of the comment */
  body: string;
}

/**
 * Complete report data structure
 */
export interface Report {
  /** Unique identifier for the report */
  id: string;
  /** Reason for the report (e.g., spam, inappropriate_content) */
  reason: string;
  /** Optional additional details provided by the reporter */
  details?: string | null;
  /** Current status of the report */
  status: ReportStatus;
  /** Date when the report was created */
  createdAt: Date;
  /** Date when the report was resolved (if applicable) */
  resolvedAt?: Date | null;
  /** Content being reported (if applicable) */
  content?: ReportContent | null;
  /** Comment being reported (if applicable) */
  comment?: ReportComment | null;
}

/**
 * Props for the ContentReports component
 */
export interface ContentReportsProps {
  /** Array of user content reports with status and details */
  reports: Report[];
}

/**
 * Configuration object for report status display
 */
export interface StatusConfig {
  /** Icon component to display for this status */
  icon: React.ComponentType<{ className?: string }>;
  /** CSS classes for styling the status badge */
  color: string;
  /** Human-readable label for the status */
  label: string;
}

/**
 * A comprehensive content reports management component for the profile page.
 *
 * This component displays all user reports with:
 * - Search functionality to find specific reports
 * - Filtering by status and content type
 * - Visual display of report metadata (reason, details, status, dates)
 * - Status indicators with appropriate colors and icons
 * - Links to the original content when available
 * - Empty state when no reports exist
 *
 * The component has been refactored into smaller, focused components:
 * - ReportSearchBar: Handles search input
 * - ReportFilters: Status and content type filtering
 * - ReportsList: List layout for report cards
 * - ReportCard: Individual report display with sub-components
 * - Custom hook useReportFilters: Manages filtering state and logic
 * - StatusConfig utility: Centralizes status display configuration
 *
 * @param {ContentReportsProps} props - Component configuration
 * @param {Array} props.reports - Array of user content reports with status and details
 *
 * @returns {JSX.Element} A content reports management interface
 */
export function ContentReports({ reports }: ContentReportsProps) {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    contentTypeFilter,
    setContentTypeFilter,
    filteredReports,
  } = useReportFilters(reports);

  if (reports.length === 0) {
    return <ContentReportsEmptyState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container title="Content Reports">
        <ReportPageHeader totalReports={reports.length} hasReports={true} />

        <div className="mb-6 space-y-4">
          <ReportSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <ReportFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            contentTypeFilter={contentTypeFilter}
            onContentTypeChange={setContentTypeFilter}
          />
        </div>

        <ReportResultsHeader
          filteredCount={filteredReports.length}
          totalCount={reports.length}
        />

        <ReportsList reports={filteredReports} />
      </Container>
    </motion.div>
  );
}

/**
 * Custom hook for managing report filtering state and logic.
 *
 * Provides search and filter functionality for reports, including:
 * - Text search across reason, details, and comment content
 * - Status-based filtering
 * - Content type filtering
 * - Memoized filtered results for performance
 *
 * @param {Report[]} reports - Array of reports to filter
 * @returns {Object} Filtering state and handlers
 * @returns {string} returns.searchQuery - Current search query
 * @returns {Function} returns.setSearchQuery - Handler to update search query
 * @returns {string} returns.statusFilter - Current status filter
 * @returns {Function} returns.setStatusFilter - Handler to update status filter
 * @returns {string} returns.contentTypeFilter - Current content type filter
 * @returns {Function} returns.setContentTypeFilter - Handler to update content type filter
 * @returns {Report[]} returns.filteredReports - Filtered array of reports
 */
export function useReportFilters(reports: Report[]) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [contentTypeFilter, setContentTypeFilter] =
    React.useState<string>("all");

  // Filter reports based on search and filters
  const filteredReports = React.useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchQuery === "" ||
        report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.comment?.body.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || report.status.toLowerCase() === statusFilter;

      const matchesContentType =
        contentTypeFilter === "all" ||
        report.content?.type.toLowerCase() === contentTypeFilter ||
        (contentTypeFilter === "comment" && report.comment);

      return matchesSearch && matchesStatus && matchesContentType;
    });
  }, [reports, searchQuery, statusFilter, contentTypeFilter]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    contentTypeFilter,
    setContentTypeFilter,
    filteredReports,
  };
}

/**
 * Utility function to get status configuration for display.
 *
 * Returns appropriate icon, color, and label for each report status.
 * Provides fallback configuration for unknown status values.
 *
 * @param {ReportStatus} status - The report status to get configuration for
 * @returns {StatusConfig} Configuration object with icon, color, and label
 */
export function getStatusConfig(status: ReportStatus): StatusConfig {
  const configs: Record<ReportStatus, StatusConfig> = {
    PENDING: {
      icon: Clock,
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: "Pending",
    },
    UNDER_REVIEW: {
      icon: AlertCircle,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      label: "Under Review",
    },
    RESOLVED: {
      icon: CheckCircle,
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      label: "Resolved",
    },
    DISMISSED: {
      icon: XCircle,
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      label: "Dismissed",
    },
  };

  return (
    configs[status] || {
      icon: Clock,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      label: status,
    }
  );
}

/**
 * Props for the ReportSearchBar component
 */
interface ReportSearchBarProps {
  /** Current search query value */
  searchQuery: string;
  /** Handler called when search query changes */
  onSearchChange: (query: string) => void;
}

/**
 * Search input component for filtering reports.
 *
 * Provides a text input with search icon for filtering reports by
 * reason, details, or comment content.
 *
 * @param {ReportSearchBarProps} props - Component props
 * @param {string} props.searchQuery - Current search query value
 * @param {Function} props.onSearchChange - Handler called when search query changes
 * @returns {JSX.Element} Search input with icon
 */
export function ReportSearchBar({
  searchQuery,
  onSearchChange,
}: ReportSearchBarProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder="Search reports by reason, details, or comment content..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

/**
 * Props for the ReportFilters component
 */
interface ReportFiltersProps {
  /** Current status filter value */
  statusFilter: string;
  /** Handler called when status filter changes */
  onStatusChange: (value: string) => void;
  /** Current content type filter value */
  contentTypeFilter: string;
  /** Handler called when content type filter changes */
  onContentTypeChange: (value: string) => void;
}

/**
 * Filter controls component for reports.
 *
 * Provides dropdown selectors for filtering reports by status
 * (pending, under review, resolved, dismissed) and content type
 * (articles, tutorials, comments).
 *
 * @param {ReportFiltersProps} props - Component props
 * @param {string} props.statusFilter - Current status filter value
 * @param {Function} props.onStatusChange - Handler called when status filter changes
 * @param {string} props.contentTypeFilter - Current content type filter value
 * @param {Function} props.onContentTypeChange - Handler called when content type filter changes
 * @returns {JSX.Element} Filter controls with dropdowns
 */
export function ReportFilters({
  statusFilter,
  onStatusChange,
  contentTypeFilter,
  onContentTypeChange,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Filter className="size-4" />
        <span className="text-sm font-medium">Filter by:</span>
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="under_review">Under Review</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="dismissed">Dismissed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={contentTypeFilter} onValueChange={onContentTypeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All content</SelectItem>
          <SelectItem value="article">Articles</SelectItem>
          <SelectItem value="tutorial">Tutorials</SelectItem>
          <SelectItem value="comment">Comments</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Props for the ReportResultsHeader component
 */
interface ReportResultsHeaderProps {
  /** Number of reports after filtering */
  filteredCount: number;
  /** Total number of reports before filtering */
  totalCount: number;
}

/**
 * Results count display component.
 *
 * Shows how many reports are currently visible after filtering
 * out of the total number of reports.
 *
 * @param {ReportResultsHeaderProps} props - Component props
 * @param {number} props.filteredCount - Number of reports after filtering
 * @param {number} props.totalCount - Total number of reports before filtering
 * @returns {JSX.Element} Results count text
 */
export function ReportResultsHeader({
  filteredCount,
  totalCount,
}: ReportResultsHeaderProps) {
  return (
    <div className="text-muted-foreground mb-4 text-sm">
      Showing {filteredCount} of {totalCount} reports
    </div>
  );
}

/**
 * Props for the ReportPageHeader component
 */
interface ReportPageHeaderProps {
  /** Total number of reports */
  totalReports: number;
  /** Whether the user has any reports */
  hasReports: boolean;
}

/**
 * Page header component for the reports section.
 *
 * Displays contextual description text based on whether the user
 * has reports or not, including the total count when applicable.
 *
 * @param {ReportPageHeaderProps} props - Component props
 * @param {number} props.totalReports - Total number of reports
 * @param {boolean} props.hasReports - Whether the user has any reports
 * @returns {JSX.Element} Page header with description
 */
export function ReportPageHeader({
  totalReports,
  hasReports,
}: ReportPageHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-muted-foreground mt-2">
        {hasReports
          ? `Your submitted reports and their status (${totalReports} total)`
          : "Track your reports and their moderation status."}
      </p>
    </div>
  );
}

/**
 * Props for the ReportsList component
 */
interface ReportsListProps {
  /** Array of reports to display */
  reports: Report[];
}

/**
 * List container component for report cards.
 *
 * Displays a list of report cards or an empty state if no reports
 * match the current filters. Handles the layout and spacing of
 * individual report cards.
 *
 * @param {ReportsListProps} props - Component props
 * @param {Report[]} props.reports - Array of reports to display
 * @returns {JSX.Element} List of report cards or empty state
 */
export function ReportsList({ reports }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<Search className="text-muted-foreground size-10" />}
        title="No reports found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

/**
 * Props for the ReportCard component
 */
interface ReportCardProps {
  /** The report data to display */
  report: Report;
}

/**
 * Individual report card component.
 *
 * Displays a complete report with header (status, content type, date)
 * and content (reason, details, comment preview, action buttons).
 * Composed of smaller sub-components for maintainability.
 *
 * @param {ReportCardProps} props - Component props
 * @param {Report} props.report - The report data to display
 * @returns {JSX.Element} A report card with complete information
 */
export function ReportCard({ report }: ReportCardProps) {
  return (
    <Card>
      <ReportCardHeader report={report} />
      <ReportCardContent report={report} />
    </Card>
  );
}

/**
 * Report card header component.
 *
 * Displays the top section of a report card including content type icon,
 * content type badge, status badge, and creation date.
 *
 * @param {Object} props - Component props
 * @param {Report} props.report - The report data
 * @returns {JSX.Element} Report card header
 */
function ReportCardHeader({ report }: { report: Report }) {
  const statusConfig = getStatusConfig(report.status);
  const StatusIcon = statusConfig.icon;

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <ReportContentTypeIcon report={report} />
          <ReportContentTypeBadge report={report} />
          <ReportStatusBadge
            statusConfig={statusConfig}
            StatusIcon={StatusIcon}
          />
        </div>
        <ReportDate date={report.createdAt} />
      </div>
    </CardHeader>
  );
}

/**
 * Content type icon component for reports.
 *
 * Displays an appropriate icon based on the content type being reported
 * (article, tutorial, or comment).
 *
 * @param {Object} props - Component props
 * @param {Report} props.report - The report data
 * @returns {JSX.Element} Icon representing the content type
 */
function ReportContentTypeIcon({ report }: { report: Report }) {
  if (report.content) {
    return report.content.type === "ARTICLE" ? (
      <FileText className="size-4 text-blue-500" />
    ) : (
      <Play className="size-4 text-green-500" />
    );
  }
  return <MessageSquare className="size-4 text-purple-500" />;
}

/**
 * Content type badge component for reports.
 *
 * Displays a text badge indicating the type of content being reported.
 *
 * @param {Object} props - Component props
 * @param {Report} props.report - The report data
 * @returns {JSX.Element} Badge with content type text
 */
function ReportContentTypeBadge({ report }: { report: Report }) {
  const contentType = report.content
    ? report.content.type.toLowerCase()
    : "comment";

  return (
    <Badge variant="outline" className="text-xs capitalize">
      {contentType}
    </Badge>
  );
}

/**
 * Props for the ReportStatusBadge component
 */
interface ReportStatusBadgeProps {
  /** Status configuration object */
  statusConfig: StatusConfig;
  /** Status icon component */
  StatusIcon: React.ComponentType<{ className?: string }>;
}

/**
 * Status badge component for reports.
 *
 * Displays a colored badge with icon and text representing the
 * current status of the report.
 *
 * @param {ReportStatusBadgeProps} props - Component props
 * @param {StatusConfig} props.statusConfig - Status configuration object
 * @param {React.ComponentType} props.StatusIcon - Status icon component
 * @returns {JSX.Element} Colored status badge with icon
 */
function ReportStatusBadge({
  statusConfig,
  StatusIcon,
}: ReportStatusBadgeProps) {
  return (
    <Badge className={`text-xs ${statusConfig.color}`}>
      <StatusIcon className="mr-1 size-3" />
      {statusConfig.label}
    </Badge>
  );
}

/**
 * Date display component for reports.
 *
 * Shows the creation date of a report with calendar icon.
 *
 * @param {Object} props - Component props
 * @param {Date} props.date - The date to display
 * @returns {JSX.Element} Date with calendar icon
 */
function ReportDate({ date }: { date: Date }) {
  return (
    <div className="text-muted-foreground flex items-center gap-1 text-xs">
      <Calendar className="size-3" />
      {new Date(date).toLocaleDateString()}
    </div>
  );
}

/**
 * Report card content component.
 *
 * Displays the main content section of a report card including
 * reason, details, comment preview, and footer actions.
 *
 * @param {Object} props - Component props
 * @param {Report} props.report - The report data
 * @returns {JSX.Element} Report card content section
 */
function ReportCardContent({ report }: { report: Report }) {
  return (
    <CardContent className="pt-0">
      <ReportDetails report={report} />
      <ReportFooter report={report} />
    </CardContent>
  );
}

/**
 * Report details section component.
 *
 * Displays the reason for the report, optional additional details,
 * and comment preview if the report is about a comment.
 *
 * @param {Object} props - Component props
 * @param {Report} props.report - The report data
 * @returns {JSX.Element} Report details section
 */
function ReportDetails({ report }: { report: Report }) {
  return (
    <div className="mb-3">
      <ReportReason reason={report.reason} />
      {report.details ? <ReportDetailsText details={report.details} /> : null}
      {report.comment ? (
        <ReportCommentPreview comment={report.comment} />
      ) : null}
    </div>
  );
}

/**
 * Report reason component.
 *
 * Displays the formatted reason for the report as a heading.
 *
 * @param {Object} props - Component props
 * @param {string} props.reason - The report reason
 * @returns {JSX.Element} Formatted reason heading
 */
function ReportReason({ reason }: { reason: string }) {
  return (
    <h3 className="font-medium capitalize">
      {reason.replace("_", " ").toLowerCase()}
    </h3>
  );
}

/**
 * Report details text component.
 *
 * Displays additional details provided by the reporter.
 *
 * @param {Object} props - Component props
 * @param {string} props.details - The additional details
 * @returns {JSX.Element} Details text paragraph
 */
function ReportDetailsText({ details }: { details: string }) {
  return <p className="text-muted-foreground mt-1 text-sm">{details}</p>;
}

/**
 * Comment preview component for reports.
 *
 * Shows a truncated preview of the comment being reported.
 * Truncates long comments and adds ellipsis.
 *
 * @param {Object} props - Component props
 * @param {Report["comment"]} props.comment - The comment data
 * @returns {JSX.Element|null} Comment preview or null if no comment
 */
function ReportCommentPreview({ comment }: { comment: Report["comment"] }) {
  if (!comment) return null;

  const truncatedBody = comment.body.substring(0, 100);
  const isLong = comment.body.length > 100;

  return (
    <div className="bg-muted mt-2 rounded-md p-2">
      <p className="text-sm italic">
        {truncatedBody}
        {isLong ? "..." : ""}
      </p>
    </div>
  );
}

/**
 * Report card footer component.
 *
 * Contains the resolved date (if applicable) and action button
 * to view the original content.
 *
 * @param {Object} props - Component props
 * @param {Report} props.report - The report data
 * @returns {JSX.Element} Report card footer
 */
function ReportFooter({ report }: { report: Report }) {
  return (
    <div className="flex items-center justify-between">
      <ReportResolvedDate resolvedAt={report.resolvedAt} />
      <ReportViewContentButton content={report.content} />
    </div>
  );
}

/**
 * Resolved date component for reports.
 *
 * Shows when a report was resolved, if applicable.
 *
 * @param {Object} props - Component props
 * @param {Date|null|undefined} props.resolvedAt - The resolution date
 * @returns {JSX.Element} Resolved date text or empty div
 */
function ReportResolvedDate({
  resolvedAt,
}: {
  resolvedAt: Date | null | undefined;
}) {
  if (!resolvedAt) return <div />;

  return (
    <div className="text-muted-foreground text-xs">
      <span>Resolved: {new Date(resolvedAt).toLocaleDateString()}</span>
    </div>
  );
}

/**
 * View content button component for reports.
 *
 * Provides a link to view the original content that was reported.
 * Only shown for content reports (not comment reports).
 *
 * @param {Object} props - Component props
 * @param {Report["content"]} props.content - The content data
 * @returns {JSX.Element|null} View content button or null if no content
 */
function ReportViewContentButton({ content }: { content: Report["content"] }) {
  if (!content) return null;

  const contentPath =
    content.type.toLowerCase() === "article" ? "articles" : "tutorials";

  return (
    <Button asChild size="sm" variant="outline">
      <Link to={`/${contentPath}/${content.id}`}>View Content</Link>
    </Button>
  );
}

/**
 * Empty state component for when no reports exist.
 *
 * Displays a friendly message and icon when the user hasn't
 * submitted any content reports yet.
 *
 * @returns {JSX.Element} Empty state with animation and helpful message
 */
export function ContentReportsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container title="Content Reports">
        <ReportPageHeader totalReports={0} hasReports={false} />
        <EmptyState
          icon={<Flag className="text-muted-foreground size-10" />}
          title="No reports yet"
          description="You haven't submitted any content reports yet. Reports help us maintain a safe and respectful community."
        />
      </Container>
    </motion.div>
  );
}
