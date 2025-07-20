import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/auth/auth/auth';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para la respuesta de login del backend
 */
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      full_name: string;
      username: string;
      email: string;
      status: string;
      roles: Array<{
        id: number;
        name: string;
        permissions: string[];
      }>;
    };
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
 * Interfaz para errores de la API
 */
interface ApiError {
  success: false;
  message: string;
  meta?: {
    timestamp: string;
    operation: string;
    version: string;
    requestId: string;
  };
}

/**
 * Componente de login con Tailwind CSS
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  /** Formulario reactivo para el login */
  loginForm: FormGroup;
  
  /** Estado de carga */
  loading = false;
  
  /** Mensaje de error */
  error: string | null = null;
  
  /** Mensaje de éxito */
  success: string | null = null;
  
  /** Timeout para auto-ocultar alertas */
  private alertTimeout: any = null;
  
  /** Control de visibilidad de contraseña */
  hidePassword = true;
  
  /** Estado del tema (claro/oscuro) */
  isDarkTheme = false;
  


  constructor(
    private fb: FormBuilder, 
    private auth: Auth, 
    private router: Router
  ) {
    this.loginForm = this.createLoginForm();
    this.loadThemePreference();
  }

  ngOnInit(): void {
    // Limpiar cualquier sesión previa al cargar el login
    this.auth.logout();
    this.applyTheme();
  }

  ngOnDestroy(): void {
    // Limpiar timeout al destruir el componente
    this.clearAlertTimeout();
  }

  /**
   * Crea el formulario de login con validaciones
   */
  private createLoginForm(): FormGroup {
    return this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100)
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Maneja el envío del formulario de login
   */
  async onSubmit(): Promise<void> {
    // Limpiar mensajes previos
    this.clearMessages();
    
    // Validar formulario
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    
    // Iniciar estado de carga
    this.loading = true;
    
    try {
      const { username, password, rememberMe } = this.loginForm.value;
      
      // Intentar login
      await this.auth.login(username, password);
      
      // Configurar "recordar sesión" si está marcado
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Obtener datos del usuario para el mensaje personalizado
      const user = this.auth.getUser();
      const userName = user?.full_name || user?.username || 'Usuario';
      this.showSuccess(`¡Bienvenido ${userName}! Redirigiendo al dashboard...`);
      
      // Redirigir después de mostrar el mensaje
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
      
    } catch (error: any) {
      // Procesar error según la estructura de la API
      this.handleLoginError(error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Maneja errores de login según la estructura de la API
   */
  private handleLoginError(error: any): void {
    console.error('Error en login:', error);
    
    // Si es un error de red o conexión
    if (error.status === 0) {
      this.showError('No se puede conectar con el servidor. Verifica tu conexión a internet.');
      return;
    }
    
    // Si es un error de cuenta bloqueada (423) - Usar mensaje exacto del backend
    if (error.status === 423) {
      const apiMessage = error.error?.message || 'Cuenta temporalmente bloqueada.';
      this.showError(apiMessage);
      return;
    }
    
    // Si es un error de usuario no encontrado (404) - Usar mensaje exacto del backend
    if (error.status === 404) {
      const apiMessage = error.error?.message || 'Usuario no encontrado.';
      this.showError(apiMessage);
      return;
    }
    
    // Si es un error de autenticación (401) - Usar mensaje exacto del backend
    if (error.status === 401) {
      const apiMessage = error.error?.message || 'Usuario o contraseña incorrectos.';
      
      // Detectar si es un mensaje de cuenta bloqueada
      if (apiMessage.includes('Cuenta temporalmente bloqueada')) {
        this.showError('Cuenta temporalmente bloqueada. Intenta de nuevo en 15 minutos.');
        return;
      }
      
      this.showError(apiMessage);
      return;
    }
    
    // Si es un error de validación (400) - Usar mensaje exacto del backend
    if (error.status === 400) {
      const apiMessage = error.error?.message || 'Datos de entrada inválidos.';
      this.showError(apiMessage);
      return;
    }
    
    // Si es un error del servidor (500+)
    if (error.status >= 500) {
      this.showError('Error interno del servidor. Nuestro equipo ha sido notificado.');
      return;
    }
    
    // Si es un error de timeout
    if (error.status === 408 || error.name === 'TimeoutError') {
      this.showError('La solicitud tardó demasiado. Verifica tu conexión.');
      return;
    }
    
    // Si es un error de rate limiting (429)
    if (error.status === 429) {
      this.showError('Demasiados intentos. Espera un momento antes de intentar de nuevo.');
      return;
    }
    
    // Error genérico - Usar mensaje del backend si está disponible
    const errorMessage = error.error?.message || error.message || 'Error inesperado. Intenta de nuevo.';
    this.showError(errorMessage);
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Limpia todos los mensajes de error y éxito
   */
  clearMessages(): void {
    this.error = null;
    this.success = null;
    this.clearAlertTimeout();
  }

  /**
   * Limpia el timeout de auto-ocultar alertas
   */
  private clearAlertTimeout(): void {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }

  /**
   * Muestra un mensaje de éxito con auto-ocultar
   */
  private showSuccess(message: string): void {
    this.clearAlertTimeout();
    this.success = message;
    this.error = null;
    
    // Auto-ocultar después de 3 segundos
    this.alertTimeout = setTimeout(() => {
      this.success = null;
    }, 3000);
  }

  /**
   * Muestra un mensaje de error con auto-ocultar
   */
  private showError(message: string): void {
    this.clearAlertTimeout();
    this.error = message;
    this.success = null;
    
    // Auto-ocultar después de 4 segundos
    this.alertTimeout = setTimeout(() => {
      this.error = null;
    }, 4000);
  }



  /**
   * Limpia solo el mensaje de error
   */
  clearError(): void {
    this.error = null;
    this.clearAlertTimeout();
  }

  /**
   * Maneja el clic en "Olvidaste tu contraseña"
   */
  onForgotPassword(event: Event): void {
    event.preventDefault();
    // TODO: Implementar recuperación de contraseña
    this.error = 'Función de recuperación de contraseña en desarrollo.';
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName === 'username' ? 'El usuario' : 'La contraseña'} es obligatorio`;
    }
    if (field?.hasError('minlength')) {
      const minLength = fieldName === 'username' ? 3 : 6;
      return `${fieldName === 'username' ? 'El usuario' : 'La contraseña'} debe tener al menos ${minLength} caracteres`;
    }
    return '';
  }

  /**
   * Cambia entre tema claro y oscuro
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.saveThemePreference();
    this.applyTheme();
  }

  /**
   * Guarda la preferencia de tema en localStorage
   */
  private saveThemePreference(): void {
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  /**
   * Carga la preferencia de tema desde localStorage
   */
  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
  }

  /**
   * Aplica el tema actual al documento
   */
  private applyTheme(): void {
    const body = document.body;
    if (this.isDarkTheme) {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }
}
