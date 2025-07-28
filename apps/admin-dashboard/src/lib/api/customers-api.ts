import { apiClient } from '@/lib/api/client';
import type { Customer, CustomerListResponse } from '@/types/customer';

export const customersApi = {
  getAllCustomers: (params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) => apiClient.get<CustomerListResponse>('/api/customers', { params }),

  searchCustomers: (params: {
    query: string;
    limit?: number;
  }) => apiClient.get<CustomerListResponse>('/api/customers/search', { params }),

  getCustomer: (id: number) => 
    apiClient.get<Customer>(`/api/customers/${id}`),
};