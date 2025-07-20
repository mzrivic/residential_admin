import { Request, Response } from 'express';
import { AuthService, AccountLockedError, UserNotFoundError, InvalidPasswordError, NoPasswordConfiguredError } from '../../application/services/auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto, LogoutDto } from '../../application/dto/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response) {
    try {
      const loginData: LoginDto = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await this.authService.login(loginData, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'LOGIN',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      // Determinar el código de estado HTTP según el tipo de error
      let statusCode = 401;
      
      if (error instanceof AccountLockedError) {
        statusCode = 423; // Locked
      } else if (error instanceof UserNotFoundError) {
        statusCode = 404; // Not Found
      } else if (error instanceof InvalidPasswordError) {
        statusCode = 401; // Unauthorized
      } else if (error instanceof NoPasswordConfiguredError) {
        statusCode = 400; // Bad Request
      }
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error en el login',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'LOGIN',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const registerData: RegisterDto = req.body;

      const result = await this.authService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REGISTER',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error en el registro',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REGISTER',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshTokenData: RefreshTokenDto = req.body;

      const result = await this.authService.refreshToken(refreshTokenData);

      res.status(200).json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REFRESH_TOKEN',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Error al refrescar token',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'REFRESH_TOKEN',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const logoutData: LogoutDto = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          meta: {
            timestamp: new Date().toISOString(),
            operation: 'LOGOUT',
            version: '1.0.0',
            requestId: req.requestId
          }
        });
      }

      const result = await this.authService.logout(
        userId,
        logoutData.refresh_token,
        logoutData.all_sessions
      );

      res.status(200).json({
        success: true,
        message: 'Logout exitoso',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'LOGOUT',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error en el logout',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'LOGOUT',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const changePasswordData: ChangePasswordDto = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          meta: {
            timestamp: new Date().toISOString(),
            operation: 'CHANGE_PASSWORD',
            version: '1.0.0',
            requestId: req.requestId
          }
        });
      }

      const result = await this.authService.changePassword(userId, changePasswordData);

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CHANGE_PASSWORD',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cambiar contraseña',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'CHANGE_PASSWORD',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          meta: {
            timestamp: new Date().toISOString(),
            operation: 'GET_ME',
            version: '1.0.0',
            requestId: req.requestId
          }
        });
      }

      const result = await this.authService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        message: 'Información del usuario obtenida exitosamente',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ME',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Error al obtener información del usuario',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'GET_ME',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Implementar lógica de recuperación de contraseña
      // Por ahora solo retornamos un mensaje de éxito
      res.status(200).json({
        success: true,
        message: 'Si el email existe, se enviará un enlace de recuperación',
        data: { email },
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'FORGOT_PASSWORD',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error en la recuperación de contraseña',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'FORGOT_PASSWORD',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, new_password, confirm_new_password } = req.body;

      if (new_password !== confirm_new_password) {
        return res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden',
          meta: {
            timestamp: new Date().toISOString(),
            operation: 'RESET_PASSWORD',
            version: '1.0.0',
            requestId: req.requestId
          }
        });
      }

      // Implementar lógica de reset de contraseña
      // Por ahora solo retornamos un mensaje de éxito
      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'RESET_PASSWORD',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al restablecer contraseña',
        meta: {
          timestamp: new Date().toISOString(),
          operation: 'RESET_PASSWORD',
          version: '1.0.0',
          requestId: req.requestId
        }
      });
    }
  }
} 