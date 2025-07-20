# 🔐 Documentación del Sistema de Login - Residential Admin

## 📋 Índice
1. [Configuración del Backend](#configuración-del-backend)
2. [Configuración del Frontend](#configuración-del-frontend)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [Manejo de Errores](#manejo-de-errores)
5. [Sistema de Bloqueo](#sistema-de-bloqueo)
6. [Interfaz de Usuario](#interfaz-de-usuario)
7. [Casos de Prueba](#casos-de-prueba)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Configuración del Backend

### **Archivos Principales:**
- `backend/src/modules/auth/application/services/auth.service.ts`
- `backend/src/modules/auth/infrastructure/controllers/auth.controller.ts`
- `backend/src/modules/auth/application/dto/auth.dto.ts`

### **Dependencias:**
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "crypto": "^1.0.1"
}
```

### **Configuración de Seguridad:**
- **Intentos máximos:** 5 intentos fallidos
- **Tiempo de bloqueo:** 15 minutos
- **Hash de contraseña:** bcrypt con salt rounds 12
- **Tokens JWT:** 1 hora de expiración
- **Refresh tokens:** 7 días (normal) / 30 días (recordar sesión)

---

## 🎨 Configuración del Frontend

### **Archivos Principales:**
- `frontend/src/app/app/modules/auth/login/login.ts`
- `frontend/src/app/app/modules/auth/login/login.html`
- `frontend/src/app/core/auth/auth/auth.ts`

### **Dependencias:**
```json
{
  "@angular/core": "^20.0.0",
  "@angular/forms": "^20.0.0",
  "@angular/router": "^20.0.0",
  "tailwindcss": "^3.4.0"
}
```

### **Características de la UI:**
- **Tema oscuro/claro** con transición suave
- **Efecto glass** en el contenedor principal
- **Botón de ayuda WhatsApp** con nombre
- **Alertas centradas** con auto-ocultar
- **Responsive design** para móviles y desktop

---

## 🔄 Flujo de Autenticación

### **1. Inicio de Sesión:**
```
Usuario → Frontend → Backend → Base de Datos
```

### **2. Validación de Credenciales:**
1. **Buscar usuario** por username o email
2. **Verificar si está bloqueado**
3. **Comparar contraseña** con hash bcrypt
4. **Incrementar intentos** si falla
5. **Generar tokens** si es exitoso

### **3. Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Juan Carlos Pérez",
      "username": "admin",
      "email": "admin@residential.com",
      "status": "ACTIVE",
      "roles": [...]
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "abc123...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

---

## ❌ Manejo de Errores

### **Códigos de Estado HTTP:**
- **401 Unauthorized:** Credenciales incorrectas o cuenta bloqueada
- **404 Not Found:** Usuario no encontrado
- **400 Bad Request:** Datos de entrada inválidos
- **500 Internal Server Error:** Error del servidor

### **Mensajes de Error:**
```typescript
// Errores de autenticación (401)
"Usuario no encontrado"
"Contraseña incorrecta"
"Cuenta temporalmente bloqueada. Intenta de nuevo en 15 minutos."
"Contraseña no configurada"

// Errores de validación (400)
"Datos de entrada inválidos"
"El nombre de usuario ya está en uso"
"El email ya está registrado"

// Errores de conexión
"No se puede conectar con el servidor. Verifica tu conexión a internet."
"La solicitud tardó demasiado. Verifica tu conexión."
"Demasiados intentos. Espera un momento antes de intentar de nuevo."
```

---

## 🔒 Sistema de Bloqueo

### **Configuración:**
- **Umbral:** 5 intentos fallidos
- **Duración:** 15 minutos
- **Reset:** Después de login exitoso

### **Lógica del Backend:**
```typescript
// En auth.service.ts
if (!isValidPassword) {
  await prisma.person.update({
    where: { id: user.id },
    data: {
      login_attempts: user.login_attempts + 1,
      locked_until: user.login_attempts >= 4 ? 
        new Date(Date.now() + 15 * 60 * 1000) : null
    }
  });
  throw new InvalidPasswordError();
}
```

### **Verificación de Bloqueo:**
```typescript
// Verificar si la cuenta está bloqueada
if (user.locked_until && user.locked_until > new Date()) {
  throw new AccountLockedError();
}
```

---

## 🎨 Interfaz de Usuario

### **Características Visuales:**
- **Tema oscuro/claro** con icono de luna/sol
- **Transición suave** al cambiar tema
- **Efecto glass** en contenedor principal
- **Botón WhatsApp** con nombre "Ayuda WhatsApp"
- **Alertas centradas** sobre el formulario
- **Auto-ocultar** alertas después de 3-4 segundos

### **Responsive Design:**
- **Desktop:** Layout de dos columnas (hero + formulario)
- **Móvil:** Layout de una columna apilada
- **Tablet:** Layout adaptativo

### **Estados de la UI:**
- **Loading:** Spinner durante login
- **Error:** Alerta roja con mensaje
- **Success:** Alerta verde con mensaje de bienvenida
- **Disabled:** Formulario deshabilitado durante loading

---

## 🧪 Casos de Prueba

### **1. Login Exitoso:**
```
Usuario: admin
Contraseña: admin123
Resultado: ✅ Redirección al dashboard
```

### **2. Credenciales Incorrectas:**
```
Usuario: admin
Contraseña: wrongpassword
Resultado: ❌ "Contraseña incorrecta"
```

### **3. Usuario No Encontrado:**
```
Usuario: inexistente
Contraseña: cualquier
Resultado: ❌ "Usuario no encontrado"
```

### **4. Bloqueo de Cuenta:**
```
1. Intentar login 5 veces con contraseña incorrecta
2. En el 6to intento: ❌ "Cuenta temporalmente bloqueada"
3. Esperar 15 minutos
4. Intentar de nuevo: ✅ Login exitoso
```

### **5. Validación de Campos:**
```
Usuario: "" (vacío)
Contraseña: "" (vacío)
Resultado: ❌ "El usuario es obligatorio" / "La contraseña es obligatoria"
```

### **6. Conexión Perdida:**
```
Desconectar internet
Intentar login
Resultado: ❌ "No se puede conectar con el servidor"
```

---

## 🔧 Troubleshooting

### **Problemas Comunes:**

#### **1. Error de Compilación TypeScript:**
```bash
# Solución: Limpiar cache y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### **2. Backend No Inicia:**
```bash
# Verificar puerto disponible
netstat -ano | findstr :3000

# Cambiar puerto en .env
PORT=3001
```

#### **3. Frontend No Compila:**
```bash
# Verificar Angular CLI
ng version

# Limpiar cache
ng cache clean
```

#### **4. Errores de CORS:**
```typescript
// En backend/app.ts
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

#### **5. Tokens No Se Guardan:**
```typescript
// Verificar localStorage
localStorage.setItem('access_token', token);
localStorage.setItem('user', JSON.stringify(user));
```

---

## 📊 Métricas y Monitoreo

### **Logs del Backend:**
```typescript
// Logs de autenticación
console.log(`Login attempt for user: ${username}`);
console.log(`Login successful for user: ${username}`);
console.log(`Account locked for user: ${username}`);
```

### **Métricas a Monitorear:**
- **Intentos de login fallidos**
- **Cuentas bloqueadas**
- **Tiempo de respuesta del API**
- **Errores de autenticación**

---

## 🔐 Seguridad

### **Mejores Prácticas Implementadas:**
- ✅ **Hash de contraseñas** con bcrypt
- ✅ **Rate limiting** por intentos fallidos
- ✅ **Tokens JWT** con expiración
- ✅ **Validación de entrada** en frontend y backend
- ✅ **Sanitización de datos**
- ✅ **Logs de auditoría**

### **Recomendaciones Adicionales:**
- 🔒 **Implementar 2FA** (autenticación de dos factores)
- 🔒 **Logs de seguridad** más detallados
- 🔒 **Notificaciones** por email en intentos sospechosos
- 🔒 **IP blocking** para ataques de fuerza bruta

---

## 🚀 Próximos Pasos

### **Funcionalidades Pendientes:**
1. **Recuperación de contraseña** por email
2. **Verificación de email** en registro
3. **Autenticación de dos factores**
4. **Sesiones múltiples** con gestión
5. **Logout automático** por inactividad

### **Mejoras de UX:**
1. **Animaciones** más suaves
2. **Progreso visual** del bloqueo
3. **Recordatorio** de contraseña
4. **Autocompletado** de credenciales

---

## 📝 Notas de Desarrollo

### **Comandos Útiles:**

#### **Backend:**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Base de datos
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

#### **Frontend:**
```bash
# Desarrollo
ng serve

# Producción
ng build --configuration production

# Testing
ng test
```

### **Variables de Entorno:**
```env
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="tu_jwt_secret_aqui"
PORT=3000

# Frontend (environment.ts)
apiUrl: 'http://localhost:3000/api/v1'
```

---

## ✅ Checklist de Implementación

- [x] **Backend auth service** con login/logout
- [x] **Frontend login component** con UI moderna
- [x] **Sistema de bloqueo** por intentos fallidos
- [x] **Manejo de errores** completo
- [x] **Tema oscuro/claro** con transiciones
- [x] **Alertas centradas** con auto-ocultar
- [x] **Responsive design** para móviles
- [x] **Validación de formularios**
- [x] **Integración con API** completa
- [x] **Documentación** del sistema

---

**🎉 El sistema de login está completamente implementado y documentado!**

**Próximo paso:** Desarrollo del Dashboard principal. 