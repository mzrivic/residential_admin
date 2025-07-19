import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';

export interface AuditData {
  tableName: string;
  recordId: number;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
}

/**
 * Middleware de auditoría para registrar cambios automáticamente
 */
export const auditMiddleware = (operation: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const auditData: AuditData = {
      tableName: 'person', // Por defecto, se puede personalizar
      recordId: 0,
      operation: 'CREATE' as any
    };

    // Interceptar la respuesta para obtener el ID del registro creado/actualizado
    res.send = function(data) {
      try {
        if (data && typeof data === 'string') {
          const parsedData = JSON.parse(data);
          if (parsedData.success && parsedData.data) {
            if (parsedData.data.id) {
              auditData.recordId = parsedData.data.id;
            } else if (Array.isArray(parsedData.data.items) && parsedData.data.items.length > 0) {
              auditData.recordId = parsedData.data.items[0].id;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing response for audit:', error);
      }

      // Registrar auditoría
      recordAudit(auditData, req);

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Función para registrar auditoría manualmente
 */
export const recordAudit = async (auditData: AuditData, req: Request) => {
  try {
    await prisma.audit_log.create({
      data: {
        table_name: auditData.tableName,
        record_id: auditData.recordId,
        operation: auditData.operation,
        old_values: auditData.oldValues ? JSON.stringify(auditData.oldValues) : null,
        new_values: auditData.newValues ? JSON.stringify(auditData.newValues) : null,
        changed_fields: auditData.changedFields || [],
        user_id: (req as any).user?.id || null,
        ip_address: req.ip || req.connection.remoteAddress || null,
        user_agent: req.get('User-Agent') || null,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error recording audit log:', error);
  }
};

/**
 * Middleware para capturar datos antes de la actualización
 */
export const captureOldValues = (tableName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    
    if (id && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
      try {
        // Obtener valores antiguos antes de la actualización
        const oldRecord = await prisma[tableName as any].findFirst({
          where: {
            id: parseInt(id),
            deleted_at: null
          }
        });

        if (oldRecord) {
          (req as any).oldValues = oldRecord;
        }
      } catch (error) {
        console.error('Error capturing old values:', error);
      }
    }

    next();
  };
};

/**
 * Función para comparar valores y detectar cambios
 */
export const detectChanges = (oldValues: any, newValues: any): string[] => {
  const changedFields: string[] = [];
  
  if (!oldValues || !newValues) return changedFields;

  for (const key in newValues) {
    if (oldValues[key] !== newValues[key]) {
      changedFields.push(key);
    }
  }

  return changedFields;
};

/**
 * Middleware para auditoría automática de operaciones CRUD
 */
export const autoAuditMiddleware = (tableName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' = 'CREATE';
    let recordId = 0;
    let oldValues: any = null;
    let newValues: any = null;

    // Determinar operación basada en el método HTTP
    switch (req.method) {
      case 'POST':
        operation = 'CREATE';
        break;
      case 'PUT':
      case 'PATCH':
        operation = 'UPDATE';
        oldValues = (req as any).oldValues;
        newValues = req.body;
        break;
      case 'DELETE':
        operation = 'DELETE';
        oldValues = (req as any).oldValues;
        break;
    }

    // Interceptar respuesta para obtener ID
    res.send = function(data) {
      try {
        if (data && typeof data === 'string') {
          const parsedData = JSON.parse(data);
          if (parsedData.success && parsedData.data) {
            if (parsedData.data.id) {
              recordId = parsedData.data.id;
            } else if (Array.isArray(parsedData.data.items) && parsedData.data.items.length > 0) {
              recordId = parsedData.data.items[0].id;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing response for audit:', error);
      }

      // Registrar auditoría
      const changedFields = oldValues && newValues ? detectChanges(oldValues, newValues) : [];
      
      recordAudit({
        tableName,
        recordId,
        operation,
        oldValues,
        newValues,
        changedFields
      }, req);

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Función para obtener historial de auditoría
 */
export const getAuditHistory = async (tableName: string, recordId: number) => {
  try {
    const auditLogs = await prisma.audit_log.findMany({
      where: {
        table_name: tableName,
        record_id: recordId
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            username: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return auditLogs;
  } catch (error) {
    console.error('Error getting audit history:', error);
    throw error;
  }
};

/**
 * Función para exportar auditoría
 */
export const exportAuditLogs = async (filters: any = {}) => {
  try {
    const auditLogs = await prisma.audit_log.findMany({
      where: {
        ...filters
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            username: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return auditLogs;
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
}; 