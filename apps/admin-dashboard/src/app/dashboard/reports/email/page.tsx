'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  BarChart3, 
  Settings, 
  Users, 
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { reportsApi } from '@/lib/api/reports/reports-api';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ReportConfig } from '@/components/reports/ReportConfig';
import { ReportHistory } from '@/components/reports/ReportHistory';
import { ReportAnalytics } from '@/components/reports/ReportAnalytics';
import { TestReports } from '@/components/reports/TestReports';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatNumber } from '@/lib/utils';

export default function EmailReportsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Fetch initial data
  const { data: config, isLoading: configLoading, refetch: refetchConfig } = useQuery({
    queryKey: ['reportConfig'],
    queryFn: () => reportsApi.getConfig().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['reportAnalytics'],
    queryFn: () => reportsApi.getAnalytics().then(res => res.data),
    staleTime: 60 * 1000, // 1 minute
  });

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    namespace: 'admin',
    events: {
      'report:sent': () => {
        refetchAnalytics();
      },
      'report:opened': () => {
        refetchAnalytics();
      },
      'config:updated': () => {
        refetchConfig();
      },
    },
  });

  const handleRefresh = () => {
    refetchConfig();
    refetchAnalytics();
  };

  if (configLoading || analyticsLoading) {
    return <LoadingState message="Loading email reports dashboard..." />;
  }

  if (!config) {
    return <ErrorState message="Failed to load configuration" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Reports</h1>
          <p className="text-muted-foreground">
            Manage and monitor weekly pool health reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'success' : 'secondary'}>
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reports Status
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {config.enabled ? 'Active' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground">
              {config.enabled ? 'Sending automatically' : 'Reports paused'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sent (30d)
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics?.totalSent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.uniqueCustomers || 0} unique customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.openRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analytics?.totalOpened || 0)} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Health Score
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.avgHealthScore?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 100 points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert if reports are disabled */}
      {!config.enabled && (
        <Card className="border-warning">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <CardTitle className="text-lg">Reports are currently disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Weekly email reports are not being sent automatically. Enable them in the configuration tab.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test & Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ReportAnalytics data={analytics} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ReportHistory />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <ReportConfig 
            config={config} 
            onUpdate={() => {
              refetchConfig();
              refetchAnalytics();
            }} 
          />
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <TestReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}