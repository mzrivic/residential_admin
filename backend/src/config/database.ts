import { PrismaClient } from '../../generated/prisma';

// Configuración simple de Prisma Client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export default prisma; 