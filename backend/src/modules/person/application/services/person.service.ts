import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePersonDto } from '../dto/create-person.dto';
import { successResponse, errorResponse, paginatedResponse, notFoundError, duplicateError } from '../../../../shared/utils/response.utils';

const prisma = new PrismaClient();

@Injectable()
export class PersonService {
  
  /**
   * Crear una nueva persona
   */
  async create(createPersonDto: CreatePersonDto, userId?: number) {
    try {
      // Verificar si ya existe una persona con el mismo documento
      const existingPerson = await prisma.person.findFirst({
        where: {
          document_number: createPersonDto.document_number,
          deleted_at: null
        }
      });

      if (existingPerson) {
        throw new ConflictException(`Ya existe una persona con el documento ${createPersonDto.document_number}`);
      }

      // Verificar si ya existe una persona con el mismo username (si se proporciona)
      if (createPersonDto.username) {
        const existingUsername = await prisma.person.findFirst({
          where: {
            username: createPersonDto.username,
            deleted_at: null
          }
        });

        if (existingUsername) {
          throw new ConflictException(`Ya existe una persona con el username ${createPersonDto.username}`);
        }
      }

      // Crear la persona
      const person = await prisma.person.create({
        data: {
          document_type: createPersonDto.document_type,
          document_number: createPersonDto.document_number,
          full_name: createPersonDto.full_name,
          gender: createPersonDto.gender,
          photo_url: createPersonDto.photo_url,
          birth_date: createPersonDto.birth_date ? new Date(createPersonDto.birth_date) : null,
          notes: createPersonDto.notes,
          alias: createPersonDto.alias,
          is_active: createPersonDto.is_active ?? true,
          username: createPersonDto.username,
          password_hash: createPersonDto.password ? await this.hashPassword(createPersonDto.password) : null,
          language: createPersonDto.language || 'es',
          timezone: createPersonDto.timezone || 'America/Bogota',
          created_by: userId,
          updated_by: userId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Crear emails si se proporcionan
      if (createPersonDto.emails && createPersonDto.emails.length > 0) {
        await this.createPersonEmails(person.id, createPersonDto.emails);
      }

      // Crear teléfonos si se proporcionan
      if (createPersonDto.phones && createPersonDto.phones.length > 0) {
        await this.createPersonPhones(person.id, createPersonDto.phones);
      }

      // Crear imágenes si se proporcionan
      if (createPersonDto.images && createPersonDto.images.length > 0) {
        await this.createPersonImages(person.id, createPersonDto.images);
      }

      // Obtener la persona con todas sus relaciones
      const personWithRelations = await this.findById(person.id);

      return successResponse(
        personWithRelations,
        'Persona creada exitosamente',
        'CREATE_PERSON'
      );

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new Error(`Error al crear persona: ${error.message}`);
    }
  }

  /**
   * Obtener todas las personas con paginación y filtros
   */
  async findAll(query: any) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        role,
        residential_unit,
        sort = 'created_at',
        order = 'desc'
      } = query;

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        deleted_at: null
      };

      // Filtro de búsqueda
      if (search) {
        where.OR = [
          { full_name: { contains: search, mode: 'insensitive' } },
          { document_number: { contains: search, mode: 'insensitive' } },
          { alias: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Filtro por estado
      if (status) {
        where.is_active = status === 'active';
      }

      // Filtro por rol
      if (role) {
        where.person_role = {
          some: {
            role_id: parseInt(role),
            is_active: true,
            deleted_at: null
          }
        };
      }

      // Filtro por unidad residencial
      if (residential_unit) {
        where.person_role = {
          some: {
            residential_unit_id: parseInt(residential_unit),
            is_active: true,
            deleted_at: null
          }
        };
      }

      // Obtener total de registros
      const total = await prisma.person.count({ where });

      // Obtener personas con relaciones
      const persons = await prisma.person.findMany({
        where,
        include: {
          person_email: true,
          person_phone: true,
          person_image: true,
          person_role: {
            include: {
              role: true,
              apartment: true,
              residential_unit: true
            }
          },
          vehicle: true
        },
        orderBy: { [sort]: order },
        skip,
        take: parseInt(limit)
      });

      return paginatedResponse(
        persons,
        parseInt(page),
        parseInt(limit),
        total,
        'Personas obtenidas exitosamente',
        'LIST_PERSONS',
        { search, status, role, residential_unit },
        { field: sort, direction: order }
      );

    } catch (error) {
      throw new Error(`Error al obtener personas: ${error.message}`);
    }
  }

  /**
   * Obtener una persona por ID
   */
  async findById(id: number) {
    try {
      const person = await prisma.person.findFirst({
        where: {
          id: parseInt(id.toString()),
          deleted_at: null
        },
        include: {
          person_email: true,
          person_phone: true,
          person_image: true,
          person_role: {
            include: {
              role: true,
              apartment: true,
              residential_unit: true
            }
          },
          vehicle: true
        }
      });

      if (!person) {
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }

      return successResponse(
        person,
        'Persona obtenida exitosamente',
        'GET_PERSON'
      );

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Error al obtener persona: ${error.message}`);
    }
  }

  /**
   * Actualizar una persona
   */
  async update(id: number, updatePersonDto: Partial<CreatePersonDto>, userId?: number) {
    try {
      // Verificar si la persona existe
      const existingPerson = await prisma.person.findFirst({
        where: {
          id: parseInt(id.toString()),
          deleted_at: null
        }
      });

      if (!existingPerson) {
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }

      // Verificar duplicados si se está actualizando el documento
      if (updatePersonDto.document_number && updatePersonDto.document_number !== existingPerson.document_number) {
        const duplicateDocument = await prisma.person.findFirst({
          where: {
            document_number: updatePersonDto.document_number,
            deleted_at: null,
            id: { not: parseInt(id.toString()) }
          }
        });

        if (duplicateDocument) {
          throw new ConflictException(`Ya existe una persona con el documento ${updatePersonDto.document_number}`);
        }
      }

      // Verificar duplicados si se está actualizando el username
      if (updatePersonDto.username && updatePersonDto.username !== existingPerson.username) {
        const duplicateUsername = await prisma.person.findFirst({
          where: {
            username: updatePersonDto.username,
            deleted_at: null,
            id: { not: parseInt(id.toString()) }
          }
        });

        if (duplicateUsername) {
          throw new ConflictException(`Ya existe una persona con el username ${updatePersonDto.username}`);
        }
      }

      // Preparar datos para actualización
      const updateData: any = {
        updated_at: new Date(),
        updated_by: userId
      };

      // Agregar campos que se van a actualizar
      if (updatePersonDto.full_name) updateData.full_name = updatePersonDto.full_name;
      if (updatePersonDto.document_type) updateData.document_type = updatePersonDto.document_type;
      if (updatePersonDto.document_number) updateData.document_number = updatePersonDto.document_number;
      if (updatePersonDto.gender !== undefined) updateData.gender = updatePersonDto.gender;
      if (updatePersonDto.photo_url !== undefined) updateData.photo_url = updatePersonDto.photo_url;
      if (updatePersonDto.birth_date) updateData.birth_date = new Date(updatePersonDto.birth_date);
      if (updatePersonDto.notes !== undefined) updateData.notes = updatePersonDto.notes;
      if (updatePersonDto.alias !== undefined) updateData.alias = updatePersonDto.alias;
      if (updatePersonDto.is_active !== undefined) updateData.is_active = updatePersonDto.is_active;
      if (updatePersonDto.username !== undefined) updateData.username = updatePersonDto.username;
      if (updatePersonDto.language) updateData.language = updatePersonDto.language;
      if (updatePersonDto.timezone) updateData.timezone = updatePersonDto.timezone;

      // Actualizar contraseña si se proporciona
      if (updatePersonDto.password) {
        updateData.password_hash = await this.hashPassword(updatePersonDto.password);
      }

      // Actualizar la persona
      const updatedPerson = await prisma.person.update({
        where: { id: parseInt(id.toString()) },
        data: updateData
      });

      // Obtener la persona actualizada con relaciones
      const personWithRelations = await this.findById(id);

      return successResponse(
        personWithRelations,
        'Persona actualizada exitosamente',
        'UPDATE_PERSON'
      );

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new Error(`Error al actualizar persona: ${error.message}`);
    }
  }

  /**
   * Eliminar una persona (soft delete)
   */
  async remove(id: number, userId?: number) {
    try {
      // Verificar si la persona existe
      const existingPerson = await prisma.person.findFirst({
        where: {
          id: parseInt(id.toString()),
          deleted_at: null
        }
      });

      if (!existingPerson) {
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }

      // Soft delete
      await prisma.person.update({
        where: { id: parseInt(id.toString()) },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
          updated_by: userId
        }
      });

      return successResponse(
        { id: parseInt(id.toString()) },
        'Persona eliminada exitosamente',
        'DELETE_PERSON'
      );

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Error al eliminar persona: ${error.message}`);
    }
  }

  /**
   * Restaurar una persona eliminada
   */
  async restore(id: number, userId?: number) {
    try {
      // Verificar si la persona existe y está eliminada
      const existingPerson = await prisma.person.findFirst({
        where: {
          id: parseInt(id.toString()),
          deleted_at: { not: null }
        }
      });

      if (!existingPerson) {
        throw new NotFoundException(`Persona con ID ${id} no encontrada o no está eliminada`);
      }

      // Restaurar
      await prisma.person.update({
        where: { id: parseInt(id.toString()) },
        data: {
          deleted_at: null,
          updated_at: new Date(),
          updated_by: userId
        }
      });

      return successResponse(
        { id: parseInt(id.toString()) },
        'Persona restaurada exitosamente',
        'RESTORE_PERSON'
      );

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Error al restaurar persona: ${error.message}`);
    }
  }

  /**
   * Crear emails para una persona
   */
  private async createPersonEmails(personId: number, emails: any[]) {
    const emailData = emails.map(email => ({
      person_id: personId,
      email: email.email
    }));

    await prisma.person_email.createMany({
      data: emailData,
      skipDuplicates: true
    });
  }

  /**
   * Crear teléfonos para una persona
   */
  private async createPersonPhones(personId: number, phones: any[]) {
    const phoneData = phones.map(phone => ({
      person_id: personId,
      phone: phone.phone
    }));

    await prisma.person_phone.createMany({
      data: phoneData,
      skipDuplicates: true
    });
  }

  /**
   * Crear imágenes para una persona
   */
  private async createPersonImages(personId: number, images: any[]) {
    const imageData = images.map(image => ({
      person_id: personId,
      image_url: image.image_url
    }));

    await prisma.person_image.createMany({
      data: imageData,
      skipDuplicates: true
    });
  }

  /**
   * Hash de contraseña (placeholder - implementar con bcrypt)
   */
  private async hashPassword(password: string): Promise<string> {
    // TODO: Implementar con bcrypt
    return password; // Por ahora retorna la contraseña sin hash
  }
} 