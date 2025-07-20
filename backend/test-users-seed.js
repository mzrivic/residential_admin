const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Agregando usuarios de prueba adicionales...');

  try {
    // Crear usuarios de prueba
    const testUsers = [
      {
        full_name: 'Juan Pérez',
        username: 'juan.perez',
        password: 'user123',
        document_type: 'CC',
        document_number: '987654321',
        gender: 'M',
        role: 'Usuario'
      },
      {
        full_name: 'María García',
        username: 'maria.garcia',
        password: 'user123',
        document_type: 'CC',
        document_number: '456789123',
        gender: 'F',
        role: 'Usuario'
      },
      {
        full_name: 'Carlos López',
        username: 'carlos.lopez',
        password: 'security123',
        document_type: 'CC',
        document_number: '789123456',
        gender: 'M',
        role: 'Seguridad'
      },
      {
        full_name: 'Ana Rodríguez',
        username: 'ana.rodriguez',
        password: 'security123',
        document_type: 'CC',
        document_number: '321654987',
        gender: 'F',
        role: 'Seguridad'
      }
    ];

    for (const userData of testUsers) {
      console.log(`👤 Creando usuario: ${userData.username}`);
      
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await prisma.person.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          full_name: userData.full_name,
          username: userData.username,
          password_hash: hashedPassword,
          document_type: userData.document_type,
          document_number: userData.document_number,
          gender: userData.gender,
          is_active: true,
          status: 'ACTIVE',
          language: 'es',
          timezone: 'America/Bogota',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Buscar el rol correspondiente
      const role = await prisma.role.findFirst({
        where: { name: userData.role }
      });

      if (role) {
        // Asignar rol al usuario
        await prisma.person_role.upsert({
          where: { 
            id: user.id * 100 + role.id // Crear un ID único
          },
          update: {},
          create: {
            person_id: user.id,
            role_id: role.id,
            is_active: true,
            from_date: new Date()
          }
        });

        console.log(`✅ Usuario ${userData.username} creado con rol ${userData.role}`);
      }
    }

    console.log('🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('👤 Admin: admin / admin123');
    console.log('👤 Juan: juan.perez / user123');
    console.log('👤 María: maria.garcia / user123');
    console.log('👤 Carlos: carlos.lopez / security123');
    console.log('👤 Ana: ana.rodriguez / security123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 