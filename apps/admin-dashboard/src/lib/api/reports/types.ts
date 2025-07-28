export interface ReportConfig {
  enabled: boolean;
  defaultDelay: number;
  includeCharts: boolean;
  aiProvider: string;
  weatherEnabled: boolean;
  defaultFormat: string;
  scheduleCron: string;
}

export interface ReportHistoryRecord {
  id: number;
  customerId: number;
  jobId: number;
  sentAt: string;
  healthScore: number;
  reportType: string;
  opened: boolean;
  deliveryStatus?: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    poolDetails?: {
      poolType?: string;
      poolSize?: string;
    };
  };
}

export interface ReportHistoryResponse {
  reports: ReportHistoryRecord[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  offset: number;
}

export interface ReportAnalytics {
  totalSent: number;
  totalOpened: number;
  openRate: number;
  avgHealthScore: number;
  uniqueCustomers: number;
  deliveryRate: number;
  byDay: Array<{
    date: string;
    count: number;
  }>;
}

export interface ReportPreview {
  html: string;
  previewMode: boolean;
  generatedAt: string;
  customerId: number;
}

export interface ReportPreferences {
  id: number;
  customerId: number;
  enabled: boolean;
  reportDelay: number;
  includeCharts: boolean;
  preferredFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkSendResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    customerId: number;
    success: boolean;
    error?: string;
    jobId?: number;
  }>;
}