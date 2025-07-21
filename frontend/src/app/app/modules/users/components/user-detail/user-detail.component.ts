import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService, User } from '../../services/users.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class UserDetailComponent implements OnInit, OnChanges {
  
  // Estados
  loading = false;
  error = '';
  
  // Datos del usuario
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  
  // Modal de cambio de contraseña
  showChangePasswordModal = false;
  newPassword = '';
  confirmNewPassword = '';
  changePasswordLoading = false;
  changePasswordError = '';
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.changePasswordError = '';
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.changePasswordError = '';
  }

  submitChangePassword(): void {
    if (!this.user) return;
    if (!this.newPassword || !this.confirmNewPassword) {
      this.changePasswordError = 'Debes ingresar y confirmar la nueva contraseña';
      return;
    }
    if (this.newPassword.length < 6) {
      this.changePasswordError = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.changePasswordError = 'Las contraseñas no coinciden';
      return;
    }
    this.changePasswordLoading = true;
    this.changePasswordError = '';
    this.usersService.adminChangePassword(this.user.id, this.newPassword, this.confirmNewPassword).subscribe({
      next: (response) => {
        if (response.success) {
          this.showToast = true;
          this.toastMessage = 'Contraseña cambiada exitosamente';
          this.toastType = 'success';
          setTimeout(() => { this.showToast = false; this.closeChangePasswordModal(); }, 2000);
        } else {
          this.changePasswordError = response.message || 'Error al cambiar contraseña';
          this.showToast = true;
          this.toastMessage = this.changePasswordError;
          this.toastType = 'error';
          setTimeout(() => { this.showToast = false; }, 2000);
        }
      },
      error: (error) => {
        this.changePasswordError = error?.error?.message || 'Error de conexión al cambiar contraseña';
        this.showToast = true;
        this.toastMessage = this.changePasswordError;
        this.toastType = 'error';
        setTimeout(() => { this.showToast = false; }, 2000);
      },
      complete: () => {
        this.changePasswordLoading = false;
      }
    });
  }
  
  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.loadUser();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.loading = false;
      this.error = '';
    }
  }
  
  /**
   * Carga los datos del usuario
   */
  private loadUser(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de usuario no válido';
      return;
    }
    
    this.loading = true;
    this.usersService.getUserById(+id).subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.data;
        } else {
          this.error = response.message || 'Error al cargar usuario';
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.error = 'Error de conexión al cargar usuario';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  /**
   * Navega a editar usuario
   */
  editUser(): void {
    if (this.user) {
      this.router.navigate(['/users/edit', this.user.id]);
    }
  }
  
  /**
   * Regresa a la lista
   */
  backToList(): void {
    this.router.navigate(['/users']);
  }
  
  /**
   * Obtiene el estado del usuario
   */
  getUserStatus(user: User): { text: string; class: string } {
    if (user.is_active) {
      return { text: 'Activo', class: 'bg-green-100 text-green-800' };
    } else {
      return { text: 'Inactivo', class: 'bg-red-100 text-red-800' };
    }
  }
  
  /**
   * Obtiene la inicial del nombre
   */
  getUserInitial(user: User): string {
    return user.full_name?.charAt(0)?.toUpperCase() || 'U';
  }
  
  /**
   * Formatea la fecha
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  closeModal(): void {
    this.close.emit();
  }
} 