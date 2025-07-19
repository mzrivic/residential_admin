import { Request, Response } from 'express';
import { PersonService } from '../../application/services/person.service';
import { CreatePersonDto } from '../../application/dto/create-person.dto';
import { successResponse, errorResponse } from '../../../../shared/utils/response.utils';

export class PersonController {
  constructor(private readonly personService: PersonService) {}

  /**
   * @route POST /api/v1/persons
   * @desc Crear una nueva persona
   * @access Public (por ahora)
   */
  async create(req: Request, res: Response) {
    try {
      const createPersonDto: CreatePersonDto = req.body;
      const result = await this.personService.create(createPersonDto);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'CREATE_PERSON'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons
   * @desc Obtener todas las personas con paginación y filtros
   * @access Public (por ahora)
   */
  async findAll(req: Request, res: Response) {
    try {
      const query = req.query;
      const result = await this.personService.findAll(query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'LIST_PERSONS'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/:id
   * @desc Obtener una persona por ID
   * @access Public (por ahora)
   */
  async findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.personService.findById(parseInt(id));
      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json(errorResponse(
        error.message,
        [],
        'GET_PERSON'
      ));
    }
  }

  /**
   * @route PUT /api/v1/persons/:id
   * @desc Actualizar una persona completamente
   * @access Public (por ahora)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatePersonDto: CreatePersonDto = req.body;
      const result = await this.personService.update(parseInt(id), updatePersonDto);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'UPDATE_PERSON'
      ));
    }
  }

  /**
   * @route PATCH /api/v1/persons/:id
   * @desc Actualizar una persona parcialmente
   * @access Public (por ahora)
   */
  async updatePartial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatePersonDto: Partial<CreatePersonDto> = req.body;
      const result = await this.personService.update(parseInt(id), updatePersonDto);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'UPDATE_PERSON_PARTIAL'
      ));
    }
  }

  /**
   * @route DELETE /api/v1/persons/:id
   * @desc Eliminar una persona (soft delete)
   * @access Public (por ahora)
   */
  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.personService.remove(parseInt(id));
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'DELETE_PERSON'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/:id/restore
   * @desc Restaurar una persona eliminada
   * @access Public (por ahora)
   */
  async restore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.personService.restore(parseInt(id));
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'RESTORE_PERSON'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/search/autocomplete
   * @desc Búsqueda de autocompletado para personas
   * @access Public (por ahora)
   */
  async autocomplete(req: Request, res: Response) {
    try {
      const { q: query, limit = '10' } = req.query;
      const result = await this.personService.findAll({
        search: query as string,
        limit: parseInt(limit as string),
        page: 1
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'AUTOCOMPLETE_PERSONS'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/stats/overview
   * @desc Obtener estadísticas generales de personas
   * @access Public (por ahora)
   */
  async getStats(req: Request, res: Response) {
    try {
      // TODO: Implementar estadísticas
      const stats = {
        total: 0,
        active: 0,
        inactive: 0,
        createdThisMonth: 0,
        createdThisYear: 0
      };
      
      return res.status(200).json(successResponse(
        stats,
        'Estadísticas obtenidas exitosamente',
        'GET_PERSON_STATS'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'GET_PERSON_STATS'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/validate
   * @desc Validar datos de persona sin crear
   * @access Public (por ahora)
   */
  async validate(req: Request, res: Response) {
    try {
      // TODO: Implementar validación completa
      return res.status(200).json(successResponse(
        { valid: true, message: 'Datos válidos' },
        'Datos validados exitosamente',
        'VALIDATE_PERSON'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'VALIDATE_PERSON'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/duplicates/check
   * @desc Verificar duplicados
   * @access Public (por ahora)
   */
  async checkDuplicates(req: Request, res: Response) {
    try {
      const { document_number } = req.query;
      // TODO: Implementar verificación de duplicados
      const hasDuplicates = false;
      
      return res.status(200).json(successResponse(
        { hasDuplicates, documentNumber: document_number },
        'Verificación de duplicados completada',
        'CHECK_DUPLICATES'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'CHECK_DUPLICATES'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/search/advanced
   * @desc Búsqueda avanzada de personas
   * @access Public (por ahora)
   */
  async advancedSearch(req: Request, res: Response) {
    try {
      const filters = req.query;
      const result = await this.personService.findAll(filters);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(errorResponse(
        error.message,
        [],
        'ADVANCED_SEARCH'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/filters/available
   * @desc Obtener filtros disponibles
   * @access Public (por ahora)
   */
  async getAvailableFilters(req: Request, res: Response) {
    try {
      const filters = {
        status: ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'],
        document_types: ['CC', 'CE', 'TI', 'PP', 'NIT'],
        gender: ['M', 'F', 'O'],
        roles: [
          { id: 1, name: 'Administrador' },
          { id: 2, name: 'Usuario' },
          { id: 3, name: 'Seguridad' }
        ]
      };
      
      return res.status(200).json(successResponse(
        filters,
        'Filtros disponibles obtenidos',
        'GET_AVAILABLE_FILTERS'
      ));
    } catch (error) {
      return res.status(500).json(errorResponse(
        error.message,
        [],
        'GET_AVAILABLE_FILTERS'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/stats/by-role
   * @desc Obtener estadísticas por rol
   * @access Public (por ahora)
   */
  async getStatsByRole(req: Request, res: Response) {
    try {
      const stats = [
        { role: 'Administrador', count: 1 },
        { role: 'Usuario', count: 0 },
        { role: 'Seguridad', count: 0 }
      ];
      
      return res.status(200).json(successResponse(
        stats,
        'Estadísticas por rol obtenidas',
        'GET_STATS_BY_ROLE'
      ));
    } catch (error) {
      return res.status(500).json(errorResponse(
        error.message,
        [],
        'GET_STATS_BY_ROLE'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/stats/by-status
   * @desc Obtener estadísticas por estado
   * @access Public (por ahora)
   */
  async getStatsByStatus(req: Request, res: Response) {
    try {
      const stats = [
        { status: 'ACTIVE', count: 1 },
        { status: 'INACTIVE', count: 0 },
        { status: 'PENDING_VERIFICATION', count: 0 },
        { status: 'SUSPENDED', count: 0 }
      ];
      
      return res.status(200).json(successResponse(
        stats,
        'Estadísticas por estado obtenidas',
        'GET_STATS_BY_STATUS'
      ));
    } catch (error) {
      return res.status(500).json(errorResponse(
        error.message,
        [],
        'GET_STATS_BY_STATUS'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/reports
   * @desc Obtener reportes
   * @access Public (por ahora)
   */
  async getReports(req: Request, res: Response) {
    try {
      const reports = {
        total_persons: 1,
        active_persons: 1,
        inactive_persons: 0,
        persons_with_roles: 1,
        persons_without_roles: 0,
        recent_registrations: 1
      };
      
      return res.status(200).json(successResponse(
        reports,
        'Reportes obtenidos exitosamente',
        'GET_REPORTS'
      ));
    } catch (error) {
      return res.status(404).json(errorResponse(
        error.message,
        [],
        'GET_REPORTS'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/:id/audit
   * @desc Obtener historial de auditoría de una persona
   * @access Public (por ahora)
   */
  async getAuditHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auditLogs = [
        {
          id: 1,
          operation: 'CREATE',
          old_values: null,
          new_values: { full_name: 'Administrador del Sistema' },
          changed_fields: ['full_name', 'username', 'password_hash'],
          created_at: new Date().toISOString()
        }
      ];
      
      return res.status(200).json(successResponse(
        auditLogs,
        'Historial de auditoría obtenido',
        'GET_AUDIT_HISTORY'
      ));
    } catch (error) {
      return res.status(404).json(errorResponse(
        error.message,
        [],
        'GET_AUDIT_HISTORY'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/:id/verify
   * @desc Verificar usuario
   * @access Public (por ahora)
   */
  async verifyUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = {
        verified: true,
        message: 'Usuario verificado exitosamente',
        verification_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Usuario verificado exitosamente',
        'VERIFY_USER'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'VERIFY_USER'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/:id/verify-email
   * @desc Verificar email
   * @access Public (por ahora)
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email } = req.body;
      
      const result = {
        email_verified: true,
        email: email,
        verification_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Email verificado exitosamente',
        'VERIFY_EMAIL'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'VERIFY_EMAIL'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/:id/verify-phone
   * @desc Verificar teléfono
   * @access Public (por ahora)
   */
  async verifyPhone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { phone } = req.body;
      
      const result = {
        phone_verified: true,
        phone: phone,
        verification_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Teléfono verificado exitosamente',
        'VERIFY_PHONE'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'VERIFY_PHONE'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/:id/roles
   * @desc Obtener roles del usuario
   * @access Public (por ahora)
   */
  async getUserRoles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const roles = [
        {
          id: 1,
          name: 'Administrador',
          alias: 'admin',
          assigned_date: new Date().toISOString()
        }
      ];
      
      return res.status(200).json(successResponse(
        roles,
        'Roles del usuario obtenidos',
        'GET_USER_ROLES'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'GET_USER_ROLES'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/:id/roles
   * @desc Asignar rol al usuario
   * @access Public (por ahora)
   */
  async assignRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role_id } = req.body;
      
      const result = {
        person_id: parseInt(id),
        role_id: role_id,
        assigned_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Rol asignado exitosamente',
        'ASSIGN_ROLE'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'ASSIGN_ROLE'
      ));
    }
  }

  /**
   * @route PUT /api/v1/persons/:id/roles/:roleId
   * @desc Actualizar rol del usuario
   * @access Public (por ahora)
   */
  async updateRole(req: Request, res: Response) {
    try {
      const { id, roleId } = req.params;
      const updateData = req.body;
      
      const result = {
        person_id: parseInt(id),
        role_id: parseInt(roleId),
        updated_data: updateData,
        updated_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Rol actualizado exitosamente',
        'UPDATE_ROLE'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'UPDATE_ROLE'
      ));
    }
  }

  /**
   * @route DELETE /api/v1/persons/:id/roles/:roleId
   * @desc Remover rol del usuario
   * @access Public (por ahora)
   */
  async removeRole(req: Request, res: Response) {
    try {
      const { id, roleId } = req.params;
      
      const result = {
        person_id: parseInt(id),
        role_id: parseInt(roleId),
        removed_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Rol removido exitosamente',
        'REMOVE_ROLE'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'REMOVE_ROLE'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/:id/photo
   * @desc Subir foto del usuario
   * @access Public (por ahora)
   */
  async uploadPhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { photo } = req.body;
      
      const result = {
        person_id: parseInt(id),
        photo_url: `/uploads/photos/${id}.jpg`,
        uploaded_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Foto subida exitosamente',
        'UPLOAD_PHOTO'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'UPLOAD_PHOTO'
      ));
    }
  }

  /**
   * @route DELETE /api/v1/persons/:id/photo
   * @desc Eliminar foto del usuario
   * @access Public (por ahora)
   */
  async deletePhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = {
        person_id: parseInt(id),
        deleted_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Foto eliminada exitosamente',
        'DELETE_PHOTO'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'DELETE_PHOTO'
      ));
    }
  }

  /**
   * @route POST /api/v1/persons/:id/documents
   * @desc Subir documentos del usuario
   * @access Public (por ahora)
   */
  async uploadDocuments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { documents } = req.body;
      
      const result = {
        person_id: parseInt(id),
        documents: documents.map((doc: string, index: number) => ({
          id: index + 1,
          name: doc,
          url: `/uploads/documents/${id}_${index + 1}.pdf`
        })),
        uploaded_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Documentos subidos exitosamente',
        'UPLOAD_DOCUMENTS'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'UPLOAD_DOCUMENTS'
      ));
    }
  }

  /**
   * @route GET /api/v1/persons/:id/documents
   * @desc Listar documentos del usuario
   * @access Public (por ahora)
   */
  async listDocuments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const documents = [
        {
          id: 1,
          name: "documento1.pdf",
          url: `/uploads/documents/${id}_1.pdf`,
          uploaded_date: new Date().toISOString()
        },
        {
          id: 2,
          name: "documento2.pdf",
          url: `/uploads/documents/${id}_2.pdf`,
          uploaded_date: new Date().toISOString()
        }
      ];
      
      return res.status(200).json(successResponse(
        documents,
        'Documentos listados exitosamente',
        'LIST_DOCUMENTS'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'LIST_DOCUMENTS'
      ));
    }
  }

  /**
   * @route DELETE /api/v1/persons/:id/documents/:docId
   * @desc Eliminar documento del usuario
   * @access Public (por ahora)
   */
  async deleteDocument(req: Request, res: Response) {
    try {
      const { id, docId } = req.params;
      
      const result = {
        person_id: parseInt(id),
        document_id: parseInt(docId),
        deleted_date: new Date().toISOString()
      };
      
      return res.status(200).json(successResponse(
        result,
        'Documento eliminado exitosamente',
        'DELETE_DOCUMENT'
      ));
    } catch (error) {
      return res.status(400).json(errorResponse(
        error.message,
        [],
        'DELETE_DOCUMENT'
      ));
    }
  }
} 