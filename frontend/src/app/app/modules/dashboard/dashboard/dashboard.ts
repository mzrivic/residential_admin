import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService, User } from '../../../core/auth/auth.service';
import confetti from 'canvas-confetti';

// Interfaces
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  recentActivities: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  // Estado del tema
  isDarkTheme = false;
  
  // Estado del sidebar
  sidebarCollapsed = true; // Inicialmente colapsado
  
  // Control de timing para evitar expansiones/contracciones rápidas
  private sidebarTimeout: any = null;
  private isExpanding = false;
  
  // Datos del dashboard
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    recentActivities: 0
  };
  
  // Acciones rápidas
  quickActions: QuickAction[] = [
    {
      id: 'add-user',
      title: 'Agregar Usuario',
      description: 'Crear nuevo usuario en el sistema',
      icon: '👤',
      route: '/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'view-users',
      title: 'Ver Usuarios',
      description: 'Gestionar usuarios existentes',
      icon: '👥',
      route: '/users',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'manage-roles',
      title: 'Gestionar Roles',
      description: 'Administrar roles y permisos',
      icon: '🔑',
      route: '/roles',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'view-reports',
      title: 'Ver Reportes',
      description: 'Generar reportes y estadísticas',
      icon: '📊',
      route: '/reports',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];
  
  // Loading state
  loading = true;
  
  // Usuario actual
  currentUser: User | null = null;
  
  // Estado de notificación
  showNotification = false;
  notificationMessage = '';
  notificationType = 'success';
  
  // Responsividad y menú hamburguesa
  isMobile = false;
  sidebarOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadThemePreference();
    this.loadDashboardData();
    this.applyTheme();
    this.loadCurrentUser();
    this.setupMouseTracking();
  }

  ngAfterViewInit(): void {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile.bind(this));
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebarMobile(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  ngOnDestroy(): void {
    // Cleanup si es necesario
  }
  
  /**
   * Carga los datos del dashboard
   */
  private async loadDashboardData(): Promise<void> {
    try {
      this.loading = true;
      
      // TODO: Implementar llamadas a la API
      // Por ahora usamos datos de ejemplo
      await this.simulateApiCall();
      
      this.stats = {
        totalUsers: 156,
        activeUsers: 142,
        totalRoles: 8,
        recentActivities: 23
      };
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * Simula una llamada a la API
   */
  private simulateApiCall(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
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
   * Expande el sidebar
   */
  expandSidebar(): void {
    // Evitar expansiones múltiples rápidas
    if (this.isExpanding || !this.sidebarCollapsed) return;
    
    this.isExpanding = true;
    this.sidebarCollapsed = false;
    
    // Resetear el flag después de la animación
    setTimeout(() => {
      this.isExpanding = false;
    }, 300); // Duración de la transición
  }

  /**
   * Contrae el sidebar
   */
  collapseSidebar(): void {
    // Limpiar timeout anterior si existe
    if (this.sidebarTimeout) {
      clearTimeout(this.sidebarTimeout);
    }
    
    // Solo contraer si está expandido
    if (!this.sidebarCollapsed) {
      this.sidebarCollapsed = true;
    }
  }

  /**
   * Maneja el doble clic en opciones del sidebar
   */
  onSidebarItemDoubleClick(): void {
    this.collapseSidebar();
  }

  /**
   * Maneja cuando el mouse entra al sidebar
   */
  onSidebarMouseEnter(): void {
    // Limpiar timeout de contracción si existe
    if (this.sidebarTimeout) {
      clearTimeout(this.sidebarTimeout);
      this.sidebarTimeout = null;
    }
    
    // Expandir automáticamente cuando el mouse entra
    if (this.sidebarCollapsed) {
      this.expandSidebar();
    }
  }

  /**
   * Maneja cuando el mouse sale del sidebar
   */
  onSidebarMouseLeave(): void {
    // Solo contraer si está expandido
    // Agregamos un delay para evitar contracciones accidentales
    if (!this.sidebarCollapsed) {
      this.sidebarTimeout = setTimeout(() => {
        this.collapseSidebar();
      }, 300); // Delay más corto para contracción más rápida
    }
  }

  /**
   * Maneja cuando el mouse entra al área de detección (zona cercana al sidebar)
   */
  onDetectionAreaMouseEnter(): void {
    // Limpiar timeout de contracción si existe
    if (this.sidebarTimeout) {
      clearTimeout(this.sidebarTimeout);
      this.sidebarTimeout = null;
    }
    
    // Expandir automáticamente cuando el mouse se acerca al sidebar
    if (this.sidebarCollapsed) {
      this.expandSidebar();
    }
  }

  /**
   * Configura el tracking del mouse para detectar cuando está cerca del borde derecho
   */
  private setupMouseTracking(): void {
    // Detectar cuando el mouse está cerca del borde derecho de la ventana
    document.addEventListener('mousemove', (event) => {
      const windowWidth = window.innerWidth;
      const mouseX = event.clientX;
      
      // Si el mouse está a menos de 150px del borde derecho y el sidebar está colapsado
      if (mouseX > windowWidth - 150 && this.sidebarCollapsed) {
        // Limpiar timeout de contracción si existe
        if (this.sidebarTimeout) {
          clearTimeout(this.sidebarTimeout);
          this.sidebarTimeout = null;
        }
        
        // Expandir el sidebar
        this.expandSidebar();
      }
    });
  }
  
  /**
   * Verifica si hay una ruta hija activa
   */
  hasChildRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/dashboard/users') || currentUrl.includes('/dashboard/roles') || currentUrl.includes('/dashboard/reports');
  }



  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string): void {
    // Navegar a la ruta (agregar /dashboard si no está presente)
    const fullRoute = route.startsWith('/dashboard') ? route : `/dashboard${route}`;
    this.router.navigate([fullRoute]);
    // Si es móvil, cerrar el sidebar automáticamente
    if (this.isMobile && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }

  /**
   * Carga el usuario actual
   */
  private loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  /**
   * Muestra una notificación temporal
   */
  private showTemporaryNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  /**
   * Efecto de confeti al cerrar sesión
   */
  private triggerLogoutConfetti(): void {
    // Efecto de confeti desde el centro
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
    });

    // Efecto adicional después de 500ms
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1']
      });
    }, 500);

    // Efecto final después de 1000ms
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#96ceb4', '#feca57', '#ff9ff3']
      });
    }, 1000);
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      console.log('Logging out...');
      
      // Llamar al servicio de logout
      this.authService.logout().subscribe({
        next: (response) => {
          console.log('Logout successful:', response.message);
          
          // Contrae el sidebar
          this.sidebarCollapsed = true;
          
          // Limpiar usuario actual
          this.currentUser = null;
          
          // Mostrar notificación
          this.showTemporaryNotification('¡Sesión cerrada exitosamente! 🎉', 'success');
          
          // Efecto de confeti
          this.triggerLogoutConfetti();
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error during logout:', error);
          
          // Si falla la API, hacer logout local
          this.authService.logoutLocal();
          this.currentUser = null;
          this.sidebarCollapsed = true;
          
          // Mostrar notificación
          this.showTemporaryNotification('Sesión cerrada localmente', 'success');
          
          // Efecto de confeti
          this.triggerLogoutConfetti();
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      });
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback: logout local
      this.authService.logoutLocal();
      this.currentUser = null;
      this.sidebarCollapsed = true;
      
      // Mostrar notificación
      this.showTemporaryNotification('Error al cerrar sesión', 'error');
      
      // Efecto de confeti
      this.triggerLogoutConfetti();
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }
}
