import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from '../dto/auth.dto';
import prisma from '../../../../config/database';

export class AuthService {

  async login(loginData: LoginDto, ipAddress?: string, userAgent?: string) {
    try {
      // Buscar usuario por username o email
      const user = await prisma.person.findFirst({
        where: {
          OR: [
            { username: loginData.username },
            { person_email: { some: { email: loginData.username } } }
          ],
          is_active: true,
          deleted_at: null
        },
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
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si la cuenta está bloqueada
      if (user.locked_until && user.locked_until > new Date()) {
        throw new Error('Cuenta temporalmente bloqueada');
      }

      // Verificar contraseña
      if (!user.password_hash) {
        throw new Error('Contraseña no configurada');
      }

      const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash);
      if (!isValidPassword) {
        // Incrementar intentos de login
        await prisma.person.update({
          where: { id: user.id },
          data: {
            login_attempts: user.login_attempts + 1,
            locked_until: user.login_attempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null // Bloquear por 15 minutos
          }
        });

        throw new Error('Contraseña incorrecta');
      }

      // Resetear intentos de login
      await prisma.person.update({
        where: { id: user.id },
        data: {
          login_attempts: 0,
          locked_until: null,
          last_login: new Date()
        }
      });

      // Generar tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken();

      // Crear sesión
      const session = await prisma.user_session.create({
        data: {
          person_id: user.id,
          token: accessToken,
          refresh_token: refreshToken,
          device_info: { userAgent, ipAddress },
          ip_address: ipAddress,
          user_agent: userAgent,
          expires_at: new Date(Date.now() + (loginData.remember_me ? 30 : 7) * 24 * 60 * 60 * 1000) // 30 días o 7 días
        }
      });

      // Preparar respuesta
      const userResponse = {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.person_email[0]?.email,
        status: user.status,
        roles: user.person_role.map(pr => ({
          id: pr.role?.id,
          name: pr.role?.name,
          permissions: pr.role?.role_permission.map(rp => rp.permission?.code)
        }))
      };

      return {
        user: userResponse,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600, // 1 hora
        token_type: 'Bearer'
      };
    } catch (error) {
      throw error;
    }
  }

  async register(registerData: RegisterDto) {
    try {
      // Verificar si el username ya existe
      const existingUsername = await this.prisma.person.findUnique({
        where: { username: registerData.username }
      });

      if (existingUsername) {
        throw new Error('El nombre de usuario ya está en uso');
      }

      // Verificar si el email ya existe
      const existingEmail = await this.prisma.person_email.findFirst({
        where: { email: registerData.email }
      });

      if (existingEmail) {
        throw new Error('El email ya está registrado');
      }

      // Verificar si el documento ya existe
      const existingDocument = await this.prisma.person.findUnique({
        where: { document_number: registerData.document_number }
      });

      if (existingDocument) {
        throw new Error('El número de documento ya está registrado');
      }

      // Verificar que las contraseñas coincidan
      if (registerData.password !== registerData.confirm_password) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(registerData.password, 12);

      // Crear usuario
      const user = await this.prisma.person.create({
        data: {
          full_name: registerData.full_name,
          username: registerData.username,
          password_hash: passwordHash,
          document_type: registerData.document_type,
          document_number: registerData.document_number,
          status: 'PENDING_VERIFICATION',
          person_email: {
            create: {
              email: registerData.email
            }
          }
        },
        include: {
          person_email: true
        }
      });

      return {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.person_email[0]?.email,
        status: user.status,
        message: 'Usuario registrado exitosamente. Por favor verifica tu email.'
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshTokenData: RefreshTokenDto) {
    try {
      // Buscar sesión por refresh token
      const session = await this.prisma.user_session.findUnique({
        where: { refresh_token: refreshTokenData.refresh_token },
        include: {
          person: true
        }
      });

      if (!session || !session.is_active || session.expires_at < new Date()) {
        throw new Error('Token de refresco inválido o expirado');
      }

      // Generar nuevos tokens
      const newAccessToken = this.generateAccessToken(session.person_id);
      const newRefreshToken = this.generateRefreshToken();

      // Actualizar sesión
      await this.prisma.user_session.update({
        where: { id: session.id },
        data: {
          token: newAccessToken,
          refresh_token: newRefreshToken,
          last_activity: new Date()
        }
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 3600,
        token_type: 'Bearer'
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: number, refreshToken?: string, allSessions: boolean = false) {
    try {
      if (allSessions) {
        // Cerrar todas las sesiones del usuario
        await this.prisma.user_session.updateMany({
          where: { person_id: userId },
          data: { is_active: false }
        });
      } else if (refreshToken) {
        // Cerrar sesión específica
        await this.prisma.user_session.updateMany({
          where: {
            person_id: userId,
            refresh_token: refreshToken
          },
          data: { is_active: false }
        });
      }

      return { message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId: number, changePasswordData: ChangePasswordDto) {
    try {
      // Obtener usuario
      const user = await prisma.person.findUnique({
        where: { id: userId }
      });

      if (!user || !user.password_hash) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValidCurrentPassword = await bcrypt.compare(changePasswordData.current_password, user.password_hash);
      if (!isValidCurrentPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Verificar que las nuevas contraseñas coincidan
      if (changePasswordData.new_password !== changePasswordData.confirm_new_password) {
        throw new Error('Las nuevas contraseñas no coinciden');
      }

      // Hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(changePasswordData.new_password, 12);

      // Actualizar contraseña
      await prisma.person.update({
        where: { id: userId },
        data: { password_hash: newPasswordHash }
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(userId: number) {
    try {
      const user = await prisma.person.findUnique({
        where: { id: userId },
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
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.person_email[0]?.email,
        status: user.status,
        roles: user.person_role.map(pr => ({
          id: pr.role?.id,
          name: pr.role?.name,
          permissions: pr.role?.role_permission.map(rp => rp.permission?.code)
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      
      // Verificar que la sesión existe y está activa
      const session = await this.prisma.user_session.findFirst({
        where: {
          token: token,
          is_active: true,
          expires_at: { gt: new Date() }
        },
        include: {
          person: {
            include: {
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
        throw new Error('Sesión inválida o expirada');
      }

      return {
        userId: session.person_id,
        user: session.person,
        sessionId: session.id
      };
    } catch (error) {
      throw error;
    }
  }

  private generateAccessToken(userId: number): string {
    return jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
} 