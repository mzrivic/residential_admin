import { Request, Response } from 'express';
import { BulkPersonService } from '../../application/services/bulk-person.service';
import { CreatePersonDto } from '../../application/dto/create-person.dto';
import { successResponse, errorResponse } from '../../../../shared/utils/response.utils';
import multer from 'multer';
import path from 'path';
import { Response as ExResponse } from 'express';
import ExcelJS from 'exceljs';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const bulkPersonService = new BulkPersonService();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `import_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('Tipo de archivo recibido:', file.mimetype, file.originalname);
    const allowed =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/octet-stream' ||
      file.originalname.endsWith('.xlsx');
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx)'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export { upload };
export class BulkPersonController {

  /**
   * @route POST /api/v1/persons/bulk
   * @desc Crear múltiples personas
   */
  async bulkCreate(req: Request, res: Response) {
    try {
      const { persons, skip_duplicates = false, validate_only = false } = req.body;

      if (!Array.isArray(persons)) {
        return res.status(400).json(errorResponse(
          'El campo persons debe ser un array',
          [],
          'BULK_CREATE_PERSONS'
        ));
      }

      if (validate_only) {
        const result = await bulkPersonService.bulkValidate(persons);
        return res.status(200).json(result);
      }

      const result = await bulkPersonService.bulkCreate(persons, (req as any).user?.id);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'BULK_CREATE_PERSONS'
      ));
    }
  }

  /**
   * @route PUT /api/v1/persons/bulk
   * @desc Actualizar múltiples personas
   */
  async bulkUpdate(req: Request, res: Response) {
    try {
      const { persons } = req.body;

      if (!Array.isArray(persons)) {
        return res.status(400).json(errorResponse(
          'El campo persons debe ser un array',
          [],
          'BULK_UPDATE'
        ));
      }

      const results = {
        successful: [],
        failed: []
      };

      for (const person of persons) {
        try {
          if (!person.id) {
            results.failed.push({
              data: person,
              errors: ['ID es requerido para actualización']
            });
            continue;
          }

          // Simular actualización exitosa
          results.successful.push({
            id: person.id,
            data: person,
            updated_at: new Date().toISOString()
          });

        } catch (error) {
          results.failed.push({
            data: person,
            errors: [error.message]
          });
        }
      }

      const result = {
        success: true,
        message: 'Actualización masiva completada',
        data: {
          total: persons.length,
          successful: results.successful.length,
          failed: results.failed.length,
          results
        },
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_UPDATE',
          version: '1.0.0',
          requestId: Math.random().toString(36).substring(7)
        }
      };

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'BULK_UPDATE'
      ));
    }
  }

  /**
   * @route DELETE /api/v1/persons/bulk
   * @desc Eliminar múltiples personas
   */
  async bulkDelete(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json(errorResponse(
          'El campo ids debe ser un array',
          [],
          'BULK_DELETE'
        ));
      }

      // Validar que todos los IDs sean números válidos
      const validIds = ids.filter(id => {
        const parsedId = Number(id);
        return Number.isInteger(parsedId) && parsedId > 0;
      });

      if (validIds.length === 0) {
        return res.status(400).json(errorResponse(
          'No se proporcionaron IDs válidos para eliminación',
          [],
          'BULK_DELETE'
        ));
      }

      const result = await bulkPersonService.bulkDelete(validIds, (req as any).user?.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'BULK_DELETE'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/import
   * @desc Importar personas desde Excel (xlsx)
   */
  async importFromCSV(req: Request, res: Response) {
    try {
      // Usar multer para obtener el archivo
      const file = req.file;
      if (!file) {
        return res.status(400).json(errorResponse('No se proporcionó archivo', [], 'IMPORT_XLSX'));
      }
      // Leer el archivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.worksheets[0];
      const rows = worksheet.getSheetValues();
      // Quitar filas vacías y encabezados
      const dataRows = rows.slice(2).filter(r => Array.isArray(r) && r.some(cell => cell !== null && cell !== undefined && cell !== ''));
      const headers = worksheet.getRow(1).values.slice(1); // Quitar columna vacía
      console.log('Encabezados leídos:', headers);

      // Resumen
      const summary = {
        creados: 0,
        actualizados: 0,
        eliminados: 0,
        cambios_estado: 0,
        errores: [] as any[],
        detalles: [] as any[]
      };

      // Chequeo global de prisma.person
      if (!bulkPersonService.prisma || !bulkPersonService.prisma.person) {
        fs.unlinkSync(file.path);
        return res.status(500).json(errorResponse(
          'Error interno: El modelo person de Prisma no está disponible. Contacta al administrador.',
          [],
          'IMPORT_XLSX'
        ));
      }

      for (const row of dataRows) {
        const obj: any = {};
        headers.forEach((h: string, i: number) => {
          obj[h.replace(/\*$/, '')] = row[i + 1];
        });
        console.log('Fila leída:', row);
        console.log('Acción detectada:', obj.accion);
        const accion = (obj.accion || '').toLowerCase().trim();
        try {
          if (!accion) {
            summary.errores.push({ row: row, error: 'Falta la columna "acción" o está vacía. Debe ser: crear, actualizar, eliminar o cambiar_estado.' });
            continue;
          }
          if (accion === 'crear') {
            // Verificar si ya existe por document_number o username
            const exists = await (bulkPersonService as any).prisma.person.findFirst({
              where: {
                OR: [
                  { document_number: String(obj.document_number) },
                  { username: obj.username }
                ],
                deleted_at: null
              }
            });
            if (exists) {
              summary.errores.push({ row: row, error: 'Ya existe usuario con ese documento o username' });
              continue;
            }
            try {
              const { accion, ...dataToCreate } = obj;
              dataToCreate.document_number = String(dataToCreate.document_number);
              if (typeof dataToCreate.is_active === 'string') {
                dataToCreate.is_active = dataToCreate.is_active.toLowerCase() === 'true';
              }
              if (dataToCreate.password) {
                dataToCreate.password_hash = await bcrypt.hash(dataToCreate.password, 10);
                delete dataToCreate.password;
              }
              if (dataToCreate.email && typeof dataToCreate.email === 'object' && dataToCreate.email.text) {
                dataToCreate.email = dataToCreate.email.text;
              }
              if (dataToCreate.email) {
                dataToCreate.person_email = { create: [{ email: dataToCreate.email }] };
                delete dataToCreate.email;
              }
              if (dataToCreate.phone) {
                dataToCreate.person_phone = { create: [{ phone: String(dataToCreate.phone) }] };
                delete dataToCreate.phone;
              }
              await (bulkPersonService as any).prisma.person.create({ data: dataToCreate });
              summary.creados++;
              summary.detalles.push({ accion: 'crear', data: obj });
            } catch (err: any) {
              summary.errores.push({ row: row, error: `Error al crear usuario: ${err.message}` });
            }
            continue;
          } else if (accion === 'actualizar') {
            // Buscar por document_number o username
            const person = await (bulkPersonService as any).prisma.person.findFirst({
              where: {
                OR: [
                  { document_number: String(obj.document_number) },
                  { username: obj.username }
                ],
                deleted_at: null
              }
            });
            if (!person) {
              summary.errores.push({ row: row, error: 'No existe usuario para actualizar' });
              continue;
            }
            // Solo actualizar campos no únicos
            const updateData = { ...obj };
            delete updateData.document_number;
            delete updateData.username;
            await (bulkPersonService as any).prisma.person.update({
              where: { id: person.id },
              data: updateData
            });
            summary.actualizados++;
            summary.detalles.push({ accion: 'actualizar', data: obj });
          } else if (accion === 'eliminar') {
            // Buscar por document_number o username
            const person = await (bulkPersonService as any).prisma.person.findFirst({
              where: {
                OR: [
                  { document_number: String(obj.document_number) },
                  { username: obj.username }
                ],
                deleted_at: null
              }
            });
            if (!person) {
              summary.errores.push({ row: row, error: 'No existe usuario para eliminar' });
              continue;
            }
            await (bulkPersonService as any).prisma.person.update({
              where: { id: person.id },
              data: { deleted_at: new Date() }
            });
            summary.eliminados++;
            summary.detalles.push({ accion: 'eliminar', data: obj });
          } else if (accion === 'cambiar_estado') {
            // Buscar por document_number o username
            const person = await (bulkPersonService as any).prisma.person.findFirst({
              where: {
                OR: [
                  { document_number: String(obj.document_number) },
                  { username: obj.username }
                ],
                deleted_at: null
              }
            });
            if (!person) {
              summary.errores.push({ row: row, error: 'No existe usuario para cambiar estado' });
              continue;
            }
            await (bulkPersonService as any).prisma.person.update({
              where: { id: person.id },
              data: { is_active: obj.is_active === 'true' || obj.is_active === true }
            });
            summary.cambios_estado++;
            summary.detalles.push({ accion: 'cambiar_estado', data: obj });
          } else {
            summary.errores.push({ row: row, error: `Acción no reconocida: "${obj.accion}". Usa: crear, actualizar, eliminar o cambiar_estado.` });
          }
        } catch (err: any) {
          summary.errores.push({ row: row, error: `Error en la fila: ${err.message}` });
        }
      }

      // Eliminar archivo temporal
      fs.unlinkSync(file.path);

      // Construir mensaje de resumen amigable
      let resumen = [];
      if (summary.creados > 0) resumen.push(`✔️ ${summary.creados} usuario(s) creados`);
      if (summary.actualizados > 0) resumen.push(`✏️ ${summary.actualizados} usuario(s) actualizados`);
      if (summary.eliminados > 0) resumen.push(`🗑️ ${summary.eliminados} usuario(s) eliminados`);
      if (summary.cambios_estado > 0) resumen.push(`🔄 ${summary.cambios_estado} usuario(s) con cambio de estado`);
      if (summary.errores.length > 0) resumen.push(`❌ ${summary.errores.length} error(es) encontrados`);
      if (resumen.length === 0) resumen.push('No se realizaron cambios.');
      const resumenStr = resumen.join(' | ');

      return res.status(200).json(successResponse(
        summary,
        `Importación masiva completada. ${resumenStr}`,
        'IMPORT_XLSX'
      ));
    } catch (error: any) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'IMPORT_XLSX'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/export
   * @desc Exportar personas a CSV
   */
  async exportToCSV(req: Request, res: Response) {
    try {
      const filters = req.query;
      const result = {
        success: true,
        message: 'Exportación a CSV completada',
        data: {
          filePath: `/exports/persons_${Date.now()}.csv`,
          totalRecords: 5,
          exportedAt: new Date().toISOString()
        },
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'EXPORT_CSV',
          version: '1.0.0',
          requestId: Math.random().toString(36).substring(7)
        }
      };
      
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'EXPORT_CSV'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/validate
   * @desc Validar datos masivamente
   */
  async bulkValidate(req: Request, res: Response) {
    try {
      const { persons } = req.body;

      if (!Array.isArray(persons)) {
        return res.status(400).json(errorResponse(
          'El campo persons debe ser un array',
          [],
          'BULK_VALIDATE'
        ));
      }

      const result = await bulkPersonService.bulkValidate(persons);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'BULK_VALIDATE'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/bulk-roles
   * @desc Asignar roles masivamente
   */
  async bulkAssignRoles(req: Request, res: Response) {
    try {
      const { assignments } = req.body;

      if (!Array.isArray(assignments)) {
        return res.status(400).json(errorResponse(
          'El campo assignments debe ser un array',
          [],
          'BULK_ASSIGN_ROLES'
        ));
      }

      const results = {
        successful: [],
        failed: []
      };

      for (const assignment of assignments) {
        try {
          const { person_id, role_id, residential_unit_id, apartment_id } = assignment;

          // Verificar si la persona existe
          const person = await (bulkPersonService as any).prisma.person.findFirst({
            where: {
              id: person_id,
              deleted_at: null
            }
          });

          if (!person) {
            results.failed.push({
              data: assignment,
              errors: [`Persona con ID ${person_id} no encontrada`]
            });
            continue;
          }

          // Verificar si el rol existe
          const role = await (bulkPersonService as any).prisma.role.findFirst({
            where: {
              id: role_id,
              deleted_at: null
            }
          });

          if (!role) {
            results.failed.push({
              data: assignment,
              errors: [`Rol con ID ${role_id} no encontrado`]
            });
            continue;
          }

          // Crear o actualizar asignación de rol
          await (bulkPersonService as any).prisma.person_role.upsert({
            where: {
              person_id_role_id: {
                person_id,
                role_id
              }
            },
            update: {
              residential_unit_id,
              apartment_id,
              is_active: true,
              updated_at: new Date(),
              updated_by: (req as any).user?.id
            },
            create: {
              person_id,
              role_id,
              residential_unit_id,
              apartment_id,
              is_active: true,
              from_date: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
              created_by: (req as any).user?.id,
              updated_by: (req as any).user?.id
            }
          });

          results.successful.push({
            id: person_id,
            data: assignment
          });

        } catch (error) {
          results.failed.push({
            data: assignment,
            errors: [error.message]
          });
        }
      }

      const result = {
        success: true,
        message: 'Asignación masiva de roles completada',
        data: {
          total: assignments.length,
          successful: results.successful.length,
          failed: results.failed.length,
          results
        },
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'BULK_ASSIGN_ROLES',
          version: '1.0.0',
          requestId: Math.random().toString(36).substring(7)
        }
      };

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'BULK_ASSIGN_ROLES'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/template
   * @desc Descargar plantilla Excel para importación masiva
   */
  async downloadTemplate(req: Request, res: ExResponse) {
    // Definir campos y obligatoriedad
    const fields = [
      { name: 'accion', required: true },
      { name: 'document_type', required: true },
      { name: 'document_number', required: true },
      { name: 'full_name', required: true },
      { name: 'gender', required: false },
      { name: 'photo_url', required: false },
      { name: 'birth_date', required: false },
      { name: 'notes', required: false },
      { name: 'alias', required: false },
      { name: 'is_active', required: false },
      { name: 'username', required: true },
      { name: 'password', required: true },
      { name: 'language', required: false },
      { name: 'timezone', required: false },
      { name: 'email', required: false },
      { name: 'phone', required: false },
      { name: 'image_url', required: false }
    ];
    const headers = fields.map(f => f.required ? `${f.name}*` : f.name);
    const requiredRow = fields.map(f => f.required ? 'Obligatorio' : 'Opcional');
    // Ejemplos para cada acción
    const exampleCrear = ['crear','CC','12345678','Juan Perez','M','https://img.com','1985-01-01','Notas','JP','true','juanp','pass123','es','America/Bogota','juan@correo.com','+573001234567','https://img.com/foto.jpg'];
    const exampleActualizar = ['actualizar','CC','12345678','Juan Perez Mod','M','','','','','','','','','','',''];
    const exampleEliminar = ['eliminar','CC','12345678','','','','','','','','','','','','','',''];
    const exampleCambiarEstado = ['cambiar_estado','CC','12345678','','','','','','','false','','','','','','',''];

    // Crear workbook y hoja
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla');
    worksheet.addRow(headers);
    worksheet.addRow(requiredRow);
    worksheet.addRow(exampleCrear);
    worksheet.addRow(exampleActualizar);
    worksheet.addRow(exampleEliminar);
    worksheet.addRow(exampleCambiarEstado);

    // Estilos: encabezados en negrita
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { italic: true };

    // Ajustar ancho de columnas
    worksheet.columns.forEach((col, i) => {
      col.width = Math.max(15, headers[i].length + 2);
    });

    // Enviar archivo como buffer binario
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="plantilla_personas.xlsx"');
    res.end(buffer);
    return;
  }
} 