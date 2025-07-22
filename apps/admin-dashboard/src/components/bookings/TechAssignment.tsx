import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Booking } from '@/lib/types/booking';
import { useAssignBooking } from '@/lib/hooks/useBookings';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Dog, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TechAssignmentProps {
  booking: Booking;
  onClose: () => void;
  onAssign: () => void;
}

export function TechAssignment({ booking, onClose, onAssign }: TechAssignmentProps) {
  const [selectedTech, setSelectedTech] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const assignMutation = useAssignBooking();

  const handleAssign = async () => {
    if (!selectedTech || !scheduledDate) return;

    try {
      await assignMutation.mutateAsync({
        bookingId: booking.id,
        assignment: {
          technicianId: selectedTech,
          scheduledDate,
          notes,
        },
      });
      onAssign();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Mock technicians data
  const technicians = [
    { id: 'tech-1', name: 'John Doe', route: 'North Miami', availability: 'Available' },
    { id: 'tech-2', name: 'Jane Smith', route: 'South Miami', availability: 'Available' },
    { id: 'tech-3', name: 'Mike Johnson', route: 'Coral Gables', availability: 'Busy' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-muted-foreground">{booking.email}</p>
                {booking.phone && <p className="text-muted-foreground">{booking.phone}</p>}
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p>{booking.address}</p>
                    <p className="text-muted-foreground">
                      {booking.city}, {booking.state} {booking.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Alerts */}
            <div className="flex flex-wrap gap-2 pt-2">
              {booking.hasDogs && (
                <Badge variant="warning">
                  <Dog className="h-3 w-3 mr-1" />
                  Dogs on property
                </Badge>
              )}
              {booking.specificConcerns && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Has concerns
                </Badge>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          {(booking.specificConcerns || booking.dogDetails || booking.accessNotes) && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
              <h3 className="font-semibold text-sm">Important Notes</h3>
              {booking.specificConcerns && (
                <div>
                  <p className="text-sm font-medium">Concerns:</p>
                  <p className="text-sm text-muted-foreground">{booking.specificConcerns}</p>
                </div>
              )}
              {booking.dogDetails && (
                <div>
                  <p className="text-sm font-medium">Dog Details:</p>
                  <p className="text-sm text-muted-foreground">{booking.dogDetails}</p>
                </div>
              )}
              {booking.accessNotes && (
                <div>
                  <p className="text-sm font-medium">Access Notes:</p>
                  <p className="text-sm text-muted-foreground">{booking.accessNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Assignment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="technician">Select Technician</Label>
              <Select value={selectedTech} onValueChange={setSelectedTech}>
                <SelectTrigger id="technician">
                  <SelectValue placeholder="Choose a technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tech.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {tech.route} • {tech.availability}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Schedule Date</Label>
              <Button
                id="date"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
              </Button>
              {showCalendar && (
                <div className="mt-2">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      setScheduledDate(date);
                      setShowCalendar(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Assignment Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions for the technician..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedTech || !scheduledDate || assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign Technician'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}