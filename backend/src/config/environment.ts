import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/residential_admin?schema=public'
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Server
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200'
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },

  // Audit
  audit: {
    retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90'),
    maxSize: parseInt(process.env.AUDIT_LOG_MAX_SIZE || '1000')
  },

  // Email (for future use)
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },

  // Redis (for future use)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  }
};

// Validar configuración crítica
export function validateConfig() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (config.jwt.secret === 'default-secret-change-in-production') {
    console.warn('⚠️  Warning: Using default JWT secret. Change JWT_SECRET in production!');
  }

  if (config.server.nodeEnv === 'production' && config.jwt.secret === 'default-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
}

// Exportar configuración por defecto
export default config; 