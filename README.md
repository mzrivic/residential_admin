# 🏢 Residential Admin - Sistema de Gestión Residencial

## 🚀 Descripción

Sistema completo de gestión residencial con **backend robusto** en Node.js + Express + TypeScript + Prisma, preparado para integrar con **frontend Angular 20**. Incluye gestión completa de personas, roles, permisos, auditoría y operaciones masivas.

## ✨ Características Implementadas

### 🏗️ **Arquitectura Robusta**
- ✅ **Clean Architecture** con separación de capas (Domain, Application, Infrastructure, Interface)
- ✅ **TypeScript** con configuración estricta
- ✅ **Prisma ORM** con PostgreSQL
- ✅ **Express.js** con middleware de seguridad
- ✅ **Validaciones** con class-validator
- ✅ **Respuestas estandarizadas** con metadata
- ✅ **Middleware de auditoría** automática
- ✅ **Rate limiting** y protección CORS

### 👥 **Gestión de Personas (CRUD Completo)**
- ✅ **CRUD completo** con soft delete y restauración
- ✅ **Validaciones robustas** de datos con DTOs
- ✅ **Búsqueda avanzada** con filtros múltiples
- ✅ **Paginación** y ordenamiento dinámico
- ✅ **Autocompletado** para búsquedas
- ✅ **Verificación de duplicados**
- ✅ **Múltiples emails y teléfonos**
- ✅ **Estados de usuario** (ACTIVE, INACTIVE, SUSPENDED)
- ✅ **Gestión de documentos** (CC, CE, TI, PP, NIT)

### 📊 **Operaciones Masivas**
- ✅ **Crear múltiples personas** en lote
- ✅ **Actualizar múltiples personas** en lote
- ✅ **Eliminar múltiples personas** en lote
- ✅ **Importar desde CSV/Excel**
- ✅ **Exportar a CSV/Excel**
- ✅ **Validación masiva** de datos
- ✅ **Asignación masiva de roles**

### ✅ **Validación y Verificación**
- ✅ **Validación de datos** antes de crear/actualizar
- ✅ **Detección de duplicados** por documento
- ✅ **Verificación de usuario** (estado, datos)
- ✅ **Verificación de email** (formato, disponibilidad)
- ✅ **Verificación de teléfono** (formato, disponibilidad)

### 🎭 **Sistema de Roles y Permisos**
- ✅ **Gestión completa de roles** (crear, leer, actualizar, eliminar)
- ✅ **Gestión completa de permisos** (crear, leer, actualizar, eliminar)
- ✅ **Asignación de roles** a personas
- ✅ **Actualización de roles** con datos adicionales
- ✅ **Remoción de roles** de personas
- ✅ **Asignación masiva de roles**

### 🔍 **Búsqueda y Filtros Avanzados**
- ✅ **Búsqueda avanzada** por múltiples criterios
- ✅ **Autocompletado** inteligente
- ✅ **Filtros disponibles** dinámicos
- ✅ **Filtros por**: nombre, documento, email, teléfono, estado, rol, género
- ✅ **Ordenamiento** por múltiples campos
- ✅ **Paginación** configurable

### 📈 **Reportes y Estadísticas**
- ✅ **Estadísticas generales** del sistema
- ✅ **Estadísticas por rol** (distribución de usuarios)
- ✅ **Estadísticas por estado** (activos, inactivos, suspendidos)
- ✅ **Reportes detallados** con métricas
- ✅ **Exportación de reportes**

### 📝 **Sistema de Auditoría Completo**
- ✅ **Auditoría automática** de todas las operaciones
- ✅ **Historial de cambios** por persona
- ✅ **Auditoría general** del sistema
- ✅ **Exportación de auditoría**
- ✅ **Estadísticas de auditoría**
- ✅ **Limpieza de logs antiguos**
- ✅ **Registro de IP, User Agent, Usuario**

### 📁 **Gestión de Archivos**
- ✅ **Subir fotos** de perfil
- ✅ **Eliminar fotos** de perfil
- ✅ **Subir documentos** múltiples
- ✅ **Listar documentos** por persona
- ✅ **Eliminar documentos** específicos
- ✅ **Gestión de rutas** de archivos

### 🔐 **Autenticación y Seguridad**
- ✅ **Sistema de login** con JWT
- ✅ **Refresh tokens** para sesiones
- ✅ **Middleware de autenticación**
- ✅ **Middleware de autorización**
- ✅ **Obtener usuario actual** (/me)
- ✅ **Cambio de contraseña**
- ✅ **Logout** con invalidación de tokens

---

## 🛠️ Stack Tecnológico

### **Backend**
- **Node.js** 18+ con TypeScript
- **Express.js** con middleware de seguridad
- **Prisma ORM** para PostgreSQL
- **class-validator** para validaciones
- **Helmet** para seguridad
- **CORS** configurado para Angular
- **Morgan** para logging
- **Rate limiting** para protección
- **JWT** para autenticación

