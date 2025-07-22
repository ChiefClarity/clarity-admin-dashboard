'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    { name: 'Pending Bookings', value: '12', icon: Users, trend: '+4.5%' },
    { name: 'Scheduled Today', value: '28', icon: Calendar, trend: '+2.1%' },
    { name: 'Active Messages', value: '7', icon: MessageSquare, trend: '-1.2%' },
    { name: 'Weekly Revenue', value: '$12,480', icon: TrendingUp, trend: '+8.3%' },
  ];

  const recentBookings = [
    { id: 1, customer: 'John Smith', address: '123 Pool Lane, Miami', time: '2 hours ago', urgent: true },
    { id: 2, customer: 'Sarah Johnson', address: '456 Ocean Dr, Miami Beach', time: '3 hours ago', urgent: false },
    { id: 3, customer: 'Mike Wilson', address: '789 Sunset Blvd, Coral Gables', time: '5 hours ago', urgent: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Monitor your pool service operations at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.trend}
                </span>{' '}
                from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>New bookings requiring attention</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/bookings">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">{booking.customer}</p>
                  <p className="text-sm text-muted-foreground">{booking.address}</p>
                  <p className="text-xs text-muted-foreground">{booking.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  {booking.urgent && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                  <Button size="sm">Assign</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-24 flex-col" variant="outline">
              <Users className="mb-2 h-6 w-6" />
              Assign Technicians
            </Button>
            <Button className="h-24 flex-col" variant="outline">
              <Calendar className="mb-2 h-6 w-6" />
              View Schedule
            </Button>
            <Button className="h-24 flex-col" variant="outline">
              <MessageSquare className="mb-2 h-6 w-6" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}