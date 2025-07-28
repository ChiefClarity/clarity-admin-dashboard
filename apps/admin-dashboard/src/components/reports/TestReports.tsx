'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { 
  Send, 
  Eye, 
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { reportsApi } from '@/lib/api/reports/reports-api';
import { customersApi } from '@/lib/api/customers-api';
import { CustomerSearch } from '@/components/customers/CustomerSearch';
import { ReportPreviewModal } from './ReportPreviewModal';
import { BulkSendModal } from './BulkSendModal';
import type { Customer } from '@/types/customer';

export function TestReports() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBulkSend, setShowBulkSend] = useState(false);
  const [recentSentReports, setRecentSentReports] = useState<Array<{
    customerId: number;
    timestamp: Date;
    jobId?: number;
  }>>([]);

  // Send test report mutation
  const sendTestMutation = useMutation({
    mutationFn: (customerId: number) => reportsApi.sendTest(customerId),
    onSuccess: (response, customerId) => {
      toast({
        title: 'Test report sent',
        description: `Report sent successfully to ${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`,
        variant: 'success',
      });
      
      // Add to recent sent list
      setRecentSentReports(prev => [
        {
          customerId,
          timestamp: new Date(),
          jobId: response.data.jobId,
        },
        ...prev.slice(0, 4), // Keep last 5
      ]);
      
      // Clear selection
      setSelectedCustomer(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send test report';
      toast({
        title: 'Error sending report',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (customerId: number) => reportsApi.preview(customerId),
    onSuccess: () => {
      setShowPreview(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Error generating preview',
        description: error.response?.data?.message || 'Failed to generate preview',
        variant: 'destructive',
      });
    },
  });

  const handleSendTest = () => {
    if (!selectedCustomer) {
      toast({
        title: 'No customer selected',
        description: 'Please select a customer to send a test report to.',
        variant: 'destructive',
      });
      return;
    }

    sendTestMutation.mutate(selectedCustomer.id);
  };

  const handlePreview = () => {
    if (!selectedCustomer) {
      toast({
        title: 'No customer selected',
        description: 'Please select a customer to preview a report for.',
        variant: 'destructive',
      });
      return;
    }

    previewMutation.mutate(selectedCustomer.id);
  };

  return (
    <div className="space-y-6">
      {/* Test Single Report */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Report</CardTitle>
          <CardDescription>
            Send a test report to a specific customer using their most recent job data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Select Customer</Label>
            <CustomerSearch
              value={selectedCustomer}
              onSelect={setSelectedCustomer}
              placeholder="Search by name, email, or address..."
            />
          </div>

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {selectedCustomer.email}
                    </div>
                    {selectedCustomer.address && (
                      <div className="text-sm text-muted-foreground">
                        {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSendTest}
              disabled={!selectedCustomer || sendTestMutation.isPending}
              className="gap-2"
            >
              {sendTestMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Test Report
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!selectedCustomer || previewMutation.isPending}
              className="gap-2"
            >
              {previewMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
          </div>

          {/* Recent Test Reports */}
          {recentSentReports.length > 0 && (
            <div className="mt-6 space-y-2">
              <Label>Recently Sent Test Reports</Label>
              <div className="space-y-2">
                {recentSentReports.map((report, index) => (
                  <div
                    key={`${report.customerId}-${report.timestamp.getTime()}`}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Customer #{report.customerId}</span>
                      {report.jobId && (
                        <Badge variant="secondary" className="text-xs">
                          Job #{report.jobId}
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(report.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Send */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Send Reports</CardTitle>
          <CardDescription>
            Send reports to multiple customers at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Bulk Send Guidelines</AlertTitle>
            <AlertDescription>
              • Maximum 100 customers per batch<br />
              • Reports are sent with a small delay between each<br />
              • Only customers with completed jobs will receive reports
            </AlertDescription>
          </Alert>

          <Button
            className="mt-4 gap-2"
            onClick={() => setShowBulkSend(true)}
          >
            <Users className="h-4 w-4" />
            Select Customers for Bulk Send
          </Button>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {selectedCustomer && (
        <ReportPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          customerId={selectedCustomer.id}
        />
      )}

      {/* Bulk Send Modal */}
      <BulkSendModal
        open={showBulkSend}
        onOpenChange={setShowBulkSend}
        onSuccess={() => {
          setShowBulkSend(false);
          toast({
            title: 'Bulk send completed',
            description: 'Check the progress in the notifications panel.',
            variant: 'success',
          });
        }}
      />
    </div>
  );
}