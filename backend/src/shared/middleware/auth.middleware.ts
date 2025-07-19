import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username?: string;
    email?: string;
    roles?: string[];
    permissions?: string[];
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'AUTH_MIDDLEWARE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    if (!decoded.userId || decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'AUTH_MIDDLEWARE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    // Verificar que la sesión existe y está activa
    const session = await prisma.user_session.findFirst({
      where: {
        token: token,
        is_active: true,
        expires_at: { gt: new Date() }
      },
      include: {
        person: {
          include: {
            person_email: true,
            person_role: {
              include: {
                role: {
                  include: {
                    role_permission: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'AUTH_MIDDLEWARE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    // Actualizar última actividad
    await prisma.user_session.update({
      where: { id: session.id },
      data: { last_activity: new Date() }
    });

    // Agregar información del usuario al request
    req.user = {
      id: session.person.id,
      username: session.person.username || undefined,
      email: session.person.person_email[0]?.email,
      roles: session.person.person_role.map(pr => pr.role?.name).filter(Boolean) as string[],
      permissions: session.person.person_role
        .flatMap(pr => pr.role?.role_permission.map(rp => rp.permission?.code))
        .filter(Boolean) as string[]
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'AUTH_MIDDLEWARE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'AUTH_MIDDLEWARE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación',
      meta: {
        timestamp: new Date().toISOString(),
        operation: 'AUTH_MIDDLEWARE',
        version: '1.0.0',
        requestId: req.requestId
      }
    });
  }
};

export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continuar sin autenticación
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    if (!decoded.userId || decoded.type !== 'access') {
      return next(); // Continuar sin autenticación
    }

    const session = await prisma.user_session.findFirst({
      where: {
        token: token,
        is_active: true,
        expires_at: { gt: new Date() }
      },
      include: {
        person: {
          include: {
            person_email: true,
            person_role: {
              include: {
                role: {
                  include: {
                    role_permission: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (session) {
      await prisma.user_session.update({
        where: { id: session.id },
        data: { last_activity: new Date() }
      });

      req.user = {
        id: session.person.id,
        username: session.person.username || undefined,
        email: session.person.person_email[0]?.email,
        roles: session.person.person_role.map(pr => pr.role?.name).filter(Boolean) as string[],
        permissions: session.person.person_role
          .flatMap(pr => pr.role?.role_permission.map(rp => rp.permission?.code))
          .filter(Boolean) as string[]
      };
    }

    next();
  } catch (error) {
    next(); // Continuar sin autenticación en caso de error
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REQUIRE_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    const hasRole = req.user.roles?.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REQUIRE_ROLE',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    next();
  };
};

export const requirePermission = (permissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REQUIRE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    const hasPermission = req.user.permissions?.some(permission => permissions.includes(permission));
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REQUIRE_PERMISSION',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }

    next();
  };
}; 