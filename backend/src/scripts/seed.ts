import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...');
  await prisma.person_image.deleteMany();
  await prisma.person_phone.deleteMany();
  await prisma.person_email.deleteMany();
  await prisma.person_role.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.person.deleteMany();
  await prisma.role.deleteMany();
  await prisma.residential_unit.deleteMany();
  await prisma.apartment.deleteMany();

  // Crear unidades residenciales
  console.log('🏢 Creando unidades residenciales...');
  const residentialUnits = await Promise.all([
    prisma.residential_unit.create({
      data: {
        name: 'Torre A',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        postal_code: '110111',
        total_apartments: 50,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.residential_unit.create({
      data: {
        name: 'Torre B',
        address: 'Calle 124 #46-68',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        postal_code: '110112',
        total_apartments: 40,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  ]);

  // Crear apartamentos
  console.log('🏠 Creando apartamentos...');
  const apartments = [];
  for (let i = 1; i <= 10; i++) {
    apartments.push(
      await prisma.apartment.create({
        data: {
          number: `A${i.toString().padStart(2, '0')}`,
          floor: Math.ceil(i / 2),
          residential_unit_id: residentialUnits[0].id,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    );
  }

  for (let i = 1; i <= 8; i++) {
    apartments.push(
      await prisma.apartment.create({
        data: {
          number: `B${i.toString().padStart(2, '0')}`,
          floor: Math.ceil(i / 2),
          residential_unit_id: residentialUnits[1].id,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    );
  }

  // Crear roles
  console.log('👥 Creando roles...');
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Administrador',
        description: 'Administrador del conjunto residencial',
        permissions: ['READ', 'WRITE', 'DELETE', 'MANAGE_USERS'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.role.create({
      data: {
        name: 'Propietario',
        description: 'Propietario de apartamento',
        permissions: ['READ', 'WRITE'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.role.create({
      data: {
        name: 'Inquilino',
        description: 'Inquilino de apartamento',
        permissions: ['READ'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.role.create({
      data: {
        name: 'Visitante',
        description: 'Visitante temporal',
        permissions: ['READ'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  ]);

  // Crear personas
  console.log('👤 Creando personas...');
  const persons = await Promise.all([
    // Administrador
    prisma.person.create({
      data: {
        document_type: 'CC',
        document_number: '12345678',
        full_name: 'Juan Carlos Pérez González',
        gender: 'M',
        photo_url: 'https://via.placeholder.com/150/007bff/ffffff?text=JC',
        birth_date: new Date('1985-03-15'),
        notes: 'Administrador principal del conjunto',
        alias: 'Juan',
        is_active: true,
        username: 'admin',
        password_hash: 'admin123',
        language: 'es',
        timezone: 'America/Bogota',
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Propietario 1
    prisma.person.create({
      data: {
        document_type: 'CC',
        document_number: '87654321',
        full_name: 'María Elena Rodríguez López',
        gender: 'F',
        photo_url: 'https://via.placeholder.com/150/28a745/ffffff?text=ME',
        birth_date: new Date('1978-07-22'),
        notes: 'Propietaria del apartamento A01',
        alias: 'María',
        is_active: true,
        language: 'es',
        timezone: 'America/Bogota',
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Propietario 2
    prisma.person.create({
      data: {
        document_type: 'CC',
        document_number: '11223344',
        full_name: 'Carlos Alberto Martínez Silva',
        gender: 'M',
        photo_url: 'https://via.placeholder.com/150/ffc107/000000?text=CA',
        birth_date: new Date('1982-11-08'),
        notes: 'Propietario del apartamento A02',
        alias: 'Carlos',
        is_active: true,
        language: 'es',
        timezone: 'America/Bogota',
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Inquilino 1
    prisma.person.create({
      data: {
        document_type: 'CC',
        document_number: '55667788',
        full_name: 'Ana Sofía García Mendoza',
        gender: 'F',
        photo_url: 'https://via.placeholder.com/150/dc3545/ffffff?text=AS',
        birth_date: new Date('1990-04-12'),
        notes: 'Inquilina del apartamento A03',
        alias: 'Ana',
        is_active: true,
        language: 'es',
        timezone: 'America/Bogota',
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Inquilino 2
    prisma.person.create({
      data: {
        document_type: 'CC',
        document_number: '99887766',
        full_name: 'Luis Fernando Herrera Castro',
        gender: 'M',
        photo_url: 'https://via.placeholder.com/150/6f42c1/ffffff?text=LF',
        birth_date: new Date('1988-09-30'),
        notes: 'Inquilino del apartamento B01',
        alias: 'Luis',
        is_active: true,
        language: 'es',
        timezone: 'America/Bogota',
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Visitante 1
    prisma.person.create({
      data: {
        document_type: 'CC',
        document_number: '33445566',
        full_name: 'Patricia Isabel Vargas Ruiz',
        gender: 'F',
        photo_url: 'https://via.placeholder.com/150/17a2b8/ffffff?text=PI',
        birth_date: new Date('1995-12-03'),
        notes: 'Visitante frecuente del apartamento A01',
        alias: 'Patricia',
        is_active: true,
        language: 'es',
        timezone: 'America/Bogota',
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  ]);

  // Crear emails para las personas
  console.log('📧 Creando emails...');
  await Promise.all([
    prisma.person_email.create({
      data: {
        person_id: persons[0].id,
        email: 'admin@residential.com'
      }
    }),
    prisma.person_email.create({
      data: {
        person_id: persons[1].id,
        email: 'maria.rodriguez@email.com'
      }
    }),
    prisma.person_email.create({
      data: {
        person_id: persons[2].id,
        email: 'carlos.martinez@email.com'
      }
    }),
    prisma.person_email.create({
      data: {
        person_id: persons[3].id,
        email: 'ana.garcia@email.com'
      }
    }),
    prisma.person_email.create({
      data: {
        person_id: persons[4].id,
        email: 'luis.herrera@email.com'
      }
    }),
    prisma.person_email.create({
      data: {
        person_id: persons[5].id,
        email: 'patricia.vargas@email.com'
      }
    })
  ]);

  // Crear teléfonos para las personas
  console.log('📱 Creando teléfonos...');
  await Promise.all([
    prisma.person_phone.create({
      data: {
        person_id: persons[0].id,
        phone: '+57 300 123 4567'
      }
    }),
    prisma.person_phone.create({
      data: {
        person_id: persons[1].id,
        phone: '+57 310 987 6543'
      }
    }),
    prisma.person_phone.create({
      data: {
        person_id: persons[2].id,
        phone: '+57 315 456 7890'
      }
    }),
    prisma.person_phone.create({
      data: {
        person_id: persons[3].id,
        phone: '+57 320 111 2222'
      }
    }),
    prisma.person_phone.create({
      data: {
        person_id: persons[4].id,
        phone: '+57 325 333 4444'
      }
    }),
    prisma.person_phone.create({
      data: {
        person_id: persons[5].id,
        phone: '+57 330 555 6666'
      }
    })
  ]);

  // Crear imágenes adicionales
  console.log('🖼️ Creando imágenes...');
  await Promise.all([
    prisma.person_image.create({
      data: {
        person_id: persons[0].id,
        image_url: 'https://via.placeholder.com/300x400/007bff/ffffff?text=Admin+Photo'
      }
    }),
    prisma.person_image.create({
      data: {
        person_id: persons[1].id,
        image_url: 'https://via.placeholder.com/300x400/28a745/ffffff?text=Maria+Photo'
      }
    })
  ]);

  // Asignar roles a las personas
  console.log('🎭 Asignando roles...');
  await Promise.all([
    // Administrador
    prisma.person_role.create({
      data: {
        person_id: persons[0].id,
        role_id: roles[0].id,
        residential_unit_id: residentialUnits[0].id,
        apartment_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Propietario 1
    prisma.person_role.create({
      data: {
        person_id: persons[1].id,
        role_id: roles[1].id,
        residential_unit_id: residentialUnits[0].id,
        apartment_id: apartments[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Propietario 2
    prisma.person_role.create({
      data: {
        person_id: persons[2].id,
        role_id: roles[1].id,
        residential_unit_id: residentialUnits[0].id,
        apartment_id: apartments[1].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Inquilino 1
    prisma.person_role.create({
      data: {
        person_id: persons[3].id,
        role_id: roles[2].id,
        residential_unit_id: residentialUnits[0].id,
        apartment_id: apartments[2].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Inquilino 2
    prisma.person_role.create({
      data: {
        person_id: persons[4].id,
        role_id: roles[2].id,
        residential_unit_id: residentialUnits[1].id,
        apartment_id: apartments[10].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    // Visitante 1
    prisma.person_role.create({
      data: {
        person_id: persons[5].id,
        role_id: roles[3].id,
        residential_unit_id: residentialUnits[0].id,
        apartment_id: apartments[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  ]);

  // Crear vehículos
  console.log('🚗 Creando vehículos...');
  await Promise.all([
    prisma.vehicle.create({
      data: {
        person_id: persons[1].id,
        license_plate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Blanco',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.vehicle.create({
      data: {
        person_id: persons[2].id,
        license_plate: 'XYZ789',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        color: 'Negro',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.vehicle.create({
      data: {
        person_id: persons[4].id,
        license_plate: 'DEF456',
        brand: 'Ford',
        model: 'Focus',
        year: 2021,
        color: 'Azul',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  ]);

  console.log('✅ Seed completado exitosamente!');
  console.log(`📊 Datos creados:`);
  console.log(`   - ${residentialUnits.length} unidades residenciales`);
  console.log(`   - ${apartments.length} apartamentos`);
  console.log(`   - ${roles.length} roles`);
  console.log(`   - ${persons.length} personas`);
  console.log(`   - Emails, teléfonos e imágenes asociadas`);
  console.log(`   - Roles asignados`);
  console.log(`   - Vehículos registrados`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 