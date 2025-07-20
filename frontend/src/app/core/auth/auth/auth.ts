import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

const API_URL = 'http://localhost:3000/api/v1/auth';

/**
 * Interfaz para la respuesta de login del backend
 */
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
  errors?: Array<{
    field: string;
    message: string;
    code: string;
    value: any;
  }>;
  meta?: {
    timestamp: string;
    operation: string;
    version: string;
    requestId: string;
  };
}

/**
 * Interfaz para la respuesta de refresh token
 */
interface RefreshResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

/**
 * Servicio de autenticación con gestión completa de tokens y sesiones
 */
@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Realiza el login del usuario
   * @param username - Nombre de usuario
   * @param password - Contraseña del usuario
   * @returns Promise<void>
   */
  async login(username: string, password: string): Promise<void> {
    try {
      const response = await this.http.post<LoginResponse>(
        `${API_URL}/login`, 
        { username, password }
      ).toPromise();
      
      if (response && response.success && response.data) {
        this.saveAuthData(response.data);
        console.log('Login exitoso:', response.message);
      } else {
        throw new Error(response?.message || 'Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      this.handleAuthError(error);
    }
  }

  /**
   * Refresca el token de acceso usando el refresh token
   * @returns Promise<boolean> - true si el refresh fue exitoso
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await this.http.post<RefreshResponse>(
        `${API_URL}/refresh-token`,
        { refresh_token: refreshToken }
      ).toPromise();

      if (response && response.success && response.data) {
        this.saveAuthData(response.data);
        console.log('Token refrescado exitosamente');
        return true;
      } else {
        throw new Error(response?.message || 'Error al refrescar token');
      }
    } catch (error: any) {
      console.error('Error al refrescar token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        // Intentar hacer logout en el backend
        await this.http.post(`${API_URL}/logout`, {
          refresh_token: refreshToken,
          all_sessions: false
        }).toPromise();
      }
    } catch (error) {
      console.error('Error en logout del backend:', error);
    } finally {
      this.clearAuthData();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns boolean
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    const expires = localStorage.getItem('token_expires');
    
    if (!token || !expires) {
      return false;
    }
    
    const expirationDate = new Date(expires);
    const now = new Date();
    
    // Si el token expira en menos de 5 minutos, intentar refrescar
    if (expirationDate.getTime() - now.getTime() < 5 * 60 * 1000) {
      this.refreshToken();
    }
    
    return expirationDate > now;
  }

  /**
   * Obtiene el token de acceso actual
   * @returns string | null
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene el refresh token
   * @returns string | null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Obtiene los datos del usuario actual
   * @returns any | null
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Verifica si el token está próximo a expirar
   * @returns boolean
   */
  isTokenExpiringSoon(): boolean {
    const expires = localStorage.getItem('token_expires');
    if (!expires) return true;
    
    const expirationDate = new Date(expires);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos en milisegundos
    
    return expirationDate.getTime() - now.getTime() < fiveMinutes;
  }

  /**
   * Guarda los datos de autenticación en localStorage
   * @param data - Datos de autenticación del backend
   */
  private saveAuthData(data: any): void {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token_expires', new Date(Date.now() + data.expires_in * 1000).toISOString());
    localStorage.setItem('token_type', data.token_type);
  }

  /**
   * Limpia todos los datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires');
    localStorage.removeItem('token_type');
    localStorage.removeItem('rememberMe');
  }

  /**
   * Maneja errores de autenticación según el tipo de error
   * @param error - Error capturado
   */
  private handleAuthError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 401:
          throw new Error('Usuario o contraseña incorrectos');
        case 400:
          throw new Error('Datos de entrada inválidos');
        case 404:
          throw new Error('Servicio de autenticación no disponible');
        case 500:
          throw new Error('Error interno del servidor');
        default:
          throw new Error('Error de conexión con el servidor');
      }
    } else {
      throw new Error(error?.message || 'Error inesperado de autenticación');
    }
  }

  /**
   * Obtiene información del usuario actual desde el backend
   * @returns Promise<any>
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response: any = await this.http.get(`${API_URL}/me`).toPromise();
      
      if (response && response.success && response.data) {
        // Actualizar datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error(response?.message || 'Error al obtener datos del usuario');
      }
    } catch (error: any) {
      console.error('Error al obtener usuario actual:', error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param currentPassword - Contraseña actual
   * @param newPassword - Nueva contraseña
   * @returns Promise<void>
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response: any = await this.http.post(`${API_URL}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: newPassword
      }).toPromise();

      if (response && response.success) {
        console.log('Contraseña cambiada exitosamente');
      } else {
        throw new Error(response?.message || 'Error al cambiar contraseña');
      }
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }
}
