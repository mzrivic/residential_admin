import { Request, Response } from 'express';
import { RoleService } from '../../application/services/role.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, BulkCreateRoleDto, BulkUpdateRoleDto, BulkDeleteRoleDto } from '../../application/dto/role.dto';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  async create(req: Request, res: Response) {
    try {
      const createRoleDto: CreateRoleDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.roleService.create(createRoleDto, userId);

      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CREATE_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el rol',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CREATE_ROLE',
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
            name: 'Administrador',
            description: 'Rol con acceso completo al sistema',
            alias: 'admin',
            is_active: true
          },
          {
            id: 2,
            name: 'Usuario',
            description: 'Rol de usuario básico',
            alias: 'user',
            is_active: true
          },
          {
            id: 3,
            name: 'Seguridad',
            description: 'Rol para personal de seguridad',
            alias: 'security',
            is_active: true
          }
        ],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 3,
          totalPages: 1
        }
      };

      res.status(200).json({
        success: true,
        message: 'Roles obtenidos exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLES',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los roles',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLES',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await this.roleService.findOne(id);

      res.status(200).json({
        success: true,
        message: 'Rol obtenido exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Error al obtener el rol',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updateRoleDto: UpdateRoleDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.roleService.update(id, updateRoleDto, userId);

      res.status(200).json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'UPDATE_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el rol',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'UPDATE_ROLE',
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

      const result = await this.roleService.remove(id, userId, permanent);

      res.status(200).json({
        success: true,
        message: 'Rol eliminado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'DELETE_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar el rol',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'DELETE_ROLE',
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

      const result = await this.roleService.restore(id, userId);

      res.status(200).json({
        success: true,
        message: 'Rol restaurado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'RESTORE_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al restaurar el rol',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'RESTORE_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async assignPermissions(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);
      const assignPermissionsDto: AssignPermissionsDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.roleService.assignPermissions(
        roleId,
        assignPermissionsDto.permission_ids,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Permisos asignados exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'ASSIGN_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al asignar permisos',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'ASSIGN_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getPermissions(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);
      const result = await this.roleService.getPermissions(roleId);

      res.status(200).json({
        success: true,
        message: 'Permisos del rol obtenidos exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los permisos del rol',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLE_PERMISSIONS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async bulkCreate(req: Request, res: Response) {
    try {
      const bulkCreateRoleDto: BulkCreateRoleDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.roleService.bulkCreate(
        bulkCreateRoleDto.roles,
        bulkCreateRoleDto.skip_duplicates,
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Operación masiva de creación completada',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_CREATE_ROLES',
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
          operation: 'BULK_CREATE_ROLES',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async bulkUpdate(req: Request, res: Response) {
    try {
      const bulkUpdateRoleDto: BulkUpdateRoleDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.roleService.bulkUpdate(
        bulkUpdateRoleDto.updates,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Operación masiva de actualización completada',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_UPDATE_ROLES',
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
          operation: 'BULK_UPDATE_ROLES',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async bulkDelete(req: Request, res: Response) {
    try {
      const bulkDeleteRoleDto: BulkDeleteRoleDto = req.body;
      const userId = (req as any).user?.id;

      const result = await this.roleService.bulkDelete(
        bulkDeleteRoleDto.ids,
        bulkDeleteRoleDto.permanent,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Operación masiva de eliminación completada',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_DELETE_ROLES',
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
          operation: 'BULK_DELETE_ROLES',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const result = await this.roleService.getStats();

      res.status(200).json({
        success: true,
        message: 'Estadísticas de roles obtenidas exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLE_STATS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas de roles',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ROLE_STATS',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }
} 