import { ApiResponse, PaginatedResponse, BulkOperationResponse } from '../types/api.types';
import { v4 as uuidv4 } from 'uuid';

// Versión de la API
const API_VERSION = '1.0.0';

/**
 * Genera una respuesta de éxito estándar
 */
export function successResponse<T>(
  data: T,
  message: string = 'Operación exitosa',
  operation: string = 'UNKNOWN'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      operation,
      version: API_VERSION,
      requestId: uuidv4()
    }
  };
}

/**
 * Genera una respuesta de error estándar
 */
export function errorResponse(
  message: string,
  errors?: any[],
  operation: string = 'UNKNOWN'
): ApiResponse {
  return {
    success: false,
    message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      operation,
      version: API_VERSION,
      requestId: uuidv4()
    }
  };
}

/**
 * Genera una respuesta paginada
 */
export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Datos obtenidos exitosamente',
  operation: string = 'LIST',
  filters?: Record<string, any>,
  sorting?: { field: string; direction: 'asc' | 'desc' }
): PaginatedResponse<T> {
  const pages = Math.ceil(total / limit);
  const hasNext = page < pages;
  const hasPrev = page > 1;

  return {
    success: true,
    message,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext,
        hasPrev
      },
      filters,
      sorting
    },
    meta: {
      timestamp: new Date().toISOString(),
      operation,
      version: API_VERSION,
      requestId: uuidv4()
    }
  };
}

/**
 * Genera una respuesta para operaciones masivas
 */
export function bulkOperationResponse(
  total: number,
  successful: number,
  failed: number,
  results: {
    successful: Array<{ id: number; data: any }>;
    failed: Array<{ data: any; errors: string[] }>;
  },
  message: string = 'Operación masiva completada',
  operation: string = 'BULK_OPERATION'
): BulkOperationResponse {
  return {
    success: true,
    message,
    data: {
      total,
      successful,
      failed,
      results
    },
    meta: {
      timestamp: new Date().toISOString(),
      operation,
      version: API_VERSION,
      requestId: uuidv4()
    }
  };
}

/**
 * Genera un error de validación
 */
export function validationError(
  field: string,
  message: string,
  code: string,
  value?: any
) {
  return {
    field,
    message,
    code,
    value
  };
}

/**
 * Genera múltiples errores de validación
 */
export function validationErrors(errors: Array<{
  field: string;
  message: string;
  code: string;
  value?: any;
}>) {
  return errors.map(error => validationError(
    error.field,
    error.message,
    error.code,
    error.value
  ));
}

/**
 * Genera un error de recurso no encontrado
 */
export function notFoundError(
  resource: string,
  id: string | number,
  operation: string = 'GET'
) {
  return errorResponse(
    `${resource} con ID ${id} no encontrado`,
    [validationError('id', `No existe ${resource} con ID ${id}`, 'NOT_FOUND', id)],
    operation
  );
}

/**
 * Genera un error de validación de datos
 */
export function dataValidationError(
  message: string,
  errors: any[],
  operation: string = 'VALIDATION'
) {
  return errorResponse(message, errors, operation);
}

/**
 * Genera un error de duplicado
 */
export function duplicateError(
  field: string,
  value: any,
  resource: string,
  operation: string = 'CREATE'
) {
  return errorResponse(
    `${resource} ya existe con ${field}: ${value}`,
    [validationError(field, `Ya existe un ${resource} con ${field} ${value}`, 'DUPLICATE', value)],
    operation
  );
} 