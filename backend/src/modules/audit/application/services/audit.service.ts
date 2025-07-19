import { successResponse, paginatedResponse } from '../../../../shared/utils/response.utils';
import prisma from '../../../../config/database';

export class AuditService {

  /**
   * Obtener historial de auditoría de un registro específico
   */
  async getRecordHistory(tableName: string, recordId: number, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const total = await prisma.audit_log.count({
        where: {
          table_name: tableName,
          record_id: recordId
        }
      });

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
        },
        skip,
        take: limit
      });

      return paginatedResponse(
        auditLogs,
        page,
        limit,
        total,
        'Historial de auditoría obtenido exitosamente',
        'GET_AUDIT_HISTORY'
      );

    } catch (error) {
      throw new Error(`Error al obtener historial de auditoría: ${error.message}`);
    }
  }

  /**
   * Obtener auditoría general con filtros
   */
  async getAuditLogs(filters: any = {}, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {};

      // Aplicar filtros
      if (filters.table_name) {
        where.table_name = filters.table_name;
      }

      if (filters.operation) {
        where.operation = filters.operation;
      }

      if (filters.user_id) {
        where.user_id = parseInt(filters.user_id);
      }

      if (filters.created_after) {
        where.created_at = {
          gte: new Date(filters.created_after)
        };
      }

      if (filters.created_before) {
        where.created_at = {
          ...where.created_at,
          lte: new Date(filters.created_before)
        };
      }

      const total = await prisma.audit_log.count({ where });

      const auditLogs = await prisma.audit_log.findMany({
        where,
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
        },
        skip,
        take: limit
      });

      return paginatedResponse(
        auditLogs,
        page,
        limit,
        total,
        'Logs de auditoría obtenidos exitosamente',
        'GET_AUDIT_LOGS',
        filters
      );

    } catch (error) {
      throw new Error(`Error al obtener logs de auditoría: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de auditoría
   */
  async getAuditStats(filters: any = {}) {
    try {
      const where: any = {};

      // Aplicar filtros de fecha si se proporcionan
      if (filters.created_after || filters.created_before) {
        where.created_at = {};
        if (filters.created_after) {
          where.created_at.gte = new Date(filters.created_after);
        }
        if (filters.created_before) {
          where.created_at.lte = new Date(filters.created_before);
        }
      }

      // Estadísticas por operación
      const operationsStats = await prisma.audit_log.groupBy({
        by: ['operation'],
        where,
        _count: {
          operation: true
        }
      });

      // Estadísticas por tabla
      const tablesStats = await prisma.audit_log.groupBy({
        by: ['table_name'],
        where,
        _count: {
          table_name: true
        }
      });

      // Estadísticas por usuario
      const usersStats = await prisma.audit_log.groupBy({
        by: ['user_id'],
        where,
        _count: {
          user_id: true
        }
      });

      // Total de registros
      const total = await prisma.audit_log.count({ where });

      // Registros de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await prisma.audit_log.count({
        where: {
          ...where,
          created_at: {
            gte: today
          }
        }
      });

      // Registros de esta semana
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekCount = await prisma.audit_log.count({
        where: {
          ...where,
          created_at: {
            gte: weekAgo
          }
        }
      });

      // Registros de este mes
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthCount = await prisma.audit_log.count({
        where: {
          ...where,
          created_at: {
            gte: monthAgo
          }
        }
      });

      const stats = {
        total,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        byOperation: operationsStats.map(stat => ({
          operation: stat.operation,
          count: stat._count.operation
        })),
        byTable: tablesStats.map(stat => ({
          table: stat.table_name,
          count: stat._count.table_name
        })),
        byUser: usersStats.map(stat => ({
          userId: stat.user_id,
          count: stat._count.user_id
        }))
      };

      return successResponse(
        stats,
        'Estadísticas de auditoría obtenidas exitosamente',
        'GET_AUDIT_STATS'
      );

    } catch (error) {
      throw new Error(`Error al obtener estadísticas de auditoría: ${error.message}`);
    }
  }

  /**
   * Exportar auditoría a CSV
   */
  async exportAuditLogs(filters: any = {}) {
    try {
      const where: any = {};

      // Aplicar filtros
      if (filters.table_name) {
        where.table_name = filters.table_name;
      }

      if (filters.operation) {
        where.operation = filters.operation;
      }

      if (filters.user_id) {
        where.user_id = parseInt(filters.user_id);
      }

      if (filters.created_after) {
        where.created_at = {
          gte: new Date(filters.created_after)
        };
      }

      if (filters.created_before) {
        where.created_at = {
          ...where.created_at,
          lte: new Date(filters.created_before)
        };
      }

      const auditLogs = await prisma.audit_log.findMany({
        where,
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

      // Preparar datos para CSV
      const csvData = auditLogs.map(log => ({
        id: log.id,
        table_name: log.table_name,
        record_id: log.record_id,
        operation: log.operation,
        old_values: log.old_values,
        new_values: log.new_values,
        changed_fields: log.changed_fields.join(', '),
        user_id: log.user_id,
        user_name: log.user?.full_name || 'N/A',
        user_username: log.user?.username || 'N/A',
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at
      }));

      return successResponse(
        {
          data: csvData,
          totalRecords: csvData.length,
          filters
        },
        'Auditoría exportada exitosamente',
        'EXPORT_AUDIT'
      );

    } catch (error) {
      throw new Error(`Error al exportar auditoría: ${error.message}`);
    }
  }

  /**
   * Limpiar logs de auditoría antiguos
   */
  async cleanOldAuditLogs(daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deletedCount = await prisma.audit_log.deleteMany({
        where: {
          created_at: {
            lt: cutoffDate
          }
        }
      });

      return successResponse(
        {
          deletedCount: deletedCount.count,
          cutoffDate: cutoffDate,
          daysKept: daysToKeep
        },
        'Logs de auditoría antiguos eliminados exitosamente',
        'CLEAN_AUDIT_LOGS'
      );

    } catch (error) {
      throw new Error(`Error al limpiar logs de auditoría: ${error.message}`);
    }
  }

  /**
   * Obtener resumen de cambios por período
   */
  async getChangesSummary(startDate: Date, endDate: Date) {
    try {
      const changes = await prisma.audit_log.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          }
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

      // Agrupar cambios por tabla
      const changesByTable = changes.reduce((acc, change) => {
        if (!acc[change.table_name]) {
          acc[change.table_name] = {
            table: change.table_name,
            total: 0,
            creates: 0,
            updates: 0,
            deletes: 0,
            restores: 0
          };
        }

        acc[change.table_name].total++;
        
        switch (change.operation) {
          case 'CREATE':
            acc[change.table_name].creates++;
            break;
          case 'UPDATE':
            acc[change.table_name].updates++;
            break;
          case 'DELETE':
            acc[change.table_name].deletes++;
            break;
          case 'RESTORE':
            acc[change.table_name].restores++;
            break;
        }

        return acc;
      }, {} as any);

      // Agrupar cambios por usuario
      const changesByUser = changes.reduce((acc, change) => {
        const userId = change.user_id || 'anonymous';
        const userName = change.user?.full_name || 'Usuario Anónimo';
        
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName,
            total: 0,
            operations: {}
          };
        }

        acc[userId].total++;
        
        if (!acc[userId].operations[change.operation]) {
          acc[userId].operations[change.operation] = 0;
        }
        acc[userId].operations[change.operation]++;

        return acc;
      }, {} as any);

      const summary = {
        period: {
          start: startDate,
          end: endDate
        },
        totalChanges: changes.length,
        changesByTable: Object.values(changesByTable),
        changesByUser: Object.values(changesByUser),
        recentChanges: changes.slice(0, 10) // Últimos 10 cambios
      };

      return successResponse(
        summary,
        'Resumen de cambios obtenido exitosamente',
        'GET_CHANGES_SUMMARY'
      );

    } catch (error) {
      throw new Error(`Error al obtener resumen de cambios: ${error.message}`);
    }
  }
} 