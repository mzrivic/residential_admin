import { CreatePersonDto } from '../dto/create-person.dto';
import { bulkOperationResponse, successResponse, errorResponse } from '../../../../shared/utils/response.utils';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import prisma from '../../../../config/database';

export class BulkPersonService {
  
  /**
   * Crear múltiples personas
   */
  async bulkCreate(persons: CreatePersonDto[], userId?: number) {
    const results = {
      successful: [],
      failed: []
    };

    for (const personData of persons) {
      try {
        // Verificar duplicados
        const existingPerson = await prisma.person.findFirst({
          where: {
            document_number: personData.document_number,
            deleted_at: null
          }
        });

        if (existingPerson) {
          results.failed.push({
            data: personData,
            errors: [`Ya existe una persona con el documento ${personData.document_number}`]
          });
          continue;
        }

        // Crear la persona
        const person = await prisma.person.create({
          data: {
            document_type: personData.document_type,
            document_number: personData.document_number,
            full_name: personData.full_name,
            gender: personData.gender,
            photo_url: personData.photo_url,
            birth_date: personData.birth_date ? new Date(personData.birth_date) : null,
            notes: personData.notes,
            alias: personData.alias,
            is_active: personData.is_active ?? true,
            username: personData.username,
            password_hash: personData.password ? await this.hashPassword(personData.password) : null,
            language: personData.language || 'es',
            timezone: personData.timezone || 'America/Bogota',
            status: 'ACTIVE',
            priority: 0,
            tags: [],
            created_by: userId,
            updated_by: userId,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Crear emails si se proporcionan
        if (personData.emails && personData.emails.length > 0) {
          await this.createPersonEmails(person.id, personData.emails);
        }

        // Crear teléfonos si se proporcionan
        if (personData.phones && personData.phones.length > 0) {
          await this.createPersonPhones(person.id, personData.phones);
        }

        // Crear imágenes si se proporcionan
        if (personData.images && personData.images.length > 0) {
          await this.createPersonImages(person.id, personData.images);
        }

        results.successful.push({
          id: person.id,
          data: person
        });

      } catch (error) {
        results.failed.push({
          data: personData,
          errors: [error.message]
        });
      }
    }

    return bulkOperationResponse(
      persons.length,
      results.successful.length,
      results.failed.length,
      results,
      'Operación masiva de creación completada',
      'BULK_CREATE_PERSONS'
    );
  }

  /**
   * Actualizar múltiples personas
   */
  async bulkUpdate(updates: Array<{ id: number; data: Partial<CreatePersonDto> }>, userId?: number) {
    const results = {
      successful: [],
      failed: []
    };

    for (const update of updates) {
      try {
        // Verificar si la persona existe
        const existingPerson = await prisma.person.findFirst({
          where: {
            id: update.id,
            deleted_at: null
          }
        });

        if (!existingPerson) {
          results.failed.push({
            data: update,
            errors: [`Persona con ID ${update.id} no encontrada`]
          });
          continue;
        }

        // Preparar datos para actualización
        const updateData: any = {
          updated_at: new Date(),
          updated_by: userId
        };

        // Agregar campos que se van a actualizar
        if (update.data.full_name) updateData.full_name = update.data.full_name;
        if (update.data.document_type) updateData.document_type = update.data.document_type;
        if (update.data.document_number) updateData.document_number = update.data.document_number;
        if (update.data.gender !== undefined) updateData.gender = update.data.gender;
        if (update.data.photo_url !== undefined) updateData.photo_url = update.data.photo_url;
        if (update.data.birth_date) updateData.birth_date = new Date(update.data.birth_date);
        if (update.data.notes !== undefined) updateData.notes = update.data.notes;
        if (update.data.alias !== undefined) updateData.alias = update.data.alias;
        if (update.data.is_active !== undefined) updateData.is_active = update.data.is_active;
        if (update.data.username !== undefined) updateData.username = update.data.username;
        if (update.data.language) updateData.language = update.data.language;
        if (update.data.timezone) updateData.timezone = update.data.timezone;

        // Actualizar contraseña si se proporciona
        if (update.data.password) {
          updateData.password_hash = await this.hashPassword(update.data.password);
        }

        // Actualizar la persona
        const updatedPerson = await prisma.person.update({
          where: { id: update.id },
          data: updateData
        });

        results.successful.push({
          id: updatedPerson.id,
          data: updatedPerson
        });

      } catch (error) {
        results.failed.push({
          data: update,
          errors: [error.message]
        });
      }
    }

    return bulkOperationResponse(
      updates.length,
      results.successful.length,
      results.failed.length,
      results,
      'Operación masiva de actualización completada',
      'BULK_UPDATE_PERSONS'
    );
  }

  /**
   * Eliminar múltiples personas (soft delete)
   */
  async bulkDelete(ids: number[], userId?: number) {
    const results = {
      successful: [],
      failed: []
    };

    for (const id of ids) {
      try {
        // Verificar si la persona existe
        const existingPerson = await prisma.person.findFirst({
          where: {
            id: parseInt(id.toString()),
            deleted_at: null
          }
        });

        if (!existingPerson) {
          results.failed.push({
            data: { id },
            errors: [`Persona con ID ${id} no encontrada`]
          });
          continue;
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

        results.successful.push({
          id: parseInt(id.toString()),
          data: { id: parseInt(id.toString()) }
        });

      } catch (error) {
        results.failed.push({
          data: { id },
          errors: [error.message]
        });
      }
    }

    return bulkOperationResponse(
      ids.length,
      results.successful.length,
      results.failed.length,
      results,
      'Operación masiva de eliminación completada',
      'BULK_DELETE_PERSONS'
    );
  }

  /**
   * Importar personas desde CSV
   */
  async importFromCSV(filePath: string, userId?: number) {
    const persons: CreatePersonDto[] = [];
    const errors: string[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const person: CreatePersonDto = {
              document_type: row.document_type,
              document_number: row.document_number,
              full_name: row.full_name,
              gender: row.gender,
              photo_url: row.photo_url,
              birth_date: row.birth_date,
              notes: row.notes,
              alias: row.alias,
              is_active: row.is_active === 'true',
              username: row.username,
              password: row.password,
              language: row.language || 'es',
              timezone: row.timezone || 'America/Bogota',
              emails: row.email ? [{ email: row.email }] : [],
              phones: row.phone ? [{ phone: row.phone }] : [],
              images: row.image_url ? [{ image_url: row.image_url }] : []
            };
            persons.push(person);
          } catch (error) {
            errors.push(`Error en fila: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            if (errors.length > 0) {
              resolve(errorResponse(
                'Errores en el archivo CSV',
                errors,
                'IMPORT_CSV'
              ));
              return;
            }

            const result = await this.bulkCreate(persons, userId);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Exportar personas a CSV
   */
  async exportToCSV(filters: any = {}) {
    try {
      // Obtener todas las personas con filtros
      const persons = await prisma.person.findMany({
        where: {
          deleted_at: null,
          ...filters
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
          }
        }
      });

      // Preparar datos para CSV
      const csvData = persons.map(person => ({
        id: person.id,
        document_type: person.document_type,
        document_number: person.document_number,
        full_name: person.full_name,
        gender: person.gender,
        photo_url: person.photo_url,
        birth_date: person.birth_date,
        notes: person.notes,
        alias: person.alias,
        is_active: person.is_active,
        username: person.username,
        language: person.language,
        timezone: person.timezone,
        status: person.status,
        priority: person.priority,
        email_verified: person.email_verified,
        phone_verified: person.phone_verified,
        document_verified: person.document_verified,
        created_at: person.created_at,
        updated_at: person.updated_at,
        primary_email: person.person_email[0]?.email || '',
        primary_phone: person.person_phone[0]?.phone || '',
        primary_image: person.person_image[0]?.image_url || '',
        roles: person.person_role.map(pr => pr.role?.name).join(', '),
        apartments: person.person_role.map(pr => pr.apartment?.code).join(', ')
      }));

      // Configurar CSV writer
      const csvWriter = createObjectCsvWriter({
        path: `export_persons_${Date.now()}.csv`,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'document_type', title: 'Tipo Documento' },
          { id: 'document_number', title: 'Número Documento' },
          { id: 'full_name', title: 'Nombre Completo' },
          { id: 'gender', title: 'Género' },
          { id: 'photo_url', title: 'URL Foto' },
          { id: 'birth_date', title: 'Fecha Nacimiento' },
          { id: 'notes', title: 'Notas' },
          { id: 'alias', title: 'Alias' },
          { id: 'is_active', title: 'Activo' },
          { id: 'username', title: 'Usuario' },
          { id: 'language', title: 'Idioma' },
          { id: 'timezone', title: 'Zona Horaria' },
          { id: 'status', title: 'Estado' },
          { id: 'priority', title: 'Prioridad' },
          { id: 'email_verified', title: 'Email Verificado' },
          { id: 'phone_verified', title: 'Teléfono Verificado' },
          { id: 'document_verified', title: 'Documento Verificado' },
          { id: 'created_at', title: 'Fecha Creación' },
          { id: 'updated_at', title: 'Fecha Actualización' },
          { id: 'primary_email', title: 'Email Principal' },
          { id: 'primary_phone', title: 'Teléfono Principal' },
          { id: 'primary_image', title: 'Imagen Principal' },
          { id: 'roles', title: 'Roles' },
          { id: 'apartments', title: 'Apartamentos' }
        ]
      });

      await csvWriter.writeRecords(csvData);

      return successResponse(
        {
          filePath: `export_persons_${Date.now()}.csv`,
          totalRecords: csvData.length
        },
        'Exportación a CSV completada exitosamente',
        'EXPORT_CSV'
      );

    } catch (error) {
      throw new Error(`Error en exportación: ${error.message}`);
    }
  }

  /**
   * Validar datos masivamente
   */
  async bulkValidate(persons: CreatePersonDto[]) {
    const results = {
      valid: [],
      invalid: []
    };

    for (const person of persons) {
      const errors = [];

      // Validaciones básicas
      if (!person.document_type) errors.push('Tipo de documento es requerido');
      if (!person.document_number) errors.push('Número de documento es requerido');
      if (!person.full_name) errors.push('Nombre completo es requerido');

      // Validar formato de documento
      if (person.document_type && !['CC', 'CE', 'TI', 'PP', 'NIT'].includes(person.document_type)) {
        errors.push('Tipo de documento inválido');
      }

      // Validar email si se proporciona
      if (person.emails && person.emails.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const emailData of person.emails) {
          if (!emailRegex.test(emailData.email)) {
            errors.push(`Email inválido: ${emailData.email}`);
          }
        }
      }

      if (errors.length > 0) {
        results.invalid.push({
          data: person,
          errors
        });
      } else {
        results.valid.push(person);
      }
    }

    return successResponse(
      {
        total: persons.length,
        valid: results.valid.length,
        invalid: results.invalid.length,
        results
      },
      'Validación masiva completada',
      'BULK_VALIDATE'
    );
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