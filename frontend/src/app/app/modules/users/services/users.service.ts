import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../config/environment';

export interface User {
  id: number;
  document_type: string;
  document_number: string;
  full_name: string;
  gender: string;
  photo_url?: string;
  birth_date?: string;
  notes?: string;
  alias?: string;
  is_active: boolean;
  username?: string;
  language?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
  person_email?: PersonEmail[];
  person_phone?: PersonPhone[];
  person_image?: PersonImage[];
  person_role?: PersonRole[];
  vehicle?: Vehicle[];
}

export interface PersonEmail {
  id: number;
  person_id: number;
  email: string;
}

export interface PersonPhone {
  id: number;
  person_id: number;
  phone: string;
}

export interface PersonImage {
  id: number;
  person_id: number;
  image_url: string;
}

export interface PersonRole {
  id: number;
  person_id: number;
  role_id: number;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface Vehicle {
  id: number;
  person_id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
}

export interface CreateUserRequest {
  document_type: string;
  document_number: string;
  full_name: string;
  gender: string;
  photo_url?: string;
  birth_date?: string;
  notes?: string;
  alias?: string;
  is_active: boolean;
  username?: string;
  password?: string;
  language?: string;
  timezone?: string;
  emails?: { email: string }[];
  phones?: { phone: string }[];
  images?: { image_url: string }[];
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: {
    items: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters?: any;
    sorting?: {
      field: string;
      direction: string;
    };
  };
  meta: any;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
  meta: any;
  errors?: any[];
}

export interface UsersStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    active: number;
    inactive: number;
    createdThisMonth: number;
    createdThisYear: number;
  };
  meta: any;
}

export interface AutocompleteResponse {
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: number;
      full_name: string;
      document_number: string;
      alias?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  meta: any;
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    message: string;
  };
  meta: any;
}

export interface DuplicateCheckResponse {
  success: boolean;
  message: string;
  data: {
    hasDuplicates: boolean;
    documentNumber: string;
  };
  meta: any;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de usuarios con filtros y paginación
   */
  getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    role?: number;
    residential_unit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Observable<UsersListResponse> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<UsersListResponse>(`${this.API_URL}/persons`, { params: httpParams });
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/persons/${id}`);
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/persons`, userData);
  }

  /**
   * Actualiza un usuario completamente
   */
  updateUser(id: number, userData: CreateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/persons/${id}`, userData);
  }

  /**
   * Actualiza un usuario parcialmente
   */
  updateUserPartial(id: number, userData: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/persons/${id}/partial`, userData);
  }

  /**
   * Elimina un usuario (soft delete)
   */
  deleteUser(id: number): Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.API_URL}/persons/${id}`);
  }

  /**
   * Restaura un usuario eliminado
   */
  restoreUser(id: number): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/persons/${id}/restore`, {});
  }

  /**
   * Búsqueda de autocompletado
   */
  searchAutocomplete(query: string, limit: number = 10): Observable<AutocompleteResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());
    
    return this.http.get<AutocompleteResponse>(`${this.API_URL}/persons/search/autocomplete`, { params });
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  getUsersStats(): Observable<UsersStatsResponse> {
    return this.http.get<UsersStatsResponse>(`${this.API_URL}/persons/stats/overview`);
  }

  /**
   * Valida datos de usuario sin crear
   */
  validateUser(userData: CreateUserRequest): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>(`${this.API_URL}/persons/validate`, userData);
  }

  /**
   * Verifica si existe un usuario con el documento especificado
   */
  checkDuplicateDocument(documentNumber: string): Observable<DuplicateCheckResponse> {
    const params = new HttpParams().set('document_number', documentNumber);
    return this.http.get<DuplicateCheckResponse>(`${this.API_URL}/persons/duplicates/check`, { params });
  }

  /**
   * Elimina múltiples usuarios
   */
  deleteUsers(ids: number[]): Observable<UserResponse> {
    return this.http.request<UserResponse>('delete', `${this.API_URL}/persons/bulk`, { body: { ids } });
  }

  /**
   * Cambia la contraseña de un usuario (admin)
   */
  adminChangePassword(userId: number, new_password: string, confirm_new_password: string) {
    return this.http.post<any>(`${this.API_URL}/persons/${userId}/change-password`, {
      new_password,
      confirm_new_password
    });
  }
} 