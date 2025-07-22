import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/lib/services/bookingService';
import { BookingFilters, BookingAssignment } from '@/lib/types/booking';
import { errorHandler } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';

export const useBookings = (filters: Partial<BookingFilters> = {}) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingService.getBookings(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      const appError = errorHandler.handleError(error);
      return failureCount < 3 && errorHandler.shouldRetry(appError);
    },
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBooking(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

export const useAssignBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      bookingId, 
      assignment 
    }: { 
      bookingId: string; 
      assignment: BookingAssignment;
    }) => bookingService.assignTechnician(bookingId, assignment),
    onSuccess: (data, variables) => {
      // Invalidate and refetch booking lists
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      // Update specific booking cache
      queryClient.setQueryData(['booking', variables.bookingId], data);
      
      logger.info('Booking assigned successfully', { 
        bookingId: variables.bookingId,
        technicianId: variables.assignment.technicianId 
      });
    },
    onError: (error) => {
      const appError = errorHandler.handleError(error, 'Assign booking');
      logger.error('Failed to assign booking', appError);
    },
  });
};