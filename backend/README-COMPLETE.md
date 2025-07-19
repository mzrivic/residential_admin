# 🏢 Residential Admin Backend - Sistema Completo

Backend API completo para gestión residencial con Node.js, Express, TypeScript, Prisma y PostgreSQL. Incluye autenticación robusta, gestión de roles y permisos, auditoría completa, operaciones masivas y más.

## 🚀 Características Implementadas

### ✅ **Sistema de Autenticación Robusto**
- Login/Logout con JWT
- Refresh tokens
- Gestión de sesiones
- Bloqueo por intentos fallidos
- Cambio de contraseña
- Registro de usuarios
- Recuperación de contraseña

### ✅ **Gestión de Personas Completa**
- CRUD completo con validaciones
- Operaciones masivas (crear, actualizar, eliminar)
- Importación/Exportación CSV
- Búsqueda avanzada y filtros
- Autocompletado
- Validación de datos
- Detección de duplicados
- Verificación de email/teléfono

### ✅ **Sistema de Roles y Permisos**
- Gestión completa de roles
- Gestión completa de permisos
- Asignación de permisos a roles
- Asignación de roles a personas
- Operaciones masivas
- Validación de permisos en endpoints

### ✅ **Sistema de Auditoría**
- Log automático de todas las operaciones
- Historial de cambios por registro
- Estadísticas de auditoría
- Exportación de logs
- Limpieza automática de logs antiguos
- Actividad por usuario

### ✅ **Operaciones Masivas**
- Crear múltiples registros
- Actualizar múltiples registros
- Eliminar múltiples registros
- Validación masiva
- Importación desde CSV
- Exportación a CSV

### ✅ **Middleware de Seguridad**
- Autenticación JWT
- Validación de permisos
- Rate limiting
- Sanitización de datos
- Headers de seguridad (Helmet)
- CORS configurado

### ✅ **Base de Datos Completa**
- Esquema completo con todas las entidades
- Relaciones bien definidas
- Índices optimizados
- Soft delete implementado
- Campos de auditoría automáticos

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 12.0
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd residential_admin/backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/residential_admin?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL="http://localhost:4200"
```

### 4. Configurar la base de datos
```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar con datos de prueba
npm run db:seed
```

### 5. Iniciar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 🔑 Credenciales de Prueba

Después de ejecutar el seed, tendrás estos usuarios disponibles:

| Usuario | Contraseña | Rol | Permisos |
|---------|------------|-----|----------|
| `admin` | `password123` | Administrador | Todos |
| `usuario` | `password123` | Usuario | Básicos |
| `seguridad` | `password123` | Seguridad | Lectura y auditoría |

## 📚 API Endpoints

### 🔐 Autenticación
```
POST   /api/v1/auth/login              # Login
POST   /api/v1/auth/register           # Registro
POST   /api/v1/auth/refresh-token      # Refresh token
POST   /api/v1/auth/logout             # Logout
POST   /api/v1/auth/change-password    # Cambiar contraseña
GET    /api/v1/auth/me                 # Información del usuario
POST   /api/v1/auth/forgot-password    # Recuperar contraseña
POST   /api/v1/auth/reset-password     # Resetear contraseña
```

### 👥 Personas
```
GET    /api/v1/persons                 # Listar con filtros
GET    /api/v1/persons/:id             # Obtener por ID
POST   /api/v1/persons                 # Crear
PUT    /api/v1/persons/:id             # Actualizar completo
PUT    /api/v1/persons/:id/partial     # Actualizar parcial
DELETE /api/v1/persons/:id             # Eliminar
POST   /api/v1/persons/:id/restore     # Restaurar

# Operaciones Masivas
POST   /api/v1/persons/bulk            # Crear múltiples
PUT    /api/v1/persons/bulk            # Actualizar múltiples
DELETE /api/v1/persons/bulk            # Eliminar múltiples
POST   /api/v1/persons/import          # Importar CSV
GET    /api/v1/persons/export          # Exportar CSV

# Búsqueda y Validación
GET    /api/v1/persons/search/advanced # Búsqueda avanzada
GET    /api/v1/persons/search/autocomplete # Autocompletado
POST   /api/v1/persons/validate        # Validar datos
POST   /api/v1/persons/bulk-validate   # Validación masiva
GET    /api/v1/persons/duplicates/check # Verificar duplicados

# Reportes
GET    /api/v1/persons/stats/overview  # Estadísticas generales
GET    /api/v1/persons/stats/by-role   # Por rol
GET    /api/v1/persons/stats/by-status # Por estado
GET    /api/v1/persons/reports         # Reportes

# Gestión de Roles
GET    /api/v1/persons/:id/roles       # Roles del usuario
POST   /api/v1/persons/bulk-roles      # Asignar roles masivamente

# Verificación
POST   /api/v1/persons/:id/verify      # Verificar usuario
POST   /api/v1/persons/:id/verify-email # Verificar email
POST   /api/v1/persons/:id/verify-phone # Verificar teléfono
```

### 👤 Roles
```
GET    /api/v1/roles                   # Listar roles
GET    /api/v1/roles/:id               # Obtener rol
POST   /api/v1/roles                   # Crear rol
PUT    /api/v1/roles/:id               # Actualizar rol
DELETE /api/v1/roles/:id               # Eliminar rol
POST   /api/v1/roles/:id/restore       # Restaurar rol

