import { z } from 'zod';

export const BookingStatusEnum = z.enum(['pending', 'assigned', 'scheduled', 'completed', 'cancelled']);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const WaterBodyTypeEnum = z.enum(['pool', 'spa']);
export type WaterBodyType = z.infer<typeof WaterBodyTypeEnum>;

export const ServiceDayEnum = z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
export type ServiceDay = z.infer<typeof ServiceDayEnum>;

export interface WaterBody {
  type: WaterBodyType;
  size: number;
  features: string[];
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  currentServiceDay?: string;
  preferredDays: string[];
  hasDogs: boolean;
  dogDetails?: string;
  specificConcerns?: string;
  additionalComments?: string;
  gateCode?: string;
  accessNotes?: string;
  waterBodies: WaterBody[];
  status: BookingStatus;
  assignedTechId?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilters {
  status?: string;
  hasDogsOnly?: boolean;
  dateRange?: {
    from: string | null;
    to: string | null;
  };
  technicianId?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface BookingAssignment {
  technicianId: string;
  scheduledDate: Date;
  notes?: string;
}