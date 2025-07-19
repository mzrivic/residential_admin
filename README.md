# 🏢 Sistema de Administración Residencial

Sistema completo de administración para unidades residenciales, desarrollado con tecnologías modernas y arquitectura escalable.

## 🚀 Tecnologías

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** para PostgreSQL
- **JWT** para autenticación
- **Clean Architecture** por módulos

### Base de Datos
- **PostgreSQL** con mejoras de:
  - Soft Delete (`deleted_at`)
  - Auditoría (`created_by`, `updated_by`)
  - Índices secundarios para optimización

### Frontend (Próximamente)
- **Angular v20** + **TypeScript**

## 📁 Estructura del Proyecto

```
residential_admin/
├── backend/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── modules/           # Módulos por dominio
│   │   ├── config/            # Configuración
│   │   ├── shared/            # Utilidades compartidas
│   │   └── app.ts             # Aplicación Express
│   ├── prisma/
│   │   └── schema.prisma      # Modelo de datos
│   └── package.json
├── frontend/                   # Frontend Angular (próximamente)
├── residential_schema_with_improvements.sql  # Esquema SQL mejorado
├── entity.txt                  # Documentación de entidades
└── README.md
```

## 🗄️ Modelos de Datos

### Principales
- **Person**: Personas (residentes, visitantes, etc.)
- **ResidentialUnit**: Unidades residenciales
- **Tower**: Torres/bloques
- **Apartment**: Apartamentos
- **Role**: Roles del sistema
- **Permission**: Permisos
- **Vehicle**: Vehículos
- **Parking**: Parqueaderos
- **CommonArea**: Áreas comunes

### Características
- ✅ Soft Delete (campo `deleted_at`)
- ✅ Auditoría (campos `created_by`, `updated_by`)
- ✅ Índices optimizados para búsquedas frecuentes
- ✅ Relaciones bien definidas
- ✅ Claves compuestas donde corresponde

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18+)
- PostgreSQL
- Git

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd residential_admin
```

### 2. Configurar Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb residential_management

# Ejecutar esquema mejorado
psql -U tu_usuario -d residential_management -f residential_schema_with_improvements.sql
```

### 3. Configurar Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# Sincronizar Prisma
npx prisma db pull
npx prisma generate
```

### 4. Ejecutar Backend
```bash
npm run dev
```

## 🔧 Comandos Útiles

### Prisma
```bash
# Generar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Resetear base de datos
npx prisma migrate reset

# Crear migración
npx prisma migrate dev --name nombre_migracion
```

### Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Build para producción
npm run build
```

## 📊 Características del Sistema

### Gestión de Personas
- Registro de residentes, visitantes y personal
- Múltiples emails y teléfonos por persona
- Roles dinámicos con fechas de vigencia
- Vehículos asociados

### Gestión de Propiedades
- Unidades residenciales con información completa
- Torres y pisos organizados jerárquicamente
- Apartamentos con estados de ocupación y propiedad
- Parqueaderos asignados

### Control de Acceso
- Sistema de roles y permisos
- Auditoría completa de cambios
- Soft delete para mantener historial

### Áreas Comunes
- Gestión de espacios compartidos
- Reservas y horarios
- Capacidad y ubicación

## 🔒 Seguridad

- Autenticación JWT
- Soft delete para mantener integridad de datos
- Auditoría completa de cambios
- Validación de datos en todos los endpoints

## 🚀 Próximas Características

- [ ] Frontend con Angular 20
- [ ] API REST completa
- [ ] Sistema de notificaciones
- [ ] Reportes y estadísticas
- [ ] Dashboard administrativo
- [ ] Aplicación móvil

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para la administración residencial moderna** 