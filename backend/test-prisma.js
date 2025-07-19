const { PrismaClient } = require('./generated/prisma');

console.log('Testing Prisma client import...');

try {
  const prisma = new PrismaClient();
  console.log('✅ Prisma client created successfully');
  
  // Test connection
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection successful');
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('✅ Disconnected successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Prisma client creation failed:', error);
  process.exit(1);
} 