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
 * Props for the ContentReports component
 */
interface ContentReportsProps {
  /** Array of user content reports with status and details */
  reports: Array<{
    id: string;
    reason: string;
    details?: string | null;
    status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
    createdAt: Date;
    resolvedAt?: Date | null;
    content?: {
      id: string;
      sanityId: string;
      type: "ARTICLE" | "TUTORIAL";
    } | null;
    comment?: {
      id: string;
      body: string;
    } | null;
  }>;
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
 * @param {ContentReportsProps} props - Component configuration
 * @param {Array} props.reports - Array of user content reports with status and details
 *
 * @returns {JSX.Element} A content reports management interface
 */
export function ContentReports({ reports }: ContentReportsProps) {
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

  if (reports.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Content Reports</h1>
            <p className="text-muted-foreground mt-2">
              Track your reports and their moderation status.
            </p>
          </div>
          <EmptyState
            icon={<Flag className="text-muted-foreground size-10" />}
            title="No reports yet"
            description="You haven't submitted any content reports yet. Reports help us maintain a safe and respectful community."
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
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Content Reports</h1>
          <p className="text-muted-foreground mt-2">
            Your submitted reports and their status ({reports.length} total)
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search reports by reason, details, or comment content..."
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <SelectItem value="comment">Comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-muted-foreground mb-4 text-sm">
          Showing {filteredReports.length} of {reports.length} reports
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {filteredReports.length === 0 && (
          <EmptyState
            icon={<Search className="text-muted-foreground size-10" />}
            title="No reports found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        )}
      </Container>
    </motion.div>
  );
}

/**
 * Props for the ReportCard component
 */
interface ReportCardProps {
  /** The report data to display */
  report: {
    id: string;
    reason: string;
    details?: string | null;
    status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
    createdAt: Date;
    resolvedAt?: Date | null;
    content?: {
      id: string;
      sanityId: string;
      type: "ARTICLE" | "TUTORIAL";
    } | null;
    comment?: {
      id: string;
      body: string;
    } | null;
  };
}

/**
 * Individual report card component.
 *
 * Displays a single report with its metadata, status, and a link to the original content.
 * Shows the report reason, details, status with appropriate icons, and creation/resolution dates.
 *
 * @param {ReportCardProps} props - Component configuration
 * @param {Object} props.report - The report data to display
 *
 * @returns {JSX.Element} A report card with content information
 */
function ReportCard({ report }: ReportCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: Clock,
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          label: "Pending",
        };
      case "UNDER_REVIEW":
        return {
          icon: AlertCircle,
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          label: "Under Review",
        };
      case "RESOLVED":
        return {
          icon: CheckCircle,
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          label: "Resolved",
        };
      case "DISMISSED":
        return {
          icon: XCircle,
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          label: "Dismissed",
        };
      default:
        return {
          icon: Clock,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(report.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {report.content ? (
            report.content.type === "ARTICLE" ? (
              <FileText className="size-4 text-blue-500" />
            ) : (
              <Play className="size-4 text-green-500" />
            )
          ) : (
            <MessageSquare className="size-4 text-purple-500" />
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {report.content ? report.content.type.toLowerCase() : "comment"}
          </Badge>
          <Badge className={`text-xs ${statusConfig.color}`}>
            <StatusIcon className="mr-1 size-3" />
            {statusConfig.label}
          </Badge>
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <Calendar className="size-3" />
          {new Date(report.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mb-3">
        <h3 className="font-medium capitalize">
          {report.reason.replace("_", " ").toLowerCase()}
        </h3>
        {report.details && (
          <p className="text-muted-foreground mt-1 text-sm">{report.details}</p>
        )}
        {report.comment && (
          <div className="bg-muted mt-2 rounded-md p-2">
            <p className="text-sm italic">
              {report.comment.body.substring(0, 100)}
              {report.comment.body.length > 100 ? "..." : ""}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          {report.resolvedAt && (
            <span>
              Resolved: {new Date(report.resolvedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {report.content && (
          <Button asChild size="sm" variant="outline">
            <Link
              to={`/${report.content.type.toLowerCase() === "article" ? "articles" : "tutorials"}/${report.content.sanityId}`}
            >
              View Content
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
