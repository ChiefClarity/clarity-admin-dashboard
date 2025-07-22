import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from 'lucide-react';

interface BookingFiltersProps {
  filters: {
    status: string;
    hasDogsOnly: boolean;
    dateRange: {
      from: string | null;
      to: string | null;
    };
  };
  onFiltersChange: (filters: any) => void;
}

export function BookingFilters({ filters, onFiltersChange }: BookingFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const handleDogsToggle = (checked: boolean) => {
    onFiltersChange({ ...filters, hasDogsOnly: checked });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4 bg-card">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="status">Status</Label>
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="dogs-only"
          checked={filters.hasDogsOnly}
          onCheckedChange={handleDogsToggle}
        />
        <Label htmlFor="dogs-only" className="cursor-pointer">
          Dogs only
        </Label>
      </div>

      <Button variant="outline" size="sm">
        <Calendar className="mr-2 h-4 w-4" />
        Date Range
      </Button>

      <Button variant="outline" size="sm">
        Clear Filters
      </Button>
    </div>
  );
}