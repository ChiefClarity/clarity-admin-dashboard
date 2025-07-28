import { apiClient } from '@/lib/api/client';
import type { Customer } from '@/types/customer';

interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export const customersApi = {
  getAllCustomers: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<CustomerListResponse>('/api/admin/customers', { params }),

  searchCustomers: (params: { query: string; limit?: number }) =>
    apiClient.get<CustomerListResponse>('/api/admin/customers/search', { params }),

  getCustomer: (id: number) =>
    apiClient.get<Customer>(`/api/admin/customers/${id}`),
};