# Gestión de Permisos
POST   /api/v1/roles/:id/permissions   # Asignar permisos
GET    /api/v1/roles/:id/permissions   # Obtener permisos

# Operaciones Masivas
POST   /api/v1/roles/bulk              # Crear múltiples
PUT    /api/v1/roles/bulk              # Actualizar múltiples
DELETE /api/v1/roles/bulk              # Eliminar múltiples

# Reportes
GET    /api/v1/roles/stats/overview    # Estadísticas
```

### 🔑 Permisos
```
GET    /api/v1/permissions             # Listar permisos
GET    /api/v1/permissions/:id         # Obtener permiso
POST   /api/v1/permissions             # Crear permiso
PUT    /api/v1/permissions/:id         # Actualizar permiso
DELETE /api/v1/permissions/:id         # Eliminar permiso
POST   /api/v1/permissions/:id/restore # Restaurar permiso

# Gestión de Roles
GET    /api/v1/permissions/:id/roles   # Obtener roles

# Operaciones Masivas
POST   /api/v1/permissions/bulk        # Crear múltiples
PUT    /api/v1/permissions/bulk        # Actualizar múltiples
DELETE /api/v1/permissions/bulk        # Eliminar múltiples

# Reportes
GET    /api/v1/permissions/stats/overview # Estadísticas
GET    /api/v1/permissions/available/list # Lista disponible
```

### 📝 Auditoría
```
GET    /api/v1/audit/history/:table/:id # Historial de registro
GET    /api/v1/audit/logs              # Logs de auditoría
GET    /api/v1/audit/stats             # Estadísticas
GET    /api/v1/audit/export            # Exportar logs
DELETE /api/v1/audit/clean             # Limpiar logs antiguos
GET    /api/v1/audit/summary/:table/:id/:operation # Resumen de cambios
GET    /api/v1/audit/user/:userId/activity # Actividad de usuario
```

## 🧪 Testing

### Archivo de Pruebas HTTP
Usa el archivo `test-api-complete.http` para probar todos los endpoints:

1. Abre el archivo en VS Code con la extensión "REST Client"
2. Ejecuta las pruebas en orden (las variables se configuran automáticamente)
3. Verifica las respuestas y códigos de estado

### Pruebas Automatizadas
```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## 📊 Estructura de la Base de Datos

### Entidades Principales
- **person**: Usuarios del sistema
- **role**: Roles disponibles
- **permission**: Permisos del sistema
- **role_permission**: Relación roles-permisos
- **person_role**: Relación personas-roles
- **user_session**: Sesiones de usuario
- **audit_log**: Logs de auditoría

### Entidades Residenciales
- **residential_unit**: Unidades residenciales
- **tower**: Torres
- **floor**: Pisos
- **apartment**: Apartamentos
- **parking_zone**: Zonas de parqueo
- **parking**: Espacios de parqueo
- **common_area**: Zonas comunes
- **vehicle**: Vehículos

## 🔧 Configuración Avanzada

### Variables de Entorno Adicionales
```env
# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Audit
AUDIT_LOG_RETENTION_DAYS=90
AUDIT_LOG_MAX_SIZE=1000

# Email (futuro)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis (futuro)
REDIS_URL="redis://localhost:6379"

# Logging
LOG_LEVEL="info"
LOG_FILE="./logs/app.log"
```

### Scripts Disponibles
```bash
npm run build              # Compilar TypeScript
npm run start              # Iniciar en producción
npm run dev                # Desarrollo con hot reload
npm run test               # Ejecutar tests
npm run lint               # Linting
npm run format             # Formatear código
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:reset       # Resetear base de datos
npm run db:seed            # Poblar con datos de prueba
```

## 🚀 Despliegue

### Producción
1. Configurar variables de entorno de producción
2. Ejecutar `npm run build`
3. Usar `npm start` para iniciar
4. Configurar reverse proxy (nginx)
5. Configurar SSL/TLS
6. Configurar monitoreo y logs

### Docker (Futuro)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoreo y Logs

### Logs Estructurados
El sistema genera logs estructurados con:
- Timestamp
- Nivel de log
- Operación
- Request ID
- Usuario
- IP
- User Agent

### Métricas Disponibles
- Requests por minuto
- Tiempo de respuesta
- Errores por endpoint
- Uso de memoria
- Conexiones de base de datos

## 🔒 Seguridad

### Implementado
- ✅ Autenticación JWT
- ✅ Validación de permisos
- ✅ Rate limiting
- ✅ Sanitización de datos
- ✅ Headers de seguridad
- ✅ CORS configurado
- ✅ Bloqueo por intentos fallidos
- ✅ Logs de auditoría

### Recomendaciones de Producción
- Cambiar JWT_SECRET
- Configurar HTTPS
- Implementar WAF
- Monitoreo de seguridad
- Backup automático
- Rotación de logs

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Notificaciones push
- [ ] Reportes avanzados
- [ ] Dashboard en tiempo real
- [ ] Integración con sistemas externos
- [ ] API GraphQL
- [ ] Microservicios
- [ ] Cache con Redis
- [ ] Cola de tareas
- [ ] Webhooks
- [ ] API versioning

---

**¡El sistema está listo para producción! 🚀** 