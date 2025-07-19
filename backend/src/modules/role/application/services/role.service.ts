import { PrismaClient } from '../../../../../generated/prisma';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RoleFiltersDto, RoleSortDto, RolePaginationDto } from '../dto/role.dto';

export class RoleService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(createRoleDto: CreateRoleDto, userId?: number) {
    try {
      // Verificar si el rol ya existe
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: createRoleDto.name,
          deleted_at: null
        }
      });

      if (existingRole) {
        throw new Error('El rol ya existe');
      }

      // Crear el rol
      const role = await this.prisma.role.create({
        data: {
          name: createRoleDto.name,
          description: createRoleDto.description,
          alias: createRoleDto.alias,
          is_active: createRoleDto.is_active ?? true,
          created_by: userId
        },
        include: {
          role_permission: {
            include: {
              permission: true
            }
          }
        }
      });

      // Asignar permisos si se proporcionan
      if (createRoleDto.permission_ids && createRoleDto.permission_ids.length > 0) {
        await this.assignPermissions(role.id, createRoleDto.permission_ids, userId);
      }

      return this.formatRoleResponse(role);
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters?: RoleFiltersDto, sort?: RoleSortDto, pagination?: RolePaginationDto) {
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
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { alias: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters?.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      if (filters?.permission_ids && filters.permission_ids.length > 0) {
        where.role_permission = {
          some: {
            permission_id: { in: filters.permission_ids }
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
      const [roles, total] = await Promise.all([
        this.prisma.role.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            role_permission: {
              include: {
                permission: true
              }
            },
            _count: {
              select: {
                person_role: true
              }
            }
          }
        }),
        this.prisma.role.count({ where })
      ]);

      const formattedRoles = roles.map(role => this.formatRoleResponse(role));

      return {
        items: formattedRoles,
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
      const role = await this.prisma.role.findFirst({
        where: {
          id,
          deleted_at: null
        },
        include: {
          role_permission: {
            include: {
              permission: true
            }
          },
          person_role: {
            include: {
              person: {
                select: {
                  id: true,
                  full_name: true,
                  username: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: {
              person_role: true
            }
          }
        }
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      return this.formatRoleResponse(role);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, userId?: number) {
    try {
      // Verificar si el rol existe
      const existingRole = await this.prisma.role.findFirst({
        where: {
          id,
          deleted_at: null
        }
      });

      if (!existingRole) {
        throw new Error('Rol no encontrado');
      }

      // Verificar si el nuevo nombre ya existe (si se está cambiando)
      if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
        const duplicateRole = await this.prisma.role.findFirst({
          where: {
            name: updateRoleDto.name,
            id: { not: id },
            deleted_at: null
          }
        });

        if (duplicateRole) {
          throw new Error('El nombre del rol ya existe');
        }
      }

      // Actualizar el rol
      const role = await this.prisma.role.update({
        where: { id },
        data: {
          name: updateRoleDto.name,
          description: updateRoleDto.description,
          alias: updateRoleDto.alias,
          is_active: updateRoleDto.is_active,
          updated_by: userId
        },
        include: {
          role_permission: {
            include: {
              permission: true
            }
          }
        }
      });

      // Actualizar permisos si se proporcionan
      if (updateRoleDto.permission_ids !== undefined) {
        await this.updatePermissions(id, updateRoleDto.permission_ids, userId);
      }

      return this.formatRoleResponse(role);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number, userId?: number, permanent: boolean = false) {
    try {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          id,
          deleted_at: null
        },
        include: {
          _count: {
            select: {
              person_role: true
            }
          }
        }
      });

      if (!existingRole) {
        throw new Error('Rol no encontrado');
      }

      if (existingRole._count.person_role > 0) {
        throw new Error('No se puede eliminar un rol que tiene personas asignadas');
      }

      if (permanent) {
        // Eliminación permanente
        await this.prisma.role.delete({
          where: { id }
        });
      } else {
        // Soft delete
        await this.prisma.role.update({
          where: { id },
          data: {
            deleted_at: new Date(),
            updated_by: userId
          }
        });
      }

      return { message: 'Rol eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async restore(id: number, userId?: number) {
    try {
      const role = await this.prisma.role.findFirst({
        where: {
          id,
          deleted_at: { not: null }
        }
      });

      if (!role) {
        throw new Error('Rol no encontrado o no está eliminado');
      }

      const restoredRole = await this.prisma.role.update({
        where: { id },
        data: {
          deleted_at: null,
          updated_by: userId
        },
        include: {
          role_permission: {
            include: {
              permission: true
            }
          }
        }
      });

      return this.formatRoleResponse(restoredRole);
    } catch (error) {
      throw error;
    }
  }

  async assignPermissions(roleId: number, permissionIds: number[], userId?: number) {
    try {
      // Verificar que el rol existe
      const role = await this.prisma.role.findFirst({
        where: {
          id: roleId,
          deleted_at: null
        }
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      // Verificar que los permisos existen
      const permissions = await this.prisma.permission.findMany({
        where: {
          id: { in: permissionIds },
          is_active: true,
          deleted_at: null
        }
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error('Algunos permisos no existen o no están activos');
      }

      // Eliminar permisos existentes
      await this.prisma.role_permission.deleteMany({
        where: { role_id: roleId }
      });

      // Asignar nuevos permisos
      const rolePermissions = await this.prisma.role_permission.createMany({
        data: permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
          created_by: userId
        }))
      });

      return { message: 'Permisos asignados exitosamente', count: rolePermissions.count };
    } catch (error) {
      throw error;
    }
  }

  async updatePermissions(roleId: number, permissionIds: number[], userId?: number) {
    return this.assignPermissions(roleId, permissionIds, userId);
  }

  async getPermissions(roleId: number) {
    try {
      const rolePermissions = await this.prisma.role_permission.findMany({
        where: {
          role_id: roleId,
          is_active: true
        },
        include: {
          permission: true
        }
      });

      return rolePermissions.map(rp => rp.permission);
    } catch (error) {
      throw error;
    }
  }

  async bulkCreate(roles: CreateRoleDto[], skipDuplicates: boolean = false, userId?: number) {
    try {
      const results = {
        successful: [] as any[],
        failed: [] as any[]
      };

      for (const roleData of roles) {
        try {
          const role = await this.create(roleData, userId);
          results.successful.push(role);
        } catch (error: any) {
          if (skipDuplicates && error.message.includes('ya existe')) {
            // Saltar duplicados si se especifica
            continue;
          }
          results.failed.push({
            data: roleData,
            error: error.message
          });
        }
      }

      return {
        total: roles.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdate(updates: { id: number; data: UpdateRoleDto }[], userId?: number) {
    try {
      const results = {
        successful: [] as any[],
        failed: [] as any[]
      };

      for (const update of updates) {
        try {
          const role = await this.update(update.id, update.data, userId);
          results.successful.push(role);
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
      const [totalRoles, activeRoles, rolesWithPermissions, rolesWithUsers] = await Promise.all([
        this.prisma.role.count({ where: { deleted_at: null } }),
        this.prisma.role.count({ where: { is_active: true, deleted_at: null } }),
        this.prisma.role.count({
          where: {
            deleted_at: null,
            role_permission: { some: {} }
          }
        }),
        this.prisma.role.count({
          where: {
            deleted_at: null,
            person_role: { some: {} }
          }
        })
      ]);

      return {
        total: totalRoles,
        active: activeRoles,
        with_permissions: rolesWithPermissions,
        with_users: rolesWithUsers,
        inactive: totalRoles - activeRoles
      };
    } catch (error) {
      throw error;
    }
  }

  private formatRoleResponse(role: any) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      alias: role.alias,
      is_active: role.is_active,
      permissions: role.role_permission?.map((rp: any) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        description: rp.permission.description
      })) || [],
      users_count: role._count?.person_role || 0,
      created_at: role.created_at,
      updated_at: role.updated_at
    };
  }
} 