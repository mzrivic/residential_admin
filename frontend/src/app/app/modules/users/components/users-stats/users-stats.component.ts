import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, UsersStatsResponse } from '../../services/users.service';

@Component({
  selector: 'app-users-stats',
  templateUrl: './users-stats.component.html',
  styleUrls: ['./users-stats.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class UsersStatsComponent implements OnInit {
  
  // Estados
  loading = false;
  error = '';
  
  // Estadísticas
  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    createdThisMonth: 0,
    createdThisYear: 0
  };
  
  // Math para usar en el template
  Math = Math;
  
  constructor(private usersService: UsersService) {}
  
  ngOnInit(): void {
    this.loadStats();
  }
  
  /**
   * Carga las estadísticas
   */
  loadStats(): void {
    this.loading = true;
    this.usersService.getUsersStats().subscribe({
      next: (response: UsersStatsResponse) => {
        if (response.success) {
          this.stats = response.data;
        } else {
          this.error = response.message || 'Error al cargar estadísticas';
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.error = 'Error de conexión al cargar estadísticas';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  /**
   * Calcula el porcentaje de usuarios activos
   */
  getActivePercentage(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.active / this.stats.total) * 100);
  }
  
  /**
   * Calcula el porcentaje de usuarios inactivos
   */
  getInactivePercentage(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.inactive / this.stats.total) * 100);
  }
} 