# 🏢 Residential Admin - Sistema de Gestión Residencial

## 🚀 Descripción

Sistema completo de gestión residencial con **backend robusto** en Node.js + Express + TypeScript + Prisma, preparado para integrar con **frontend Angular 20**. Incluye gestión completa de personas, roles, unidades residenciales, vehículos y auditoría.

## ✨ Características Implementadas

### 🏗️ **Arquitectura Robusta**
- ✅ **Clean Architecture** con separación de capas
- ✅ **TypeScript** con configuración estricta
- ✅ **Prisma ORM** con PostgreSQL
- ✅ **Express.js** con middleware de seguridad
- ✅ **Validaciones** con class-validator
- ✅ **Respuestas estandarizadas** con metadata

### 👥 **Gestión de Personas**
- ✅ **CRUD completo** con soft delete
- ✅ **Validaciones robustas** de datos
- ✅ **Búsqueda avanzada** con filtros
- ✅ **Paginación** y ordenamiento
- ✅ **Autocompletado** para búsquedas
- ✅ **Verificación de duplicados**
- ✅ **Múltiples emails y teléfonos**
- ✅ **Gestión de imágenes**
- ✅ **Estados de usuario** (activo/inactivo)

### 🎭 **Sistema de Roles**
- ✅ **Roles predefinidos**: Administrador, Propietario, Inquilino, Visitante
- ✅ **Permisos granulares** por rol
- ✅ **Asignación de roles** a personas
- ✅ **Relación con unidades residenciales**

### 🏠 **Gestión Residencial**
- ✅ **Unidades residenciales** (torres)
- ✅ **Apartamentos** con pisos
- ✅ **Asignación de personas** a apartamentos
- ✅ **Gestión de vehículos** por persona

### 🔍 **Funcionalidades Avanzadas**
- ✅ **Auditoría automática** de cambios
- ✅ **Soft delete** con restauración
- ✅ **Estadísticas** y reportes
- ✅ **Rate limiting** y seguridad
- ✅ **CORS configurado** para frontend
- ✅ **Logging** de operaciones

### 📊 **Datos de Prueba**
- ✅ **Script de seed** con datos realistas
- ✅ **6 personas** con diferentes roles
- ✅ **2 unidades residenciales** con apartamentos
- ✅ **Emails, teléfonos e imágenes** asociadas
- ✅ **Vehículos** registrados

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

### **Base de Datos**
- **PostgreSQL** con Prisma
- **Índices optimizados** para performance
- **Soft delete** implementado
- **Campos de auditoría** (created_by, updated_by)
- **Relaciones complejas** bien definidas

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
│   │   │   └── person/
│   │   │       ├── application/
│   │   │       │   ├── dto/
│   │   │       │   │   └── create-person.dto.ts
│   │   │       │   └── services/
│   │   │       │       └── person.service.ts
│   │   │       ├── infrastructure/
│   │   │       │   └── controllers/
│   │   │       │       └── person.controller.ts
│   │   │       └── interface/
│   │   │           └── routes/
│   │   │               └── person.routes.ts
│   │   ├── shared/
│   │   │   ├── types/
│   │   │   │   └── api.types.ts
│   │   │   └── utils/
│   │   │       └── response.utils.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── scripts/
│   │   │   └── seed.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── API_DOCUMENTATION.md
│   └── test-api.http
├── residential_schema_with_improvements.sql
├── entity.txt
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

## 📚 API Endpoints

### **Base URL**: `http://localhost:3000`

### **👥 Gestión de Personas**
- `POST /api/v1/persons` - Crear persona
- `GET /api/v1/persons` - Listar personas (con filtros)
- `GET /api/v1/persons/:id` - Obtener persona por ID
- `PUT /api/v1/persons/:id` - Actualizar persona
- `PUT /api/v1/persons/:id/partial` - Actualizar parcialmente
- `DELETE /api/v1/persons/:id` - Eliminar persona (soft delete)
- `POST /api/v1/persons/:id/restore` - Restaurar persona

### **🔍 Utilidades**
- `GET /api/v1/persons/search/autocomplete` - Autocompletado
- `GET /api/v1/persons/stats/overview` - Estadísticas
- `POST /api/v1/persons/validate` - Validar datos
- `GET /api/v1/persons/duplicates/check` - Verificar duplicados

