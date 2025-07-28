import { apiClient } from '@/lib/api/client';
import type { 
  ReportConfig, 
  ReportHistoryResponse, 
  ReportAnalytics,
  ReportPreview,
  ReportPreferences,
  BulkSendResult 
} from './types';

export const reportsApi = {
  // Configuration
  getConfig: () => 
    apiClient.get<ReportConfig>('/api/admin/reports/weekly/config'),
    
  updateConfig: (config: Partial<ReportConfig>) => 
    apiClient.put<ReportConfig>('/api/admin/reports/weekly/config', config),
  
  // History
  getHistory: (filters: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
    limit?: number;
    offset?: number;
  }) => 
    apiClient.get<ReportHistoryResponse>('/api/admin/reports/weekly/history', { 
      params: filters 
    }),
  
  // Analytics
  getAnalytics: (days: number = 30) => 
    apiClient.get<ReportAnalytics>('/api/admin/reports/weekly/analytics', { 
      params: { days } 
    }),
  
  // Test & Preview
  sendTest: (customerId: number) => 
    apiClient.post<{ success: boolean; message: string; jobId?: number }>(
      `/api/admin/reports/weekly/test/${customerId}`
    ),
    
  preview: (customerId: number) => 
    apiClient.get<ReportPreview>(
      `/api/admin/reports/weekly/preview/${customerId}`
    ),
  
  // Customer Preferences
  getPreferences: (customerId: number) => 
    apiClient.get<ReportPreferences>(
      `/api/admin/reports/preferences/${customerId}`
    ),
    
  updatePreferences: (customerId: number, preferences: Partial<ReportPreferences>) => 
    apiClient.put<ReportPreferences>(
      `/api/admin/reports/preferences/${customerId}`, 
      preferences
    ),
  
  // Bulk Operations
  sendBulk: (customerIds: number[]) => 
    apiClient.post<BulkSendResult>('/api/admin/reports/weekly/bulk-send', { 
      customerIds 
    }),
};