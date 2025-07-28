import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/lib/hooks/useBookings';
import { BookingFilters } from './BookingFilters';
import { TechAssignment } from './TechAssignment';
import { Booking } from '@/lib/types/booking';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TimeAgo } from '@/components/shared/TimeAgo';

export function BookingTable() {
  const [filters, setFilters] = useState({
    status: 'pending',
    hasDogsOnly: false,
    dateRange: { from: null, to: null },
  });
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const { data, isLoading, error, refetch } = useBookings(filters);
  
  const priorityBookings = useMemo(() => {
    if (!data?.bookings) return [];
    
    return data.bookings.sort((a, b) => {
      // Prioritize by time since booking
      const timeDiffA = Date.now() - new Date(a.createdAt).getTime();
      const timeDiffB = Date.now() - new Date(b.createdAt).getTime();
      
      // Then by specific concerns
      if (a.specificConcerns && !b.specificConcerns) return -1;
      if (!a.specificConcerns && b.specificConcerns) return 1;
      
      return timeDiffB - timeDiffA;
    });
  }, [data?.bookings]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <BookingFilters filters={filters} onFiltersChange={setFilters} />
      
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Preferred Day</TableHead>
              <TableHead>Concerns</TableHead>
              <TableHead>Time Since Booking</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priorityBookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-sm text-muted-foreground">{booking.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{booking.address}</p>
                    <p className="text-muted-foreground">
                      {booking.city}, {booking.state} {booking.zipCode}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {booking.currentServiceDay || 'No preference'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {booking.hasDogs && (
                      <Badge variant="warning" className="mb-1">
                        🐕 Dogs on property
                      </Badge>
                    )}
                    {booking.specificConcerns && (
                      <p className="text-sm text-muted-foreground truncate">
                        {booking.specificConcerns}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TimeAgo date={booking.createdAt} />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    Assign Tech
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedBooking && (
        <TechAssignment
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAssign={() => {
            // Refresh bookings
            refetch();
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}