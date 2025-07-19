import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const validationMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convertir el body a la clase DTO
      const dtoObject = plainToClass(dtoClass, req.body);
      
      // Validar el objeto
      const errors = await validate(dtoObject, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true
      });

      if (errors.length > 0) {
        const validationErrors = errors.map((error: ValidationError) => {
          const constraints = error.constraints;
          return {
            field: error.property,
            value: error.value,
            constraints: constraints ? Object.values(constraints) : []
          };
        });

        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: validationErrors,
          meta: {
            timestamp: new Date().toISOString(),
            operation: 'VALIDATION',
            version: '1.0.0',
            requestId: req.requestId
          }
        });
      }

      // Sanitizar y asignar el objeto validado al request
      req.body = dtoObject;
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'Error en la validación',
        error: error.message,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'VALIDATION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  };
};

export const queryValidationMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convertir query params a la clase DTO
      const dtoObject = plainToClass(dtoClass, req.query);
      
      // Validar el objeto
      const errors = await validate(dtoObject, {
        whitelist: true,
        forbidNonWhitelisted: false,
        forbidUnknownValues: false
      });

      if (errors.length > 0) {
        const validationErrors = errors.map((error: ValidationError) => {
          const constraints = error.constraints;
          return {
            field: error.property,
            value: error.value,
            constraints: constraints ? Object.values(constraints) : []
          };
        });

        return res.status(400).json({
          success: false,
          message: 'Errores de validación en query params',
          errors: validationErrors,
          meta: {
            timestamp: new Date().toISOString(),
            operation: 'QUERY_VALIDATION',
            version: '1.0.0',
            requestId: req.requestId
          }
        });
      }

      // Asignar el objeto validado al request
      req.query = dtoObject as any;
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'Error en la validación de query params',
        error: error.message,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'QUERY_VALIDATION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  };
};

export const paramsValidationMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convertir params a la clase DTO
      const dtoObject = plainToClass(dtoClass, req.params);
      
      // Validar el objeto
      const errors = await validate(dtoObject, {
        whitelist: true,
        forbidNonWhitelisted: false,
        forbidUnknownValues: false
      });

      if (errors.length > 0) {
        const validationErrors = errors.map((error: ValidationError) => {
          const constraints = error.constraints;
          return {
            field: error.property,
            value: error.value,
            constraints: constraints ? Object.values(constraints) : []
          };
        });

        return res.status(400).json({
          success: false,
          message: 'Errores de validación en parámetros',
          errors: validationErrors,
          meta: {
            timestamp: new Date().toISOString(),
            operation: 'PARAMS_VALIDATION',
            version: '1.0.0',
            requestId: req.requestId
          }
        });
      }

      // Asignar el objeto validado al request
      req.params = dtoObject as any;
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'Error en la validación de parámetros',
        error: error.message,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'PARAMS_VALIDATION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  };
};

export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitizar body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitizar params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Error en la sanitización',
      error: error.message,
      meta: {
        timestamp: new Date().toISOString(),
        operation: 'SANITIZE',
        version: '1.0.0',
        requestId: req.requestId
      }
    });
  }
};

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remover caracteres peligrosos y trim
      sanitized[key] = value.trim().replace(/[<>]/g, '');
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
} 