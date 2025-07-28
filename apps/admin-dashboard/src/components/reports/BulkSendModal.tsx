import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  Loader2, 
  Users, 
  Send,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { reportsApi } from '@/lib/api/reports/reports-api';
import { customersApi } from '@/lib/api/customers-api';
import { LoadingState } from '@/components/shared/LoadingState';
import type { Customer } from '@/types/customer';

interface BulkSendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkSendModal({ open, onOpenChange, onSuccess }: BulkSendModalProps) {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sendResults, setSendResults] = useState<any>(null);

  // Fetch customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', 'bulk-send'],
    queryFn: () => customersApi.getAllCustomers({ limit: 100 }).then(res => res.customers),
    enabled: open,
  });

  // Bulk send mutation
  const bulkSendMutation = useMutation({
    mutationFn: (customerIds: number[]) => reportsApi.sendBulk(customerIds),
    onSuccess: (response) => {
      setSendResults(response);
      if (response.successful > 0) {
        toast({
          title: 'Bulk send completed',
          description: `Successfully sent ${response.successful} of ${response.total} reports`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk send failed',
        description: error.response?.data?.message || 'An error occurred during bulk send',
        variant: 'destructive',
      });
    },
  });

  const handleSelectAll = () => {
    if (filteredCustomers) {
      const allIds = new Set(filteredCustomers.slice(0, 100).map(c => c.id));
      setSelectedCustomerIds(allIds);
    }
  };

  const handleDeselectAll = () => {
    setSelectedCustomerIds(new Set());
  };

  const handleToggleCustomer = (customerId: number) => {
    const newSet = new Set(selectedCustomerIds);
    if (newSet.has(customerId)) {
      newSet.delete(customerId);
    } else {
      newSet.add(customerId);
    }
    setSelectedCustomerIds(newSet);
  };

  const handleSend = () => {
    if (selectedCustomerIds.size === 0) {
      toast({
        title: 'No customers selected',
        description: 'Please select at least one customer to send reports to.',
        variant: 'destructive',
      });
      return;
    }

    bulkSendMutation.mutate(Array.from(selectedCustomerIds));
  };

  const handleClose = () => {
    if (sendResults?.successful > 0) {
      onSuccess();
    }
    setSendResults(null);
    setSelectedCustomerIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  // Filter customers based on search
  const filteredCustomers = customers?.filter(customer => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      customer.firstName?.toLowerCase().includes(search) ||
      customer.lastName?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.address?.toLowerCase().includes(search)
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Send Reports</DialogTitle>
          <DialogDescription>
            Select customers to send weekly reports to. Maximum 100 customers per batch.
          </DialogDescription>
        </DialogHeader>

        {!sendResults ? (
          <>
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Customers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Selection controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedCustomerIds.size} selected
                </Badge>
                {selectedCustomerIds.size >= 100 && (
                  <Badge variant="warning">Max limit reached</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedCustomerIds.size >= 100}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAll}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Customer list */}
            {isLoading ? (
              <LoadingState message="Loading customers..." />
            ) : (
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                {filteredCustomers && filteredCustomers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg"
                      >
                        <Checkbox
                          checked={selectedCustomerIds.has(customer.id)}
                          onCheckedChange={() => handleToggleCustomer(customer.id)}
                          disabled={
                            !selectedCustomerIds.has(customer.id) && 
                            selectedCustomerIds.size >= 100
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.email}
                          </div>
                          {customer.address && (
                            <div className="text-xs text-muted-foreground">
                              {customer.address}, {customer.city}, {customer.state}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No customers found
                  </div>
                )}
              </ScrollArea>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={selectedCustomerIds.size === 0 || bulkSendMutation.isPending}
                className="gap-2"
              >
                {bulkSendMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Reports ({selectedCustomerIds.size})
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Results View */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">{sendResults.successful}</div>
                        <div className="text-sm text-muted-foreground">Sent</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="text-2xl font-bold">{sendResults.failed}</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">{sendResults.total}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {sendResults.failed > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Some reports failed to send</AlertTitle>
                  <AlertDescription>
                    Check the details below for error information.
                  </AlertDescription>
                </Alert>
              )}

              {/* Detailed results */}
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-2">
                  {sendResults.results.map((result: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Customer #{result.customerId}</span>
                      </div>
                      {result.error && (
                        <span className="text-xs text-red-600">{result.error}</span>
                      )}
                      {result.jobId && (
                        <Badge variant="secondary" className="text-xs">
                          Job #{result.jobId}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}