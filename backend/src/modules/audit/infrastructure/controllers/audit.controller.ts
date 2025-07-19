import { Request, Response } from 'express';
import { AuditService } from '../../application/services/audit.service';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  async getAuditHistory(req: Request, res: Response) {
    try {
      const tableName = req.params.table;
      const recordId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.auditService.getAuditHistory(tableName, recordId, page, limit);

      res.status(200).json({
        success: true,
        message: 'Historial de auditoría obtenido exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AUDIT_HISTORY',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener el historial de auditoría',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AUDIT_HISTORY',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const filters = {
        table_name: req.query.table_name as string,
        operation: req.query.operation as string,
        user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string
      };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.auditService.getAuditLogs(filters, page, limit);

      res.status(200).json({
        success: true,
        message: 'Logs de auditoría obtenidos exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AUDIT_LOGS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los logs de auditoría',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AUDIT_LOGS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getAuditStats(req: Request, res: Response) {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      const result = await this.auditService.getAuditStats(startDate, endDate);

      res.status(200).json({
        success: true,
        message: 'Estadísticas de auditoría obtenidas exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AUDIT_STATS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas de auditoría',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AUDIT_STATS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async exportAuditLogs(req: Request, res: Response) {
    try {
      const filters = {
        table_name: req.query.table_name as string,
        operation: req.query.operation as string,
        user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string
      };
      const format = (req.query.format as string) || 'csv';

      const result = await this.auditService.exportAuditLogs(filters, format);

      res.status(200).json({
        success: true,
        message: 'Logs de auditoría exportados exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'EXPORT_AUDIT_LOGS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al exportar logs de auditoría',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'EXPORT_AUDIT_LOGS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async cleanOldAuditLogs(req: Request, res: Response) {
    try {
      const daysToKeep = parseInt(req.query.days as string) || 90;
      const dryRun = req.query.dry_run === 'true';

      const result = await this.auditService.cleanOldAuditLogs(daysToKeep, dryRun);

      res.status(200).json({
        success: true,
        message: dryRun ? 'Simulación de limpieza completada' : 'Limpieza de logs antiguos completada',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CLEAN_AUDIT_LOGS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al limpiar logs antiguos',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CLEAN_AUDIT_LOGS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getChangeSummary(req: Request, res: Response) {
    try {
      const tableName = req.params.table;
      const recordId = parseInt(req.params.id);
      const operation = req.params.operation;

      const result = await this.auditService.getChangeSummary(tableName, recordId, operation);

      res.status(200).json({
        success: true,
        message: 'Resumen de cambios obtenido exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_CHANGE_SUMMARY',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener el resumen de cambios',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_CHANGE_SUMMARY',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.auditService.getUserActivity(userId, startDate, endDate, page, limit);

      res.status(200).json({
        success: true,
        message: 'Actividad del usuario obtenida exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_USER_ACTIVITY',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener la actividad del usuario',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_USER_ACTIVITY',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }
} 