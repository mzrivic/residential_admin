import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService, CreateUserRequest, User } from '../../services/users.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class UserFormComponent implements OnInit, OnChanges {
  
  // Estados
  loading = false;
  error = '';
  isEditMode = false;
  userId: number | null = null;
  
  // Formulario
  userForm = {
    document_type: 'CC',
    document_number: '',
    full_name: '',
    gender: 'M',
    photo_url: '',
    birth_date: '',
    notes: '',
    alias: '',
    is_active: true,
    username: '',
    password: '',
    language: 'es',
    timezone: 'America/Bogota',
    emails: [{ email: '' }],
    phones: [{ phone: '' }],
    images: [{ image_url: '' }]
  };
  
  // Opciones
  documentTypes = ['CC', 'CE', 'TI', 'PP', 'NIT'];
  genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  // Agregar propiedad para el acordeón:
  openSection: 'basic' | 'access' | 'contact' | 'notes' | 'optional' | null = null;

  // Errores por campo
  errorFields: { [key: string]: string } = {};

  // Toast visual
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  @Input() user: User | null = null;
  @Output() userSaved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.checkEditMode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.isEditMode = true;
      this.userId = this.user.id;
      this.userForm = {
        document_type: this.user.document_type,
        document_number: this.user.document_number,
        full_name: this.user.full_name,
        gender: this.user.gender,
        photo_url: this.user.photo_url || '',
        birth_date: this.user.birth_date ? new Date(this.user.birth_date).toISOString().split('T')[0] : '',
        notes: this.user.notes || '',
        alias: this.user.alias || '',
        is_active: this.user.is_active,
        username: this.user.username || '',
        password: '',
        language: this.user.language || 'es',
        timezone: this.user.timezone || 'America/Bogota',
        emails: this.user.person_email?.length ? this.user.person_email.map(e => ({ email: e.email })) : [{ email: '' }],
        phones: this.user.person_phone?.length ? this.user.person_phone.map(p => ({ phone: p.phone })) : [{ phone: '' }],
        images: this.user.person_image?.length ? this.user.person_image.map(i => ({ image_url: i.image_url })) : [{ image_url: '' }]
      };
    } else if (changes['user'] && !this.user) {
      this.isEditMode = false;
      this.userId = null;
      // Reset form to default values
      this.userForm = {
        document_type: 'CC',
        document_number: '',
        full_name: '',
        gender: 'M',
        photo_url: '',
        birth_date: '',
        notes: '',
        alias: '',
        is_active: true,
        username: '',
        password: '',
        language: 'es',
        timezone: 'America/Bogota',
        emails: [{ email: '' }],
        phones: [{ phone: '' }],
        images: [{ image_url: '' }]
      };
    }
  }
  
  /**
   * Verifica si estamos en modo edición
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser(+id);
    }
  }
  
  /**
   * Carga los datos del usuario para editar
   */
  private loadUser(id: number): void {
    this.loading = true;
    this.usersService.getUserById(id).subscribe({
      next: (response) => {
        if (response.success) {
          const user = response.data;
          this.userForm = {
            document_type: user.document_type,
            document_number: user.document_number,
            full_name: user.full_name,
            gender: user.gender,
            photo_url: user.photo_url || '',
            birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
            notes: user.notes || '',
            alias: user.alias || '',
            is_active: user.is_active,
            username: user.username || '',
            password: '', // No cargamos la contraseña por seguridad
            language: user.language || 'es',
            timezone: user.timezone || 'America/Bogota',
            emails: user.person_email?.length ? user.person_email.map(e => ({ email: e.email })) : [{ email: '' }],
            phones: user.person_phone?.length ? user.person_phone.map(p => ({ phone: p.phone })) : [{ phone: '' }],
            images: user.person_image?.length ? user.person_image.map(i => ({ image_url: i.image_url })) : [{ image_url: '' }]
          };
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
   * Agrega un nuevo email
   */
  addEmail(): void {
    this.userForm.emails.push({ email: '' });
  }
  
  /**
   * Elimina un email
   */
  removeEmail(index: number): void {
    if (this.userForm.emails.length > 1) {
      this.userForm.emails.splice(index, 1);
    }
  }
  
  /**
   * Agrega un nuevo teléfono
   */
  addPhone(): void {
    this.userForm.phones.push({ phone: '' });
  }
  
  /**
   * Elimina un teléfono
   */
  removePhone(index: number): void {
    if (this.userForm.phones.length > 1) {
      this.userForm.phones.splice(index, 1);
    }
  }
  
  /**
   * Agrega una nueva imagen
   */
  addImage(): void {
    this.userForm.images.push({ image_url: '' });
  }
  
  /**
   * Elimina una imagen
   */
  removeImage(index: number): void {
    if (this.userForm.images.length > 1) {
      this.userForm.images.splice(index, 1);
    }
  }
  
  /**
   * Valida el formulario
   */
  private validateForm(): boolean {
    if (!this.userForm.document_number.trim()) {
      this.error = 'El número de documento es requerido';
      return false;
    }
    if (!this.userForm.full_name.trim()) {
      this.error = 'El nombre completo es requerido';
      return false;
    }
    if (!this.userForm.username.trim()) {
      this.error = 'El nombre de usuario es requerido';
      return false;
    }
    if (!this.isEditMode && !this.userForm.password.trim()) {
      this.error = 'La contraseña es requerida';
      return false;
    }
    return true;
  }
  
  /**
   * Guarda el usuario
   */
  saveUser(): void {
    if (!this.validateForm()) {
      return;
    }
    this.loading = true;
    this.error = '';
    this.errorFields = {};
    // Preparar datos
    const userData: CreateUserRequest = {
      ...this.userForm,
      emails: this.userForm.emails.filter(e => e.email.trim()),
      phones: this.userForm.phones.filter(p => p.phone.trim()),
      images: this.userForm.images.filter(i => i.image_url.trim())
    };
    // Remover contraseña si está vacía en modo edición
    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }
    const request = this.isEditMode 
      ? this.usersService.updateUser(this.userId!, userData)
      : this.usersService.createUser(userData);
    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.error = '';
          this.errorFields = {};
          // Toast de éxito
          this.showToast = true;
          this.toastMessage = this.isEditMode ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
          this.toastType = 'success';
          // Limpiar formulario si es creación
          if (!this.isEditMode) {
            this.userForm = {
              document_type: 'CC',
              document_number: '',
              full_name: '',
              gender: 'M',
              photo_url: '',
              birth_date: '',
              notes: '',
              alias: '',
              is_active: true,
              username: '',
              password: '',
              language: 'es',
              timezone: 'America/Bogota',
              emails: [{ email: '' }],
              phones: [{ phone: '' }],
              images: [{ image_url: '' }]
            };
          }
          // Esperar a que el usuario vea el toast antes de cerrar el modal
          setTimeout(() => {
            this.showToast = false;
            this.userSaved.emit();
          }, 2000);
        } else {
          this.error = response.message || 'Error al guardar usuario';
          this.showToast = true;
          this.toastMessage = this.error;
          this.toastType = 'error';
          setTimeout(() => { this.showToast = false; }, 3000);
          // Si hay errores de campos
          if (response.errors && Array.isArray(response.errors)) {
            response.errors.forEach((err: any) => {
              if (err.field) {
                this.errorFields[err.field] = err.message;
              }
            });
          }
        }
      },
      error: (error) => {
        this.error = 'Error de conexión al guardar usuario';
        this.showToast = true;
        this.toastMessage = this.error;
        this.toastType = 'error';
        setTimeout(() => { this.showToast = false; }, 3000);
        if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
          error.error.errors.forEach((err: any) => {
            if (err.field) {
              this.errorFields[err.field] = err.message;
            }
          });
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  /**
   * Cancela y regresa a la lista
   */
  triggerCancel(): void {
    this.cancel.emit();
  }
} 