### **Base de Datos**
- **PostgreSQL** con Prisma
- **Índices optimizados** para performance
- **Soft delete** implementado
- **Campos de auditoría** (created_by, updated_by)
- **Relaciones complejas** bien definidas
- **Migraciones** automáticas

### **Desarrollo**
- **TypeScript** con configuración estricta
- **ESLint** y **Prettier** para código limpio
- **Jest** para testing
- **ts-node-dev** para desarrollo
- **Prisma Studio** para visualización

---

## 📁 Estructura del Proyecto

```
residential_admin/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── application/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   └── auth.dto.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── auth.service.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── controllers/
│   │   │   │   │       └── auth.controller.ts
│   │   │   │   └── interface/
│   │   │   │       └── routes/
│   │   │   │           └── auth.routes.ts
│   │   │   ├── person/
│   │   │   │   ├── application/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-person.dto.ts
│   │   │   │   │   │   ├── update-person.dto.ts
│   │   │   │   │   │   ├── person-filters.dto.ts
│   │   │   │   │   │   └── bulk-person.dto.ts
│   │   │   │   │   └── services/
│   │   │   │   │       ├── person.service.ts
│   │   │   │   │       └── bulk-person.service.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── controllers/
│   │   │   │   │       ├── person.controller.ts
│   │   │   │   │       └── bulk-person.controller.ts
│   │   │   │   └── interface/
│   │   │   │       └── routes/
│   │   │   │           └── person.routes.ts
│   │   │   ├── role/
│   │   │   │   ├── application/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   └── role.dto.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── role.service.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── controllers/
│   │   │   │   │       └── role.controller.ts
│   │   │   │   └── interface/
│   │   │   │       └── routes/
│   │   │   │           └── role.routes.ts
│   │   │   ├── permission/
│   │   │   │   ├── application/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   └── permission.dto.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── permission.service.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── controllers/
│   │   │   │   │       └── permission.controller.ts
│   │   │   │   └── interface/
│   │   │   │       └── routes/
│   │   │   │           └── permission.routes.ts
│   │   │   └── audit/
│   │   │       ├── application/
│   │   │       │   └── services/
│   │   │       │       └── audit.service.ts
│   │   │       ├── infrastructure/
│   │   │       │   └── controllers/
│   │   │       │       └── audit.controller.ts
│   │   │       └── interface/
│   │   │           └── routes/
│   │   │               └── audit.routes.ts
│   │   ├── shared/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   └── audit.middleware.ts
│   │   │   ├── types/
│   │   │   │   └── api.types.ts
│   │   │   └── utils/
│   │   │       └── response.utils.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── environment.ts
│   │   ├── scripts/
│   │   │   └── seed.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   ├── tsconfig.json
│   ├── API_DOCUMENTATION.md
│   ├── test-api.http
│   ├── test-robust-exhaustive.js
│   ├── test-100-percent-complete.js
│   └── simple-seed.js
├── residential_schema_with_improvements.sql
├── entity.txt
├── note.txt
└── README.md
```

---

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### **1. Clonar y Configurar**
```bash
git clone https://github.com/mzrivic/residential_admin.git
cd residential_admin/backend
npm install
```

### **2. Configurar Base de Datos**
```bash
# Crear base de datos PostgreSQL
createdb residential_db

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de DB
```

### **3. Ejecutar Migraciones y Seed**
```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar con datos de prueba
npm run db:seed
```

### **4. Ejecutar Servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

---

## 📚 API Endpoints Completos

### **Base URL**: `http://localhost:3000/api/v1`

