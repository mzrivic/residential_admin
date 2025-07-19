import { PrismaClient } from '@prisma/client';

// Configuración de Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Middleware para logging de queries
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }
  
  return result;
});

// Middleware para auditoría automática
prisma.$use(async (params, next) => {
  // Solo para operaciones de escritura
  if (['create', 'update', 'delete'].includes(params.action)) {
    // Aquí se puede agregar lógica de auditoría automática
    console.log(`Audit: ${params.model}.${params.action}`, {
      timestamp: new Date().toISOString(),
      operation: params.action,
      model: params.model,
      args: params.args
    });
  }
  
  return next(params);
});

export default prisma; 