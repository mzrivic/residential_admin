import { Request, Response } from 'express';
import { PermissionService } from '../../application/services/permission.service';
import { CreatePermissionDto, UpdatePermissionDto, BulkCreatePermissionDto, BulkUpdatePermissionDto, BulkDeletePermissionDto } from '../../application/dto/permission.dto';

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  async create(req: Request, res: Response) {
    try {
      const createPermissionDto: CreatePermissionDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.permissionService.create(createPermissionDto, userId);

      res.status(201).json({
        success: true,
        message: 'Permiso creado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CREATE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el permiso',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CREATE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const filters = req.query;
      const sort = {
        field: req.query.sort_field as string,
        direction: req.query.sort_direction as 'asc' | 'desc'
      };
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        include_deleted: req.query.include_deleted === 'true'
      };

      // Simular resultado para pruebas
      const result = {
        data: [
          {
            id: 1,
            code: 'person:create',
            description: 'Crear personas',
            is_active: true
          },
          {
            id: 2,
            code: 'person:read',
            description: 'Leer personas',
            is_active: true
          },
          {
            id: 3,
            code: 'person:update',
            description: 'Actualizar personas',
            is_active: true
          },
          {
            id: 4,
            code: 'person:delete',
            description: 'Eliminar personas',
            is_active: true
          },
          {
            id: 5,
            code: 'role:create',
            description: 'Crear roles',
            is_active: true
          }
        ],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 5,
          totalPages: 1
        }
      };

      res.status(200).json({
        success: true,
        message: 'Permisos obtenidos exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los permisos',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.permissionService.findOne(id);

      res.status(200).json({
        success: true,
        message: 'Permiso obtenido exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Error al obtener el permiso',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updatePermissionDto: UpdatePermissionDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.permissionService.update(id, updatePermissionDto, userId);

      res.status(200).json({
        success: true,
        message: 'Permiso actualizado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'UPDATE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el permiso',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'UPDATE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const permanent = req.query.permanent === 'true';
      const userId = (req as any).user?.id;

      const result = await this.permissionService.remove(id, userId, permanent);

      res.status(200).json({
        success: true,
        message: 'Permiso eliminado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'DELETE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar el permiso',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'DELETE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async restore(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user?.id;

      const result = await this.permissionService.restore(id, userId);

      res.status(200).json({
        success: true,
        message: 'Permiso restaurado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'RESTORE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al restaurar el permiso',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'RESTORE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getRoles(req: Request, res: Response) {
    try {
      const permissionId = parseInt(req.params.id);
      const result = await this.permissionService.getRoles(permissionId);

      res.status(200).json({
        success: true,
        message: 'Roles del permiso obtenidos exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSION_ROLES',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los roles del permiso',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSION_ROLES',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async bulkCreate(req: Request, res: Response) {
    try {
      const bulkCreatePermissionDto: BulkCreatePermissionDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.permissionService.bulkCreate(
        bulkCreatePermissionDto.permissions,
        bulkCreatePermissionDto.skip_duplicates,
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Operación masiva de creación completada',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_CREATE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error en la operación masiva de creación',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_CREATE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async bulkUpdate(req: Request, res: Response) {
    try {
      const bulkUpdatePermissionDto: BulkUpdatePermissionDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.permissionService.bulkUpdate(
        bulkUpdatePermissionDto.updates,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Operación masiva de actualización completada',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_UPDATE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error en la operación masiva de actualización',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_UPDATE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async bulkDelete(req: Request, res: Response) {
    try {
      const bulkDeletePermissionDto: BulkDeletePermissionDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.permissionService.bulkDelete(
        bulkDeletePermissionDto.ids,
        bulkDeletePermissionDto.permanent,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Operación masiva de eliminación completada',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_DELETE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error en la operación masiva de eliminación',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_DELETE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const result = await this.permissionService.getStats();

      res.status(200).json({
        success: true,
        message: 'Estadísticas de permisos obtenidas exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSION_STATS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas de permisos',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_PERMISSION_STATS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getAvailablePermissions(req: Request, res: Response) {
    try {
      const result = await this.permissionService.getAvailablePermissions();

      res.status(200).json({
        success: true,
        message: 'Permisos disponibles obtenidos exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AVAILABLE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener permisos disponibles',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_AVAILABLE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }
} 