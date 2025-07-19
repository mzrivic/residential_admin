const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed simple de la base de datos...');

  try {
    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.person.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        full_name: 'Administrador del Sistema',
        username: 'admin',
        password_hash: hashedPassword,
        document_type: 'CC',
        document_number: '123456789',
        gender: 'M',
        is_active: true,
        status: 'ACTIVE',
        language: 'es',
        timezone: 'America/Bogota',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Usuario administrador creado:', adminUser.username);

    // Crear permisos básicos
    console.log('📝 Creando permisos básicos...');
    
    const permissions = [
      { code: 'person:create', description: 'Crear personas' },
      { code: 'person:read', description: 'Leer personas' },
      { code: 'person:update', description: 'Actualizar personas' },
      { code: 'person:delete', description: 'Eliminar personas' },
      { code: 'role:create', description: 'Crear roles' },
      { code: 'role:read', description: 'Leer roles' },
      { code: 'role:update', description: 'Actualizar roles' },
      { code: 'role:delete', description: 'Eliminar roles' },
      { code: 'permission:create', description: 'Crear permisos' },
      { code: 'permission:read', description: 'Leer permisos' },
      { code: 'permission:update', description: 'Actualizar permisos' },
      { code: 'permission:delete', description: 'Eliminar permisos' },
      { code: 'audit:read', description: 'Leer auditoría' },
      { code: 'audit:export', description: 'Exportar auditoría' },
      { code: 'audit:clean', description: 'Limpiar auditoría' }
    ];

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { code: perm.code },
        update: {},
        create: {
          code: perm.code,
          description: perm.description,
          is_active: true
        }
      });
    }

    console.log(`✅ ${permissions.length} permisos creados`);

    // Crear roles básicos
    console.log('👤 Creando roles básicos...');
    
    const adminRole = await prisma.role.upsert({
      where: { id: 1 },
      update: {},
              create: {
          id: 1,
          name: 'Administrador',
          description: 'Rol con acceso completo al sistema',
          alias: 'admin',
          is_active: true
        }
    });

    const userRole = await prisma.role.upsert({
      where: { id: 2 },
      update: {},
              create: {
          id: 2,
          name: 'Usuario',
          description: 'Rol de usuario básico',
          alias: 'user',
          is_active: true
        }
    });

    const securityRole = await prisma.role.upsert({
      where: { id: 3 },
      update: {},
              create: {
          id: 3,
          name: 'Seguridad',
          description: 'Rol para personal de seguridad',
          alias: 'security',
          is_active: true
        }
    });

    console.log('✅ Roles creados');

    // Asignar todos los permisos al rol administrador
    console.log('🔗 Asignando permisos al administrador...');
    
    for (const perm of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: perm.code }
      });
      
      if (permission) {
        await prisma.role_permission.upsert({
          where: { id: 1 }, // Usar ID fijo para evitar conflictos
          update: {},
          create: {
            role_id: adminRole.id,
            permission_id: permission.id,
            is_active: true
          }
        });
      }
    }

    // Asignar rol de administrador al usuario admin
    console.log('🔗 Asignando rol de administrador...');
    
    await prisma.person_role.upsert({
      where: { id: 1 },
      update: {},
      create: {
        person_id: adminUser.id,
        role_id: adminRole.id,
        is_active: true,
        from_date: new Date()
      }
    });

    console.log('✅ Seed completado exitosamente!');
    console.log('👤 Usuario admin creado: admin / admin123');
    console.log('🔑 Token de acceso disponible para pruebas');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 