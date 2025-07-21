import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import personRoutes from './modules/person/interface/routes/person.routes';
import authRoutes from './modules/auth/interface/routes/auth.routes';
import roleRoutes from './modules/role/interface/routes/role.routes';
import permissionRoutes from './modules/permission/interface/routes/permission.routes';
import auditRoutes from './modules/audit/interface/routes/audit.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas requests desde esta IP',
    meta: {
      timestamp: new Date().toISOString(),
      operation: 'RATE_LIMIT',
      version: '1.0.0',
      requestId: 'rate-limit'
    }
  }
});
app.use(limiter);

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para agregar requestId
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(7);
  next();
});

// Rutas de la API
app.use('/api/v1/persons', personRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/audit', auditRoutes);

// Log global para depuración de importación masiva
app.post('/api/v1/persons/import', (req, res, next) => {
  console.log('Llamada recibida a /api/v1/persons/import');
  next();
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    },
    meta: {
      timestamp: new Date().toISOString(),
      operation: 'HEALTH_CHECK',
      version: '1.0.0',
      requestId: req.requestId
    }
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de Gestión Residencial',
    data: {
      name: 'Residential Admin API',
      version: '1.0.0',
      description: 'API para gestión de personas, roles y unidades residenciales',
      endpoints: {
        persons: '/api/v1/persons',
        auth: '/api/v1/auth',
        roles: '/api/v1/roles',
        permissions: '/api/v1/permissions',
        audit: '/api/v1/audit',
        health: '/health'
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      operation: 'ROOT',
      version: '1.0.0',
      requestId: req.requestId
    }
  });
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    meta: {
      timestamp: new Date().toISOString(),
      operation: 'ERROR',
      version: '1.0.0',
      requestId: req.requestId
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    data: {
      path: req.originalUrl,
      method: req.method
    },
    meta: {
      timestamp: new Date().toISOString(),
      operation: 'NOT_FOUND',
      version: '1.0.0',
      requestId: req.requestId
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
  console.log(`👥 Personas API: http://localhost:${PORT}/api/v1/persons`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
  console.log(`👤 Roles API: http://localhost:${PORT}/api/v1/roles`);
  console.log(`🔑 Permissions API: http://localhost:${PORT}/api/v1/permissions`);
  console.log(`📝 Audit API: http://localhost:${PORT}/api/v1/audit`);
});

export default app; 