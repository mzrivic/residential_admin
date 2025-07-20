import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // Estado del tema
  isDarkTheme = false;
  
  // Estado del sidebar
  sidebarCollapsed = false;
  
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
      route: '/users/create',
      color: 'bg-blue-500 hover:bg-blue-600'
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
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'audit-logs',
      title: 'Logs de Auditoría',
      description: 'Revisar historial de actividades',
      icon: '📝',
      route: '/audit',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];
  
  // Loading state
  loading = true;
  
  constructor() {}
  
  ngOnInit(): void {
    this.loadThemePreference();
    this.loadDashboardData();
    this.applyTheme();
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
   * Alterna el estado del sidebar
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  /**
   * Navega a una ruta específica y contrae el sidebar
   */
  navigateTo(route: string): void {
    // TODO: Implementar navegación real
    console.log('Navigating to:', route);
    
    // Contrae el sidebar automáticamente al navegar
    if (!this.sidebarCollapsed) {
      this.sidebarCollapsed = true;
    }
  }
}
