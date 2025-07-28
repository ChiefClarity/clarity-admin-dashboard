export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  poolDetails?: {
    poolType?: string;
    poolSize?: string;
    equipment?: string[];
  };
  createdAt: string;
  updatedAt: string;
}