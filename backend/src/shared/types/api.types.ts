// Tipos para respuestas de API estandarizadas

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    operation: string;
    version: string;
    requestId: string;
  };
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters?: Record<string, any>;
    sorting?: {
      field: string;
      direction: 'asc' | 'desc';
    };
  };
  meta: {
    timestamp: string;
    operation: string;
    version: string;
    requestId: string;
  };
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    results: {
      successful: Array<{ id: number; data: any }>;
      failed: Array<{ data: any; errors: string[] }>;
    };
  };
  meta: {
    timestamp: string;
    operation: string;
    version: string;
    requestId: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  filters?: Record<string, any>;
}

// Tipos para estadísticas
export interface PersonStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  createdThisMonth: number;
  createdThisYear: number;
}

// Tipos para auditoría
export interface AuditLog {
  id: number;
  tableName: string;
  recordId: number;
  operation: string;
  oldValues?: any;
  newValues?: any;
  changedFields: string[];
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
} 