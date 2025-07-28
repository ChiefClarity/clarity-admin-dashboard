import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { customersApi } from '@/lib/api/customers-api';
import { useDebounce } from '@/hooks/useDebounce';
import type { Customer } from '@/types/customer';

interface CustomerSearchProps {
  value: Customer | null;
  onSelect: (customer: Customer | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomerSearch({ 
  value, 
  onSelect, 
  placeholder = "Search customers...",
  disabled = false 
}: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', 'search', debouncedSearch],
    queryFn: () => customersApi.searchCustomers({ 
      query: debouncedSearch,
      limit: 10 
    }).then(res => res.customers),
    enabled: debouncedSearch.length > 0 && open,
  });

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={value ? `${value.firstName} ${value.lastName}` : placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              disabled={disabled}
              className="pl-10 pr-10"
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandList>
              {isLoading && (
                <CommandEmpty>Searching...</CommandEmpty>
              )}
              {!isLoading && customers?.length === 0 && (
                <CommandEmpty>No customers found.</CommandEmpty>
              )}
              {customers && customers.length > 0 && (
                <CommandGroup>
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      onSelect={() => handleSelect(customer)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                        {customer.address && (
                          <div className="text-xs text-muted-foreground">
                            {customer.address}, {customer.city}, {customer.state}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}