### **🏥 Sistema**
- `GET /health` - Health check
- `GET /` - Información de la API

---

## 🧪 Testing

### **Probar API con HTTP**
```bash
# Usar el archivo test-api.http con VS Code REST Client
# o importar en Postman
```

### **Ejecutar Tests**
```bash
npm test
npm run test:watch
```

### **Prisma Studio**
```bash
npm run prisma:studio
# Acceder a: http://localhost:5555
```

---

## 📊 Datos de Prueba Incluidos

### **Personas Creadas**
1. **Juan Carlos Pérez** - Administrador
2. **María Elena Rodríguez** - Propietaria (A01)
3. **Carlos Alberto Martínez** - Propietario (A02)
4. **Ana Sofía García** - Inquilina (A03)
5. **Luis Fernando Herrera** - Inquilino (B01)
6. **Patricia Isabel Vargas** - Visitante

### **Unidades Residenciales**
- **Torre A**: 10 apartamentos
- **Torre B**: 8 apartamentos

### **Roles**
- Administrador (permisos completos)
- Propietario (READ, WRITE)
- Inquilino (READ)
- Visitante (READ)

---

## 🔧 Configuración Avanzada

### **Variables de Entorno**
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/residential_db"

# Servidor
PORT=3000
NODE_ENV=development

# Frontend (para CORS)
FRONTEND_URL=http://localhost:4200

# Seguridad
JWT_SECRET=tu_jwt_secret_aqui
```

### **Scripts Disponibles**
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción
npm run lint         # Verificar código
npm run lint:fix     # Corregir código
npm run format       # Formatear código
npm run test         # Ejecutar tests
npm run prisma:studio # Abrir Prisma Studio
npm run db:seed      # Poblar con datos de prueba
```

---

## 📈 Próximas Funcionalidades

### **Fase 2: Autenticación y Autorización**
- [ ] JWT Authentication
- [ ] Middleware de autorización
- [ ] Refresh tokens
- [ ] Password hashing con bcrypt

### **Fase 3: Operaciones Masivas**
- [ ] Importación CSV/Excel
- [ ] Exportación de datos
- [ ] Operaciones bulk (crear, actualizar, eliminar)
- [ ] Validación masiva

### **Fase 4: Frontend Angular**
- [ ] Angular 20 con TypeScript
- [ ] Angular Material UI
- [ ] Reactive Forms con validaciones
- [ ] Interceptores HTTP
- [ ] Guards de autenticación

### **Fase 5: Funcionalidades Avanzadas**
- [ ] Notificaciones en tiempo real
- [ ] Reportes y dashboards
- [ ] Gestión de archivos
- [ ] Auditoría detallada
- [ ] API rate limiting avanzado

---

## 🛡️ Seguridad Implementada

- ✅ **Helmet** para headers de seguridad
- ✅ **CORS** configurado correctamente
- ✅ **Rate limiting** para prevenir abuso
- ✅ **Validación de entrada** con class-validator
- ✅ **Sanitización** de datos
- ✅ **Soft delete** para preservar datos
- ✅ **Logging** de operaciones
- ✅ **Manejo de errores** estandarizado

---

## 📝 Documentación

- **[API Documentation](backend/API_DOCUMENTATION.md)** - Documentación completa de endpoints
- **[Test API](backend/test-api.http)** - Archivo de pruebas HTTP
- **[Prisma Schema](backend/prisma/schema.prisma)** - Esquema de base de datos

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

---

## 🎯 Estado del Proyecto

### ✅ **Completado (Fase 1)**
- [x] Arquitectura base robusta
- [x] CRUD completo de personas
- [x] Sistema de roles y permisos
- [x] Gestión residencial básica
- [x] Validaciones y manejo de errores
- [x] Datos de prueba
- [x] Documentación completa
- [x] Testing básico

### 🚧 **En Desarrollo**
- [ ] Autenticación JWT
- [ ] Operaciones masivas
- [ ] Frontend Angular

### 📋 **Planificado**
- [ ] Notificaciones
- [ ] Reportes avanzados
- [ ] Gestión de archivos
- [ ] Auditoría detallada

---

## 📞 Contacto

- **GitHub**: [mzrivic](https://github.com/mzrivic)
- **Proyecto**: [Residential Admin](https://github.com/mzrivic/residential_admin)

---

**¡El sistema está listo para desarrollo y testing! 🎉** 