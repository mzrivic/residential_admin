import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService, CreateUserRequest } from '../../services/users.service';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         (click)="closeModal()">
      
      <!-- Modal Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">👤</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Crear Nuevo Usuario</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Completa la información del usuario</p>
            </div>
          </div>
          <button (click)="closeModal()" 
                  class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Alertas -->
        <div *ngIf="alertMessage" class="px-6 pt-4">
          <div [ngClass]="{
            'bg-green-100 text-green-800 border-green-300': alertType === 'success',
            'bg-red-100 text-red-800 border-red-300': alertType === 'error'
          }" class="rounded-lg border px-4 py-3 flex items-start space-x-2 animate-fade-in">
            <span *ngIf="alertType === 'success'" class="text-xl mt-0.5">✅</span>
            <span *ngIf="alertType === 'error'" class="text-xl mt-0.5">❌</span>
            <div class="flex-1">
              <span class="font-medium block">{{ alertMessage }}</span>
              <ul *ngIf="alertType === 'error' && alertErrors.length > 0" class="mt-2 space-y-1 list-disc list-inside">
                <li *ngFor="let err of alertErrors" class="flex items-center text-sm">
                  <svg class="w-4 h-4 mr-1 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>{{ err }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Acordeón -->
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          <div class="space-y-4">
            <!-- Datos Básicos -->
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button type="button" (click)="toggleSection('basic')"
                class="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <span class="font-semibold text-gray-900 dark:text-white flex items-center">
                  <span class="mr-2">📋</span> Datos Básicos
                </span>
                <svg [ngClass]="{ 'rotate-180': openSection === 'basic' }" class="w-5 h-5 text-blue-500 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div *ngIf="openSection === 'basic'" class="px-6 py-4 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Tipo de Documento -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Documento *</label>
                    <select formControlName="document_type" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Seleccionar...</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                    <div *ngIf="userForm.get('document_type')?.invalid && userForm.get('document_type')?.touched" class="text-red-500 text-sm mt-1">Tipo de documento es requerido</div>
                  </div>
                  <!-- Número de Documento -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Documento *</label>
                    <input type="text" formControlName="document_number" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="12345678">
                    <div *ngIf="userForm.get('document_number')?.invalid && userForm.get('document_number')?.touched" class="text-red-500 text-sm mt-1">Número de documento es requerido</div>
                  </div>
                </div>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo *</label>
                  <input type="text" formControlName="full_name" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Juan Carlos Pérez González">
                  <div *ngIf="userForm.get('full_name')?.invalid && userForm.get('full_name')?.touched" class="text-red-500 text-sm mt-1">Nombre completo es requerido</div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <!-- Género -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Género *</label>
                    <select formControlName="gender" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Seleccionar...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                    <div *ngIf="userForm.get('gender')?.invalid && userForm.get('gender')?.touched" class="text-red-500 text-sm mt-1">Género es requerido</div>
                  </div>
                  <!-- Fecha de Nacimiento -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Nacimiento</label>
                    <input type="date" formControlName="birth_date" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  </div>
                </div>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alias</label>
                  <input type="text" formControlName="alias" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Juan">
                </div>
              </div>
            </div>

            <!-- Acceso -->
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button type="button" (click)="toggleSection('access')"
                class="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <span class="font-semibold text-gray-900 dark:text-white flex items-center">
                  <span class="mr-2">🔐</span> Acceso
                </span>
                <svg [ngClass]="{ 'rotate-180': openSection === 'access' }" class="w-5 h-5 text-blue-500 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div *ngIf="openSection === 'access'" class="px-6 py-4 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Username -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de Usuario</label>
                    <input type="text" formControlName="username" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="juan.perez">
                  </div>
                  <!-- Contraseña -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                    <input type="password" formControlName="password" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="••••••••">
                  </div>
                </div>
                <div class="flex items-center space-x-3 mt-4">
                  <input type="checkbox" formControlName="is_active" id="is_active" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                  <label for="is_active" class="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario Activo</label>
                </div>
              </div>
            </div>

            <!-- Contacto -->
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button type="button" (click)="toggleSection('contact')"
                class="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <span class="font-semibold text-gray-900 dark:text-white flex items-center">
                  <span class="mr-2">📧</span> Contacto
                </span>
                <svg [ngClass]="{ 'rotate-180': openSection === 'contact' }" class="w-5 h-5 text-blue-500 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div *ngIf="openSection === 'contact'" class="px-6 py-4 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Email -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input type="email" formControlName="email" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="juan.perez@email.com">
                  </div>
                  <!-- Teléfono -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                    <input type="tel" formControlName="phone" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="+57 300 123 4567">
                  </div>
                </div>
              </div>
            </div>

            <!-- Notas -->
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button type="button" (click)="toggleSection('notes')"
                class="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <span class="font-semibold text-gray-900 dark:text-white flex items-center">
                  <span class="mr-2">📝</span> Notas
                </span>
                <svg [ngClass]="{ 'rotate-180': openSection === 'notes' }" class="w-5 h-5 text-blue-500 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div *ngIf="openSection === 'notes'" class="px-6 py-4 animate-fade-in">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
                <textarea formControlName="notes" rows="3" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Información adicional sobre el usuario..."></textarea>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" (click)="closeModal()"
                    class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="userForm.invalid || loading"
                    class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2">
              <span *ngIf="loading" class="animate-spin">⏳</span>
              <span>{{ loading ? 'Creando...' : 'Crear Usuario' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
  `]
})
export class CreateUserModalComponent {
  @Output() userCreated = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  userForm: FormGroup;
  loading = false;
  openSection: 'basic' | 'access' | 'contact' | 'notes' | null = null;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  alertTimeout: any = null;
  alertErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.userForm = this.fb.group({
      document_type: ['', Validators.required],
      document_number: ['', Validators.required],
      full_name: ['', Validators.required],
      gender: ['', Validators.required],
      birth_date: [''],
      alias: [''],
      username: [''],
      password: [''],
      is_active: [true],
      email: [''],
      phone: [''],
      notes: ['']
    });
  }

  toggleSection(section: 'basic' | 'access' | 'contact' | 'notes') {
    this.openSection = this.openSection === section ? null : section;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const formValue = this.userForm.value;
      const userData: CreateUserRequest = {
        document_type: formValue.document_type,
        document_number: formValue.document_number,
        full_name: formValue.full_name,
        gender: formValue.gender,
        birth_date: formValue.birth_date,
        alias: formValue.alias,
        is_active: formValue.is_active,
        username: formValue.username,
        password: formValue.password,
        emails: formValue.email ? [{ email: formValue.email }] : [],
        phones: formValue.phone ? [{ phone: formValue.phone }] : [],
        images: []
      };
      this.usersService.createUser(userData).subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success) {
            this.showAlert(response.message || 'Usuario creado exitosamente', 'success');
            this.userCreated.emit(response.data);
            setTimeout(() => this.closeModal(), 1200);
          } else {
            let msg = response.message || 'Error al crear usuario';
            let errors: string[] = [];
            if (response.errors && response.errors.length > 0) {
              errors = response.errors.map((e: any) => e.message);
            }
            this.showAlert(msg, 'error', errors);
          }
        },
        error: (error) => {
          this.loading = false;
          let msg = 'Error al crear usuario';
          let errors: string[] = [];
          if (error?.error?.message) {
            msg = error.error.message;
            if (error.error.errors && error.error.errors.length > 0) {
              errors = error.error.errors.map((e: any) => e.message);
            }
          } else if (error?.message) {
            msg = error.message;
          }
          this.showAlert(msg, 'error', errors);
        }
      });
    }
  }

  showAlert(message: string, type: 'success' | 'error', errors?: string[]): void {
    // Traducción de errores técnicos a mensajes claros
    if (type === 'error') {
      if (message && message.includes('Unique constraint failed') && message.includes('username')) {
        message = 'El nombre de usuario ya está en uso.';
      } else if (message && message.includes('Unique constraint failed') && message.includes('document_number')) {
        message = 'El número de documento ya está registrado.';
      } else if (message && message.includes('Unique constraint failed') && message.includes('email')) {
        message = 'El correo electrónico ya está registrado.';
      }
      if (errors && errors.length > 0) {
        errors = errors.map(e => {
          if (e.includes('Unique constraint failed') && e.includes('username')) return 'El nombre de usuario ya está en uso.';
          if (e.includes('Unique constraint failed') && e.includes('document_number')) return 'El número de documento ya está registrado.';
          if (e.includes('Unique constraint failed') && e.includes('email')) return 'El correo electrónico ya está registrado.';
          return e;
        });
      }
    }
    this.alertMessage = message;
    this.alertType = type;
    this.alertErrors = errors || [];
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    if (type === 'success') {
      this.alertTimeout = setTimeout(() => {
        this.alertMessage = null;
        this.alertType = null;
        this.alertErrors = [];
      }, 2000);
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
    this.alertMessage = null;
    this.alertType = null;
    this.alertErrors = [];
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
  }
} 