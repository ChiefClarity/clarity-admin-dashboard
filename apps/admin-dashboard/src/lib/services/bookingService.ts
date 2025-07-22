import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { errorHandler } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';
import { FEATURES } from '@/config/features';

// Strict schemas
const BookingSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}$/),
  currentServiceDay: z.string().optional(),
  preferredDays: z.array(z.string()),
  hasDogs: z.boolean(),
  dogDetails: z.string().optional(),
  specificConcerns: z.string().optional(),
  additionalComments: z.string().optional(),
  gateCode: z.string().optional(),
  accessNotes: z.string().optional(),
  waterBodies: z.array(z.object({
    type: z.enum(['pool', 'spa']),
    size: z.number(),
    features: z.array(z.string()),
  })),
  status: z.enum(['pending', 'assigned', 'scheduled', 'completed', 'cancelled']),
  assignedTechId: z.string().uuid().optional(),
  assignedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Booking = z.infer<typeof BookingSchema>;

const BookingFiltersSchema = z.object({
  status: z.string().optional(),
  hasDogsOnly: z.boolean().optional(),
  dateRange: z.object({
    from: z.string().datetime().nullable(),
    to: z.string().datetime().nullable(),
  }).optional(),
  technicianId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
});

export type BookingFilters = z.infer<typeof BookingFiltersSchema>;

class BookingService {
  private readonly basePath = '/api/bookings';

  async getBookings(filters: Partial<BookingFilters> = {}) {
    try {
      const validatedFilters = BookingFiltersSchema.parse({
        page: 1,
        limit: 20,
        ...filters,
      });

      if (FEATURES.USE_REAL_API) {
        const response = await apiClient.get<{
          bookings: unknown[];
          total: number;
          page: number;
          totalPages: number;
        }>(this.basePath, { params: validatedFilters });

        // Validate each booking
        const bookings = response.bookings.map(booking => 
          BookingSchema.parse(booking)
        );

        logger.info('Fetched bookings', { count: bookings.length });

        return {
          ...response,
          bookings,
        };
      } else {
        // Mock implementation for development
        return this.getMockBookings(validatedFilters);
      }
    } catch (error) {
      const appError = errorHandler.handleError(error, 'BookingService.getBookings');
      throw appError;
    }
  }

  async getBooking(id: string) {
    try {
      z.string().uuid().parse(id);

      if (FEATURES.USE_REAL_API) {
        const booking = await apiClient.get<unknown>(`${this.basePath}/${id}`);
        return BookingSchema.parse(booking);
      } else {
        return this.getMockBooking(id);
      }
    } catch (error) {
      const appError = errorHandler.handleError(error, 'BookingService.getBooking');
      throw appError;
    }
  }

  async assignTechnician(
    bookingId: string,
    data: {
      technicianId: string;
      scheduledDate: Date;
      notes?: string;
    }
  ) {
    try {
      // Validate inputs
      z.string().uuid().parse(bookingId);
      z.string().uuid().parse(data.technicianId);

      if (FEATURES.USE_REAL_API) {
        const response = await apiClient.put<unknown>(
          `${this.basePath}/${bookingId}/assign`,
          data
        );

        const updated = BookingSchema.parse(response);
        logger.info('Assigned booking to technician', {
          bookingId,
          technicianId: data.technicianId,
        });

        return updated;
      } else {
        return this.mockAssignTechnician(bookingId, data);
      }
    } catch (error) {
      const appError = errorHandler.handleError(error, 'BookingService.assignTechnician');
      throw appError;
    }
  }

  // Mock implementations
  private getMockBookings(filters: BookingFilters) {
    const mockBookings: Booking[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: '123e4567-e89b-12d3-a456-426614174001',
        customerName: 'John Smith',
        email: 'john.smith@example.com',
        phone: '555-0123',
        address: '123 Pool Lane',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        currentServiceDay: 'Wednesday',
        preferredDays: ['Wednesday', 'Thursday'],
        hasDogs: true,
        dogDetails: 'Two friendly golden retrievers',
        specificConcerns: 'Green pool, needs immediate attention',
        waterBodies: [
          {
            type: 'pool',
            size: 15000,
            features: ['salt-system', 'heater'],
          },
        ],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return {
      bookings: mockBookings,
      total: mockBookings.length,
      page: filters.page,
      totalPages: 1,
    };
  }

  private getMockBooking(id: string): Booking {
    return this.getMockBookings({ page: 1, limit: 1 }).bookings[0];
  }

  private mockAssignTechnician(
    bookingId: string,
    data: any
  ): Booking {
    const booking = this.getMockBooking(bookingId);
    return {
      ...booking,
      status: 'assigned',
      assignedTechId: data.technicianId,
      assignedAt: new Date().toISOString(),
    };
  }
}

export const bookingService = new BookingService();