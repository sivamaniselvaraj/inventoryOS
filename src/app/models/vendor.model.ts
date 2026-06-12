export type VendorStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type VendorCategory = 'technology' | 'logistics' | 'manufacturing' | 'services' | 'consulting' | 'supplies';
export type ContactRole = 'primary' | 'billing' | 'technical' | 'operations' | 'management' | 'other';

export interface VendorContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ContactRole;
  isPrimary: boolean;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  contacts: VendorContact[];
  address: string;
  city: string;
  country: string;
  status: VendorStatus;
  category: VendorCategory;
  contractValue: number;
  rating: number;
  joinedDate: string;
  lastActivity: string;
  taxId: string;
  website?: string;
  notes?: string;
  isActive:boolean;
}

export interface VendorFilter {
  search?: string;
  status?: VendorStatus | '';
  category?: VendorCategory | '';
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description?: string;
  parameters?: ApiParameter[];
  requestBody?: any;
  responses?: Record<string, any>;
  tags?: string[];
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  description?: string;
  schema?: any;
}

export interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, any>;
  components?: any;
}
