'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  Mail, 
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { reportsApi } from '@/lib/api/reports/reports-api';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ReportPreviewModal } from './ReportPreviewModal';
import type { ReportHistoryRecord } from '@/lib/api/reports/types';

export function ReportHistory() {
  const [filters, setFilters] = useState({
    startDate: format(startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd'),
    endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
    limit: 25,
    offset: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportHistoryRecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reportHistory', filters],
    queryFn: () => reportsApi.getHistory(filters),
    placeholderData: (previousData) => previousData,
  });

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && filters.offset >= filters.limit) {
      setFilters({ ...filters, offset: filters.offset - filters.limit });
    } else if (direction === 'next' && data && filters.offset + filters.limit < data.total) {
      setFilters({ ...filters, offset: filters.offset + filters.limit });
    }
  };

  const handleViewReport = async (report: ReportHistoryRecord) => {
    setSelectedReport(report);
    setShowPreview(true);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export functionality to be implemented');
  };

  const filteredReports = data?.reports.filter(report => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      report.customer.firstName?.toLowerCase().includes(search) ||
      report.customer.lastName?.toLowerCase().includes(search) ||
      report.customer.email?.toLowerCase().includes(search) ||
      report.customer.address?.toLowerCase().includes(search)
    );
  });

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return <LoadingState message="Loading report history..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Mail}
            title="Failed to load reports"
            description="There was an error loading the report history."
            action={
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Report History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value, offset: 0 })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value, offset: 0 })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Records per page</Label>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value), offset: 0 })}
                >
                  <SelectTrigger id="limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {filteredReports && filteredReports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-center">Health Score</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {report.customer.firstName} {report.customer.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {report.customer.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.customer.address && (
                            <div>{report.customer.address}</div>
                          )}
                          {report.customer.city && report.customer.state && (
                            <div className="text-muted-foreground">
                              {report.customer.city}, {report.customer.state}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(report.sentAt), 'MMM d, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(report.sentAt), 'h:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          'text-2xl font-bold',
                          getHealthScoreColor(report.healthScore)
                        )}>
                          {report.healthScore}
                        </span>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          {report.opened ? (
                            <Badge variant="success" className="text-xs">
                              Opened
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not opened
                            </Badge>
                          )}
                          {report.deliveryStatus === 'failed' && (
                            <Badge variant="destructive" className="text-xs">
                              Failed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="No reports found"
              description="No reports match your current filters."
            />
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, data.total)} of {data.total} reports
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('prev')}
                  disabled={filters.offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {data.page} of {data.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('next')}
                  disabled={data.page === data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {selectedReport && (
        <ReportPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          customerId={selectedReport.customerId}
          reportDate={selectedReport.sentAt}
        />
      )}
    </>
  );
}