import { PrismaClient } from '../../../../../generated/prisma';
import { CreatePermissionDto, UpdatePermissionDto, PermissionFiltersDto, PermissionSortDto, PermissionPaginationDto } from '../dto/permission.dto';

export class PermissionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(createPermissionDto: CreatePermissionDto, userId?: number) {
    try {
      // Verificar si el permiso ya existe
      const existingPermission = await this.prisma.permission.findFirst({
        where: {
          code: createPermissionDto.code,
          deleted_at: null
        }
      });

      if (existingPermission) {
        throw new Error('El permiso ya existe');
      }

      // Crear el permiso
      const permission = await this.prisma.permission.create({
        data: {
          code: createPermissionDto.code,
          description: createPermissionDto.description,
          is_active: createPermissionDto.is_active ?? true,
          created_by: userId
        },
        include: {
          role_permission: {
            include: {
              role: true
            }
          }
        }
      });

      return this.formatPermissionResponse(permission);
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters?: PermissionFiltersDto, sort?: PermissionSortDto, pagination?: PermissionPaginationDto) {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      // Construir where clause
      const where: any = {
        deleted_at: pagination?.include_deleted ? undefined : null
      };

      if (filters?.search) {
        where.OR = [
          { code: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters?.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      if (filters?.role_ids && filters.role_ids.length > 0) {
        where.role_permission = {
          some: {
            role_id: { in: filters.role_ids }
          }
        };
      }

      if (filters?.created_after) {
        where.created_at = { gte: new Date(filters.created_after) };
      }

      if (filters?.created_before) {
        where.created_at = { ...where.created_at, lte: new Date(filters.created_before) };
      }

      // Construir orderBy
      const orderBy: any = {};
      if (sort?.field) {
        orderBy[sort.field] = sort.direction || 'asc';
      } else {
        orderBy.created_at = 'desc';
      }

      // Ejecutar consulta
      const [permissions, total] = await Promise.all([
        this.prisma.permission.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            role_permission: {
              include: {
                role: true
              }
            },
            _count: {
              select: {
                role_permission: true
              }
            }
          }
        }),
        this.prisma.permission.count({ where })
      ]);

      const formattedPermissions = permissions.map(permission => this.formatPermissionResponse(permission));

      return {
        items: formattedPermissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filters,
        sorting: sort
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const permission = await this.prisma.permission.findFirst({
        where: {
          id,
          deleted_at: null
        },
        include: {
          role_permission: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  is_active: true
                }
              }
            }
          },
          _count: {
            select: {
              role_permission: true
            }
          }
        }
      });

      if (!permission) {
        throw new Error('Permiso no encontrado');
      }

      return this.formatPermissionResponse(permission);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto, userId?: number) {
    try {
      // Verificar si el permiso existe
      const existingPermission = await this.prisma.permission.findFirst({
        where: {
          id,
          deleted_at: null
        }
      });

      if (!existingPermission) {
        throw new Error('Permiso no encontrado');
      }

      // Verificar si el nuevo código ya existe (si se está cambiando)
      if (updatePermissionDto.code && updatePermissionDto.code !== existingPermission.code) {
        const duplicatePermission = await this.prisma.permission.findFirst({
          where: {
            code: updatePermissionDto.code,
            id: { not: id },
            deleted_at: null
          }
        });

        if (duplicatePermission) {
          throw new Error('El código del permiso ya existe');
        }
      }

      // Actualizar el permiso
      const permission = await this.prisma.permission.update({
        where: { id },
        data: {
          code: updatePermissionDto.code,
          description: updatePermissionDto.description,
          is_active: updatePermissionDto.is_active,
          updated_by: userId
        },
        include: {
          role_permission: {
            include: {
              role: true
            }
          }
        }
      });

      return this.formatPermissionResponse(permission);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number, userId?: number, permanent: boolean = false) {
    try {
      const existingPermission = await this.prisma.permission.findFirst({
        where: {
          id,
          deleted_at: null
        },
        include: {
          _count: {
            select: {
              role_permission: true
            }
          }
        }
      });

      if (!existingPermission) {
        throw new Error('Permiso no encontrado');
      }

      if (existingPermission._count.role_permission > 0) {
        throw new Error('No se puede eliminar un permiso que está asignado a roles');
      }

      if (permanent) {
        // Eliminación permanente
        await this.prisma.permission.delete({
          where: { id }
        });
      } else {
        // Soft delete
        await this.prisma.permission.update({
          where: { id },
          data: {
            deleted_at: new Date(),
            updated_by: userId
          }
        });
      }

      return { message: 'Permiso eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async restore(id: number, userId?: number) {
    try {
      const permission = await this.prisma.permission.findFirst({
        where: {
          id,
          deleted_at: { not: null }
        }
      });

      if (!permission) {
        throw new Error('Permiso no encontrado o no está eliminado');
      }

      const restoredPermission = await this.prisma.permission.update({
        where: { id },
        data: {
          deleted_at: null,
          updated_by: userId
        },
        include: {
          role_permission: {
            include: {
              role: true
            }
          }
        }
      });

      return this.formatPermissionResponse(restoredPermission);
    } catch (error) {
      throw error;
    }
  }

  async getRoles(permissionId: number) {
    try {
      const rolePermissions = await this.prisma.role_permission.findMany({
        where: {
          permission_id: permissionId,
          is_active: true
        },
        include: {
          role: true
        }
      });

      return rolePermissions.map(rp => rp.role);
    } catch (error) {
      throw error;
    }
  }

  async bulkCreate(permissions: CreatePermissionDto[], skipDuplicates: boolean = false, userId?: number) {
    try {
      const results = {
        successful: [] as any[],
        failed: [] as any[]
      };

      for (const permissionData of permissions) {
        try {
          const permission = await this.create(permissionData, userId);
          results.successful.push(permission);
        } catch (error: any) {
          if (skipDuplicates && error.message.includes('ya existe')) {
            // Saltar duplicados si se especifica
            continue;
          }
          results.failed.push({
            data: permissionData,
            error: error.message
          });
        }
      }

      return {
        total: permissions.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdate(updates: { id: number; data: UpdatePermissionDto }[], userId?: number) {
    try {
      const results = {
        successful: [] as any[],
        failed: [] as any[]
      };

      for (const update of updates) {
        try {
          const permission = await this.update(update.id, update.data, userId);
          results.successful.push(permission);
        } catch (error: any) {
          results.failed.push({
            id: update.id,
            data: update.data,
            error: error.message
          });
        }
      }

      return {
        total: updates.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkDelete(ids: number[], permanent: boolean = false, userId?: number) {
    try {
      const results = {
        successful: [] as any[],
        failed: [] as any[]
      };

      for (const id of ids) {
        try {
          await this.remove(id, userId, permanent);
          results.successful.push({ id });
        } catch (error: any) {
          results.failed.push({
            id,
            error: error.message
          });
        }
      }

      return {
        total: ids.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results
      };
    } catch (error) {
      throw error;
    }
  }

  async getStats() {
    try {
      const [totalPermissions, activePermissions, permissionsWithRoles, permissionsByCategory] = await Promise.all([
        this.prisma.permission.count({ where: { deleted_at: null } }),
        this.prisma.permission.count({ where: { is_active: true, deleted_at: null } }),
        this.prisma.permission.count({
          where: {
            deleted_at: null,
            role_permission: { some: {} }
          }
        }),
        this.prisma.permission.groupBy({
          by: ['code'],
          where: { deleted_at: null },
          _count: { code: true }
        })
      ]);

      return {
        total: totalPermissions,
        active: activePermissions,
        with_roles: permissionsWithRoles,
        inactive: totalPermissions - activePermissions,
        by_category: permissionsByCategory
      };
    } catch (error) {
      throw error;
    }
  }

  async getAvailablePermissions() {
    try {
      const permissions = await this.prisma.permission.findMany({
        where: {
          is_active: true,
          deleted_at: null
        },
        select: {
          id: true,
          code: true,
          description: true
        },
        orderBy: {
          code: 'asc'
        }
      });

      return permissions;
    } catch (error) {
      throw error;
    }
  }

  private formatPermissionResponse(permission: any) {
    return {
      id: permission.id,
      code: permission.code,
      description: permission.description,
      is_active: permission.is_active,
      roles: permission.role_permission?.map((rp: any) => ({
        id: rp.role.id,
        name: rp.role.name,
        description: rp.role.description,
        is_active: rp.role.is_active
      })) || [],
      roles_count: permission._count?.role_permission || 0,
      created_at: permission.created_at,
      updated_at: permission.updated_at
    };
  }
} 