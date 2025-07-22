import { BookingTable } from '@/components/bookings/BookingTable';

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage new bookings and assign technicians
        </p>
      </div>
      
      <BookingTable />
    </div>
  );
}