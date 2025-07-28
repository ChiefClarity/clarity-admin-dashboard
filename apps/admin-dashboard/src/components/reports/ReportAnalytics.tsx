'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Mail,
  Eye,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatNumber, formatPercentage } from '@/lib/utils';
import type { ReportAnalytics } from '@/lib/api/reports/types';

interface ReportAnalyticsProps {
  data: ReportAnalytics | undefined;
}

export function ReportAnalytics({ data }: ReportAnalyticsProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No analytics data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate trends
  const previousOpenRate = 18.5; // This would come from API
  const openRateTrend = data.openRate - previousOpenRate;
  const openRateTrendPercent = ((openRateTrend / previousOpenRate) * 100).toFixed(1);

  // Transform byDay data for charts
  const chartData = data.byDay
    ?.slice(0, 30)
    .reverse()
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sent: d.count,
    })) || [];

  // Performance metrics for pie chart
  const performanceData = [
    { name: 'Opened', value: data.totalOpened, color: '#10b981' },
    { name: 'Not Opened', value: data.totalSent - data.totalOpened, color: '#6b7280' },
  ];

  const deliveryData = [
    { name: 'Delivered', value: Math.round(data.totalSent * (data.deliveryRate / 100)), color: '#3b82f6' },
    { name: 'Failed', value: Math.round(data.totalSent * ((100 - data.deliveryRate) / 100)), color: '#ef4444' },
  ];

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalSent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{data.openRate}%</div>
              <div className="flex items-center gap-1">
                {getTrendIcon(openRateTrend)}
                <span className={`text-xs ${openRateTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {openRateTrendPercent}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unique Recipients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.uniqueCustomers)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Send Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Report Volume</CardTitle>
            <CardDescription>
              Number of reports sent per day over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Email Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Email Performance</CardTitle>
            <CardDescription>
              Open rate and delivery statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-4">Open Rate</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {performanceData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                      <span className="font-medium">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-4">Delivery Status</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deliveryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deliveryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {deliveryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                      <span className="font-medium">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Health Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Average Pool Health Score</CardTitle>
          <CardDescription>
            Average health score across all reports sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold">
                {data.avgHealthScore.toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground">/100</span>
              </div>
              <p className="text-sm text-muted-foreground">Current average</p>
            </div>
            <div className="text-right">
              <Badge variant={data.avgHealthScore >= 90 ? 'success' : data.avgHealthScore >= 70 ? 'warning' : 'destructive'}>
                {data.avgHealthScore >= 90 ? 'Excellent' : data.avgHealthScore >= 70 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </div>

          {/* Health Score Distribution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Excellent (90-100)</span>
              <span className="font-medium">42%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: '42%' }} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Good (70-89)</span>
              <span className="font-medium">38%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-600" style={{ width: '38%' }} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Needs Attention (&lt;70)</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-600" style={{ width: '20%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}