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
} 