# 📚 API Documentation - Residential Admin

## 🚀 Información General

- **Base URL**: `http://localhost:3000`
- **Versión**: 1.0.0
- **Formato de Respuesta**: JSON
- **Autenticación**: JWT (próximamente)

## 📋 Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "CREATE_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Error descriptivo",
  "errors": [
    {
      "field": "document_number",
      "message": "El número de documento es obligatorio",
      "code": "REQUIRED",
      "value": null
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "CREATE_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

### Respuesta Paginada
```json
{
  "success": true,
  "message": "Datos obtenidos exitosamente",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": { ... },
    "sorting": {
      "field": "created_at",
      "direction": "desc"
    }
  },
  "meta": { ... }
}
```

---

## 👥 Gestión de Personas

### 1. Crear Persona

**POST** `/api/v1/persons`

**Descripción**: Crea una nueva persona en el sistema.

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "document_type": "CC",
  "document_number": "12345678",
  "full_name": "Juan Carlos Pérez González",
  "gender": "M",
  "photo_url": "https://via.placeholder.com/150/007bff/ffffff?text=JC",
  "birth_date": "1985-03-15",
  "notes": "Administrador principal",
  "alias": "Juan",
  "is_active": true,
  "username": "admin",
  "password": "admin123",
  "language": "es",
  "timezone": "America/Bogota",
  "emails": [
    {
      "email": "admin@residential.com"
    }
  ],
  "phones": [
    {
      "phone": "+57 300 123 4567"
    }
  ],
  "images": [
    {
      "image_url": "https://via.placeholder.com/300x400/007bff/ffffff?text=Admin+Photo"
    }
  ]
}
```

**Respuesta Exitosa** (201):
```json
{
  "success": true,
  "message": "Persona creada exitosamente",
  "data": {
    "id": 1,
    "document_type": "CC",
    "document_number": "12345678",
    "full_name": "Juan Carlos Pérez González",
    "gender": "M",
    "photo_url": "https://via.placeholder.com/150/007bff/ffffff?text=JC",
    "birth_date": "1985-03-15T00:00:00.000Z",
    "notes": "Administrador principal",
    "alias": "Juan",
    "is_active": true,
    "username": "admin",
    "language": "es",
    "timezone": "America/Bogota",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "person_email": [
      {
        "id": 1,
        "person_id": 1,
        "email": "admin@residential.com"
      }
    ],
    "person_phone": [
      {
        "id": 1,
        "person_id": 1,
        "phone": "+57 300 123 4567"
      }
    ],
    "person_image": [
      {
        "id": 1,
        "person_id": 1,
        "image_url": "https://via.placeholder.com/300x400/007bff/ffffff?text=Admin+Photo"
      }
    ],
    "person_role": [],
    "vehicle": []
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "CREATE_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

**Respuesta de Error** (400):
```json
{
  "success": false,
  "message": "Ya existe una persona con el documento 12345678",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "CREATE_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

### 2. Listar Personas

**GET** `/api/v1/persons`

**Descripción**: Obtiene una lista paginada de personas con filtros opcionales.

**Query Parameters**:
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 10, max: 100)
- `search` (string, opcional): Búsqueda en nombre, documento o alias
- `status` (string, opcional): Filtrar por estado ("active" o "inactive")
- `role` (number, opcional): Filtrar por ID de rol
- `residential_unit` (number, opcional): Filtrar por ID de unidad residencial
- `sort` (string, opcional): Campo para ordenar (default: "created_at")
- `order` (string, opcional): Dirección del orden ("asc" o "desc", default: "desc")

**Ejemplo de Request**:
```
GET /api/v1/persons?page=1&limit=5&search=Juan&status=active&sort=full_name&order=asc
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Personas obtenidas exitosamente",
  "data": {
    "items": [
      {
        "id": 1,
        "document_type": "CC",
        "document_number": "12345678",
        "full_name": "Juan Carlos Pérez González",
        "gender": "M",
        "photo_url": "https://via.placeholder.com/150/007bff/ffffff?text=JC",
        "birth_date": "1985-03-15T00:00:00.000Z",
        "notes": "Administrador principal",
        "alias": "Juan",
        "is_active": true,
        "username": "admin",
        "language": "es",
        "timezone": "America/Bogota",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "person_email": [...],
        "person_phone": [...],
        "person_image": [...],
        "person_role": [...],
        "vehicle": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "filters": {
      "search": "Juan",
      "status": "active"
    },
    "sorting": {
      "field": "full_name",
      "direction": "asc"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "LIST_PERSONS",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

### 3. Obtener Persona por ID

**GET** `/api/v1/persons/:id`

**Descripción**: Obtiene una persona específica por su ID.

**Path Parameters**:
- `id` (number): ID de la persona

**Ejemplo de Request**:
```
GET /api/v1/persons/1
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Persona obtenida exitosamente",
  "data": {
    "id": 1,
    "document_type": "CC",
    "document_number": "12345678",
    "full_name": "Juan Carlos Pérez González",
    "gender": "M",
    "photo_url": "https://via.placeholder.com/150/007bff/ffffff?text=JC",
    "birth_date": "1985-03-15T00:00:00.000Z",
    "notes": "Administrador principal",
    "alias": "Juan",
    "is_active": true,
    "username": "admin",
    "language": "es",
    "timezone": "America/Bogota",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "person_email": [...],
    "person_phone": [...],
    "person_image": [...],
    "person_role": [...],
    "vehicle": [...]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "GET_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

**Respuesta de Error** (404):
```json
{
  "success": false,
  "message": "Persona con ID 999 no encontrada",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "GET_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

### 4. Actualizar Persona

**PUT** `/api/v1/persons/:id`

**Descripción**: Actualiza una persona completamente.

**Path Parameters**:
- `id` (number): ID de la persona

**Body**: Mismo formato que crear persona (todos los campos requeridos)

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Persona actualizada exitosamente",
  "data": { ... },
  "meta": { ... }
}
```

### 5. Actualizar Persona Parcialmente

**PUT** `/api/v1/persons/:id/partial`

**Descripción**: Actualiza solo los campos proporcionados de una persona.

**Path Parameters**:
- `id` (number): ID de la persona

**Body**: Solo los campos a actualizar
```json
{
  "full_name": "Juan Carlos Pérez González Actualizado",
  "notes": "Notas actualizadas"
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Persona actualizada exitosamente",
  "data": { ... },
  "meta": { ... }
}
```

### 6. Eliminar Persona

**DELETE** `/api/v1/persons/:id`

**Descripción**: Elimina una persona (soft delete).

**Path Parameters**:
- `id` (number): ID de la persona

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Persona eliminada exitosamente",
  "data": {
    "id": 1
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "DELETE_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

### 7. Restaurar Persona

**POST** `/api/v1/persons/:id/restore`

**Descripción**: Restaura una persona eliminada.

**Path Parameters**:
- `id` (number): ID de la persona

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Persona restaurada exitosamente",
  "data": {
    "id": 1
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "operation": "RESTORE_PERSON",
    "version": "1.0.0",
    "requestId": "abc123"
  }
}
```

---

## 🔍 Búsqueda y Utilidades

### 8. Autocompletado

**GET** `/api/v1/persons/search/autocomplete`

**Descripción**: Búsqueda de autocompletado para personas.

**Query Parameters**:
- `q` (string, requerido): Término de búsqueda
- `limit` (number, opcional): Límite de resultados (default: 10)

**Ejemplo de Request**:
```
GET /api/v1/persons/search/autocomplete?q=Juan&limit=5
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Datos obtenidos exitosamente",
  "data": {
    "items": [
      {
        "id": 1,
        "full_name": "Juan Carlos Pérez González",
        "document_number": "12345678",
        "alias": "Juan"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "meta": { ... }
}
```

### 9. Estadísticas

**GET** `/api/v1/persons/stats/overview`

**Descripción**: Obtiene estadísticas generales de personas.

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "total": 6,
    "active": 5,
    "inactive": 1,
    "createdThisMonth": 3,
    "createdThisYear": 6
  },
  "meta": { ... }
}
```

### 10. Validar Datos

**POST** `/api/v1/persons/validate`

**Descripción**: Valida datos de persona sin crear.

**Body**: Mismo formato que crear persona

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Datos validados exitosamente",
  "data": {
    "valid": true,
    "message": "Datos válidos"
  },
  "meta": { ... }
}
```

### 11. Verificar Duplicados

**GET** `/api/v1/persons/duplicates/check`

**Descripción**: Verifica si existe una persona con el documento especificado.

**Query Parameters**:
- `document_number` (string, requerido): Número de documento a verificar

**Ejemplo de Request**:
```
GET /api/v1/persons/duplicates/check?document_number=12345678
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Verificación de duplicados completada",
  "data": {
    "hasDuplicates": true,
    "documentNumber": "12345678"
  },
  "meta": { ... }
}
```

---

## 🏥 Health Check

### 12. Estado del Servicio

**GET** `/health`

**Descripción**: Verifica el estado del servicio.

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600,
    "environment": "development"
  },
  "meta": { ... }
}
```

---

## 🏠 Información General

### 13. Información de la API

**GET** `/`

**Descripción**: Obtiene información general de la API.

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "API de Gestión Residencial",
  "data": {
    "name": "Residential Admin API",
    "version": "1.0.0",
    "description": "API para gestión de personas, roles y unidades residenciales",
    "endpoints": {
      "persons": "/api/v1/persons",
      "health": "/health"
    }
  },
  "meta": { ... }
}
```

---

## 📝 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autorizado |
| 403 | Forbidden - Prohibido |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: duplicado) |
| 422 | Unprocessable Entity - Entidad no procesable |
| 429 | Too Many Requests - Demasiadas requests |
| 500 | Internal Server Error - Error interno |

---

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/residential_db"

# Servidor
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:4200

# Seguridad
JWT_SECRET=tu_jwt_secret_aqui
```

---

## 🚀 Instalación y Uso

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar base de datos
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Poblar con datos de prueba
```bash
npm run db:seed
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Ejecutar en producción
```bash
npm run build
npm start
```

---

## 📊 Testing

### Ejecutar tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

---

## 🔍 Prisma Studio

Para visualizar y editar la base de datos:

```bash
npm run prisma:studio
```

Accede a: http://localhost:5555

---

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Postman Collection](https://www.postman.com/collection/...)

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 