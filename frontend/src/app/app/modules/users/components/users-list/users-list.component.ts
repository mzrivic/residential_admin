import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { UsersService, User, UsersListResponse } from '../../services/users.service';
import { CreateUserModalComponent } from '../create-user-modal/create-user-modal.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  imports: [CommonModule, FormsModule, CreateUserModalComponent, UserFormComponent, UserDetailComponent],
  standalone: true
})
export class UsersListComponent implements OnInit, OnDestroy {
  
  // Datos
  users: User[] = [];
  loading = false;
  error = '';
  
  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  
  // Filtros
  searchTerm = '';
  statusFilter: 'active' | 'inactive' | '' = '';
  sortField = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Búsqueda
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Estados
  showFilters = false;
  selectedUsers: number[] = [];
  filteredSelectedUsers: User[] = [];
  
  // Estado del modal
  showCreateUserModal = false;
  
  // Estado del modal de eliminación
  showDeleteModal = false;
  userToDelete: User | null = null;
  deleteLoading = false;
  deleteError: string | null = null;
  deleteSuccess: string | null = null;
  
  // Estado y métodos para modal de edición
  showEditModal = false;
  userToEdit: User | null = null;

  openEditModal(user: User): void {
    this.userToEdit = user;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.userToEdit = null;
  }

  onUserEdited(): void {
    this.closeEditModal();
    this.loadUsers();
  }

  // Estado y métodos para modal de vista
  showViewModal = false;
  userToView: User | null = null;

  openViewModal(user: User): void {
    this.userToView = user;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.userToView = null;
  }
  
  // Math para usar en el template
  Math = Math;
  
  // Importación masiva
  showImportModal = false;
  importFile: File | null = null;
  importFileName = '';
  importLoading = false;
  importResult: any = null;
  importError = '';

  openImportModal(): void {
    this.showImportModal = true;
    this.importFile = null;
    this.importFileName = '';
    this.importLoading = false;
    this.importResult = null;
    this.importError = '';
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importFile = null;
    this.importFileName = '';
    this.importLoading = false;
    this.importResult = null;
    this.importError = '';
  }