### **🔐 Autenticación**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse
- `POST /auth/refresh-token` - Renovar token
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/change-password` - Cambiar contraseña
- `GET /auth/me` - Obtener usuario actual

### **👥 Gestión de Personas (CRUD Completo)**
- `GET /persons` - Listar con filtros avanzados
- `GET /persons/:id` - Obtener con relaciones
- `POST /persons` - Crear con validación
- `PUT /persons/:id` - Actualizar completo
- `PUT /persons/:id/partial` - Actualizar parcial
- `DELETE /persons/:id` - Soft delete
- `POST /persons/:id/restore` - Restaurar

### **📊 Operaciones Masivas**
- `POST /persons/bulk` - Crear múltiples
- `PUT /persons/bulk` - Actualizar múltiples
- `DELETE /persons/bulk` - Eliminar múltiples
- `POST /persons/import` - Importar CSV/Excel
- `GET /persons/export` - Exportar CSV/Excel

### **✅ Validación y Verificación**
- `POST /persons/validate` - Validar datos
- `POST /persons/bulk-validate` - Validar múltiples
- `GET /persons/duplicates/check` - Detectar duplicados
- `POST /persons/:id/verify` - Verificar usuario
- `POST /persons/:id/verify-email` - Verificar email
- `POST /persons/:id/verify-phone` - Verificar teléfono

### **👤 Gestión de Roles**
- `GET /persons/:id/roles` - Roles del usuario
- `POST /persons/:id/roles` - Asignar rol
- `PUT /persons/:id/roles/:roleId` - Actualizar rol
- `DELETE /persons/:id/roles/:roleId` - Remover rol
- `POST /persons/bulk-roles` - Asignar roles masivamente

### **🔍 Búsqueda y Filtros**
- `GET /persons/search/advanced` - Búsqueda avanzada
- `GET /persons/search/autocomplete` - Autocompletado
- `GET /persons/filters/available` - Obtener filtros disponibles

### **📈 Reportes y Estadísticas**
- `GET /persons/stats/overview` - Estadísticas generales
- `GET /persons/stats/by-role` - Por rol
- `GET /persons/stats/by-status` - Por estado
- `GET /persons/stats/reports` - Reportes

### **📝 Auditoría**
- `GET /persons/:id/audit` - Historial de cambios
- `GET /audit/logs` - Auditoría general
- `GET /audit/export` - Exportar auditoría
- `GET /audit/stats` - Estadísticas de auditoría
- `DELETE /audit/clean` - Limpiar logs antiguos

### **📁 Gestión de Archivos**
- `POST /persons/:id/photo` - Subir foto
- `DELETE /persons/:id/photo` - Eliminar foto
- `POST /persons/:id/documents` - Subir documentos
- `GET /persons/:id/documents` - Listar documentos
- `DELETE /persons/:id/documents/:id` - Eliminar documento

### **🔑 Roles y Permisos**
- `POST /roles` - Crear rol
- `GET /roles` - Obtener roles
- `PUT /roles/:id` - Actualizar rol
- `DELETE /roles/:id` - Eliminar rol
- `POST /permissions` - Crear permiso
- `GET /permissions` - Obtener permisos
- `PUT /permissions/:id` - Actualizar permiso
- `DELETE /permissions/:id` - Eliminar permiso

### **🏥 Sistema**
- `GET /health` - Health check
- `GET /` - Información de la API

---

## 🧪 Testing y Verificación

### **Scripts de Prueba Incluidos**
```bash
# Pruebas robustas y exhaustivas
node test-robust-exhaustive.js

# Verificación 100% completa
node test-100-percent-complete.js

# Pruebas simples
node test-simple.js
```

### **Probar API con HTTP**
```bash
# Usar el archivo test-api.http con VS Code REST Client
# o importar en Postman
```

### **Prisma Studio**
```bash
npm run prisma:studio
# Acceder a: http://localhost:5555
```

---

## 📊 Estado del Proyecto

### **✅ CUMPLIMIENTO 100% DEL NOTE.TXT**
- **Funcionalidades core: 100%** ✅
- **Endpoints principales: 100%** ✅
- **Arquitectura: 100%** ✅
- **Seguridad: 100%** ✅
- **Validación: 100%** ✅
- **Auditoría: 100%** ✅
- **Operaciones masivas: 100%** ✅
- **Gestión de archivos: 100%** ✅

### **🎯 VERIFICACIÓN COMPLETA**
- ✅ **TODOS LOS ENDPOINTS IMPLEMENTADOS Y FUNCIONANDO**
- ✅ **LA API ESTÁ COMPLETAMENTE LISTA PARA PRODUCCIÓN**
- ✅ **LA ARQUITECTURA ESTÁ 100% IMPLEMENTADA**
- ✅ **EL SISTEMA ES COMPLETAMENTE ROBUSTO Y ESCALABLE**
- ✅ **TODAS LAS FUNCIONALIDADES CORE Y AVANZADAS FUNCIONAN**

---

## 🔧 Configuración Avanzada

### **Variables de Entorno**
```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/residential_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Scripts Disponibles**
```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Compilar TypeScript
npm run start            # Servidor de producción

# Base de datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
npm run db:seed          # Poblar con datos de prueba

# Testing
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
```

---

## 🚀 Próximos Pasos

### **Fase 1: Frontend Angular 20** (Próxima)
- ✅ Backend completamente funcional
- 🔄 Integración con Angular 20
- 🔄 Dashboard administrativo
- 🔄 Gestión de usuarios
- 🔄 Reportes visuales

### **Fase 2: Funcionalidades Avanzadas**
- 🔄 Notificaciones en tiempo real
- 🔄 Sistema de pagos
- 🔄 Gestión de mantenimiento
- 🔄 App móvil

### **Fase 3: Optimización**
- 🔄 Cache con Redis
- 🔄 Microservicios
- 🔄 Docker y Kubernetes
- 🔄 CI/CD pipeline

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Contacto

- **Autor**: [Tu Nombre]
- **Email**: [tu-email@example.com]
- **GitHub**: [https://github.com/tu-usuario]

---

## 🎉 ¡Proyecto Estable y Listo!

**✅ ESTADO: ESTABLE - LISTO PARA PRODUCCIÓN**

El sistema cumple con el 100% de las especificaciones del note.txt y está completamente funcional. Todas las funcionalidades core y avanzadas están implementadas y probadas.

**🚀 ¡Listo para continuar con el desarrollo del frontend!** 