  downloadTemplate(): void {
    console.log('Descargando plantilla Excel...');
    const backendUrl = 'http://localhost:3000/api/v1/persons/template';
    fetch(backendUrl)
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', Array.from(response.headers.entries()));
        if (!response.ok) throw new Error('No se pudo descargar la plantilla');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_personas.xlsx';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      })
      .catch((err) => {
        alert('No se pudo descargar la plantilla.');
        console.error('Error al descargar plantilla:', err);
      });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      this.importFile = file;
      this.importFileName = file.name;
      this.importError = '';
    } else {
      this.importError = 'Solo se permiten archivos Excel (.xlsx)';
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        this.importFile = file;
        this.importFileName = file.name;
        this.importError = '';
      } else {
        this.importError = 'Solo se permiten archivos Excel (.xlsx)';
      }
    }
  }

  uploadImportFile(): void {
    if (!this.importFile) return;
    this.importLoading = true;
    this.importResult = null;
    this.importError = '';
    const formData = new FormData();
    formData.append('file', this.importFile); // El campo debe ser 'file'
    fetch('http://localhost:3000/api/v1/persons/import', {
      method: 'POST',
      body: formData
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.success) {
          this.importResult = data;
          this.loadUsers(); // Refrescar lista tras importación exitosa
        } else {
          this.importError = data.message || 'Error al importar usuarios';
        }
      })
      .catch(() => {
        this.importError = 'Error de conexión al importar usuarios';
      })
      .finally(() => {
        this.importLoading = false;
      });
  }
  
  constructor(
    private usersService: UsersService,
    private router: Router
  ) {
    // Configurar búsqueda con debounce
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.currentPage = 1;
        this.loadUsers();
      });
  }
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Carga la lista de usuarios
   */
  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm || undefined,
      status: this.statusFilter || undefined,
      sort: this.sortField,
      order: this.sortOrder
    };
    
    this.usersService.getUsers(params).subscribe({
      next: (response: UsersListResponse) => {
        if (response.success) {
          this.users = response.data.items;
          this.totalItems = response.data.pagination.total;
          this.totalPages = response.data.pagination.pages;
          this.currentPage = response.data.pagination.page;
          this.updateFilteredSelectedUsers();
        } else {
          this.error = response.message || 'Error al cargar usuarios';
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Error de conexión al cargar usuarios';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  /**
   * Maneja la búsqueda
   */
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }
  
  /**
   * Cambia de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }
  
  /**
   * Cambia el orden de clasificación
   */
  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.loadUsers();
  }
  
  /**
   * Aplica filtros
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadUsers();
  }
  
  /**
   * Limpia filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortField = 'created_at';
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.loadUsers();
  }
  
  /**
   * Abre el modal para crear usuario
   */
  openCreateUserModal(): void {
    this.showCreateUserModal = true;
  }
  
  /**
   * Cierra el modal de crear usuario
   */
  closeCreateUserModal(): void {
    this.showCreateUserModal = false;
  }
  
  /**
   * Maneja cuando se crea un usuario exitosamente
   */
  onUserCreated(): void {
    this.closeCreateUserModal();
    this.loadUsers();
  }
  
  /**
   * Navega a ver usuario
   */
  viewUser(userId: number): void {
    this.router.navigate(['/dashboard/users/view', userId]);
  }
  
  /**
   * Navega a editar usuario
   */
  editUser(userId: number): void {
    this.router.navigate(['/dashboard/users/edit', userId]);
  }
  
  /**
   * Abre el modal de confirmación de eliminación
   */
  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
    this.deleteLoading = false;
    this.deleteError = null;
    this.deleteSuccess = null;
  }
  
  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
    this.deleteLoading = false;
    this.deleteError = null;
    this.deleteSuccess = null;
  }
  
  /**
   * Confirma la eliminación del usuario
   */
  confirmDeleteUser(): void {
    // Si hay selección múltiple, eliminar todos
    const validIds = this.selectedUsers.filter(id => id !== undefined && id !== null && !isNaN(id));
    if (validIds.length >= 1) {
      this.deleteLoading = true;
      this.deleteError = null;
      this.deleteSuccess = null;
      this.usersService.deleteUsers(validIds).subscribe({
        next: (response: any) => {
          this.deleteLoading = false;
          if (response.success) {
            this.deleteSuccess = response.message || 'Usuarios eliminados exitosamente';
            setTimeout(() => {
              this.closeDeleteModal();
              this.selectedUsers = [];
              this.updateFilteredSelectedUsers();
              this.loadUsers();
            }, 1200);
          } else {
            this.deleteError = response.message || 'Error al eliminar usuarios';
          }
        },
        error: (error) => {
          this.deleteLoading = false;
          this.deleteError = error?.error?.message || error?.message || 'Error al eliminar usuarios';
        }
      });
      return;
    }
    
    // Si es eliminación individual (userToDelete existe)
    if (this.userToDelete && this.userToDelete.id !== undefined && this.userToDelete.id !== null && !isNaN(this.userToDelete.id)) {
      this.deleteLoading = true;
      this.deleteError = null;
      this.deleteSuccess = null;
      this.usersService.deleteUser(this.userToDelete.id).subscribe({
        next: (response: any) => {
          this.deleteLoading = false;
          if (response.success) {
            this.deleteSuccess = response.message || 'Usuario eliminado exitosamente';
            setTimeout(() => {
              this.closeDeleteModal();
              this.loadUsers();
            }, 1200);
          } else {
            this.deleteError = response.message || 'Error al eliminar usuario';
          }
        },
        error: (error) => {
          this.deleteLoading = false;
          this.deleteError = error?.error?.message || error?.message || 'Error al eliminar usuario';
        }
      });
      return;
    }
    
    // Si no hay usuarios válidos para eliminar
    this.deleteError = 'No hay usuarios válidos seleccionados para eliminar';
  }
  
  /**
   * Restaura un usuario
   */
  restoreUser(userId: number): void {
    if (confirm('¿Estás seguro de que quieres restaurar este usuario?')) {
      this.usersService.restoreUser(userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers(); // Recargar lista
            // TODO: Mostrar notificación de éxito
          } else {
            // TODO: Mostrar notificación de error
            console.error('Error restoring user:', response.message);
          }
        },
        error: (error) => {
          console.error('Error restoring user:', error);
          // TODO: Mostrar notificación de error
        }
      });
    }
  }
  
  /**
   * Selecciona/deselecciona un usuario
   */
  toggleUserSelection(userId: number): void {
    if (this.selectedUsers.includes(userId)) {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    } else {
      this.selectedUsers.push(userId);
    }
    this.updateFilteredSelectedUsers();
  }
  
  /**
   * Selecciona todos los usuarios
   */
  selectAllUsers(): void {
    if (this.selectedUsers.length === this.users.length) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = this.users.map(u => u.id);
    }
    this.updateFilteredSelectedUsers();
  }
  
  /**
   * Elimina usuarios seleccionados
   */
  deleteSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      alert('Por favor selecciona al menos un usuario');
      return;
    }
    // Mostrar el mismo modal de confirmación, pero para múltiples usuarios
    this.userToDelete = null;
    this.showDeleteModal = true;
    this.deleteLoading = false;
    this.deleteError = null;
    this.deleteSuccess = null;
    this.updateFilteredSelectedUsers();
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
   * Obtiene el email principal del usuario
   */
  getPrimaryEmail(user: User): string {
    return user.person_email?.[0]?.email || 'Sin email';
  }
  
  /**
   * Obtiene el teléfono principal del usuario
   */
  getPrimaryPhone(user: User): string {
    return user.person_phone?.[0]?.phone || 'Sin teléfono';
  }
  
  /**
   * Obtiene la inicial del nombre
   */
  getUserInitial(user: User): string {
    return user.full_name?.charAt(0)?.toUpperCase() || 'U';
  }

  updateFilteredSelectedUsers(): void {
    this.filteredSelectedUsers = this.users.filter(u => this.selectedUsers.includes(u.id));
  }
} 