import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear permisos básicos
  console.log('📝 Creando permisos...');
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: 'person:create' },
      update: {},
      create: {
        code: 'person:create',
        description: 'Crear personas'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'person:read' },
      update: {},
      create: {
        code: 'person:read',
        description: 'Leer personas'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'person:update' },
      update: {},
      create: {
        code: 'person:update',
        description: 'Actualizar personas'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'person:delete' },
      update: {},
      create: {
        code: 'person:delete',
        description: 'Eliminar personas'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'role:create' },
      update: {},
      create: {
        code: 'role:create',
        description: 'Crear roles'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'role:read' },
      update: {},
      create: {
        code: 'role:read',
        description: 'Leer roles'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'role:update' },
      update: {},
      create: {
        code: 'role:update',
        description: 'Actualizar roles'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'role:delete' },
      update: {},
      create: {
        code: 'role:delete',
        description: 'Eliminar roles'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'permission:create' },
      update: {},
      create: {
        code: 'permission:create',
        description: 'Crear permisos'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'permission:read' },
      update: {},
      create: {
        code: 'permission:read',
        description: 'Leer permisos'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'permission:update' },
      update: {},
      create: {
        code: 'permission:update',
        description: 'Actualizar permisos'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'permission:delete' },
      update: {},
      create: {
        code: 'permission:delete',
        description: 'Eliminar permisos'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'audit:read' },
      update: {},
      create: {
        code: 'audit:read',
        description: 'Leer auditoría'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'audit:export' },
      update: {},
      create: {
        code: 'audit:export',
        description: 'Exportar auditoría'
      }
    }),
    prisma.permission.upsert({
      where: { code: 'audit:clean' },
      update: {},
      create: {
        code: 'audit:clean',
        description: 'Limpiar auditoría'
      }
    })
  ]);

  console.log(`✅ ${permissions.length} permisos creados`);

  // Crear roles básicos
  console.log('👤 Creando roles...');
  const adminRole = await prisma.role.upsert({
    where: { alias: 'admin' },
    update: {},
    create: {
      name: 'Administrador',
      description: 'Rol con acceso completo al sistema',
      alias: 'admin'
    }
  });

  const userRole = await prisma.role.upsert({
    where: { alias: 'user' },
    update: {},
    create: {
      name: 'Usuario',
      description: 'Rol de usuario básico',
      alias: 'user'
    }
  });

  const securityRole = await prisma.role.upsert({
    where: { alias: 'security' },
    update: {},
    create: {
      name: 'Seguridad',
      description: 'Rol para personal de seguridad',
      alias: 'security'
    }
  });

  console.log('✅ Roles creados');

  // Asignar permisos a roles
  console.log('🔗 Asignando permisos a roles...');
  
  // Administrador - todos los permisos
  await Promise.all(
    permissions.map(permission =>
      prisma.role_permission.upsert({
        where: {
          role_id_permission_id: {
            role_id: adminRole.id,
            permission_id: permission.id
          }
        },
        update: {},
        create: {
          role_id: adminRole.id,
          permission_id: permission.id
        }
      })
    )
  );

  // Usuario - permisos básicos
  const userPermissions = permissions.filter(p => 
    ['person:read', 'person:update'].includes(p.code)
  );
  await Promise.all(
    userPermissions.map(permission =>
      prisma.role_permission.upsert({
        where: {
          role_id_permission_id: {
            role_id: userRole.id,
            permission_id: permission.id
          }
        },
        update: {},
        create: {
          role_id: userRole.id,
          permission_id: permission.id
        }
      })
    )
  );

  // Seguridad - permisos de lectura y auditoría
  const securityPermissions = permissions.filter(p => 
    ['person:read', 'audit:read'].includes(p.code)
  );
  await Promise.all(
    securityPermissions.map(permission =>
      prisma.role_permission.upsert({
        where: {
          role_id_permission_id: {
            role_id: securityRole.id,
            permission_id: permission.id
          }
        },
        update: {},
        create: {
          role_id: securityRole.id,
          permission_id: permission.id
        }
      })
    )
  );

  console.log('✅ Permisos asignados a roles');

  // Crear usuarios de prueba
  console.log('👥 Creando usuarios de prueba...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.person.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      full_name: 'Administrador del Sistema',
      username: 'admin',
      password_hash: hashedPassword,
      document_type: 'CC',
      document_number: '12345678',
      status: 'ACTIVE',
      email_verified: true,
      phone_verified: true,
      document_verified: true,
      person_email: {
        create: {
          email: 'admin@residential.com'
        }
      },
      person_phone: {
        create: {
          phone: '+573001234567'
        }
      }
    }
  });

  const regularUser = await prisma.person.upsert({
    where: { username: 'usuario' },
    update: {},
    create: {
      full_name: 'Usuario Regular',
      username: 'usuario',
      password_hash: hashedPassword,
      document_type: 'CC',
      document_number: '87654321',
      status: 'ACTIVE',
      email_verified: true,
      person_email: {
        create: {
          email: 'usuario@residential.com'
        }
      },
      person_phone: {
        create: {
          phone: '+573007654321'
        }
      }
    }
  });

  const securityUser = await prisma.person.upsert({
    where: { username: 'seguridad' },
    update: {},
    create: {
      full_name: 'Guardia de Seguridad',
      username: 'seguridad',
      password_hash: hashedPassword,
      document_type: 'CC',
      document_number: '11223344',
      status: 'ACTIVE',
      email_verified: true,
      person_email: {
        create: {
          email: 'seguridad@residential.com'
        }
      },
      person_phone: {
        create: {
          phone: '+573004433221'
        }
      }
    }
  });

  console.log('✅ Usuarios creados');

  // Asignar roles a usuarios
  console.log('👤 Asignando roles a usuarios...');
  
  await prisma.person_role.upsert({
    where: {
      person_id_role_id: {
        person_id: adminUser.id,
        role_id: adminRole.id
      }
    },
    update: {},
    create: {
      person_id: adminUser.id,
      role_id: adminRole.id,
      from_date: new Date(),
      is_active: true
    }
  });

  await prisma.person_role.upsert({
    where: {
      person_id_role_id: {
        person_id: regularUser.id,
        role_id: userRole.id
      }
    },
    update: {},
    create: {
      person_id: regularUser.id,
      role_id: userRole.id,
      from_date: new Date(),
      is_active: true
    }
  });

  await prisma.person_role.upsert({
    where: {
      person_id_role_id: {
        person_id: securityUser.id,
        role_id: securityRole.id
      }
    },
    update: {},
    create: {
      person_id: securityUser.id,
      role_id: securityRole.id,
      from_date: new Date(),
      is_active: true
    }
  });

  console.log('✅ Roles asignados a usuarios');

  // Crear unidades residenciales de prueba
  console.log('🏢 Creando unidades residenciales de prueba...');
  
  const residentialUnit = await prisma.residential_unit.upsert({
    where: { name: 'Conjunto Residencial Los Pinos' },
    update: {},
    create: {
      name: 'Conjunto Residencial Los Pinos',
      address: 'Calle 123 # 45-67, Bogotá',
      tax_id: '900123456-7',
      alias: 'Los Pinos'
    }
  });

  console.log('✅ Unidad residencial creada');

  // Crear torres
  console.log('🏗️ Creando torres...');
  
  const tower1 = await prisma.tower.upsert({
    where: { name: 'Torre A' },
    update: {},
    create: {
      name: 'Torre A',
      residential_unit_id: residentialUnit.id,
      floor_count: 15,
      alias: 'Tower A'
    }
  });

  const tower2 = await prisma.tower.upsert({
    where: { name: 'Torre B' },
    update: {},
    create: {
      name: 'Torre B',
      residential_unit_id: residentialUnit.id,
      floor_count: 12,
      alias: 'Tower B'
    }
  });

  console.log('✅ Torres creadas');

  // Crear pisos
  console.log('🏢 Creando pisos...');
  
  for (let i = 1; i <= 15; i++) {
    await prisma.floor.upsert({
      where: {
        tower_id_number: {
          tower_id: tower1.id,
          number: i
        }
      },
      update: {},
      create: {
        tower_id: tower1.id,
        number: i,
        alias: `Piso ${i}`
      }
    });
  }

  for (let i = 1; i <= 12; i++) {
    await prisma.floor.upsert({
      where: {
        tower_id_number: {
          tower_id: tower2.id,
          number: i
        }
      },
      update: {},
      create: {
        tower_id: tower2.id,
        number: i,
        alias: `Piso ${i}`
      }
    });
  }

  console.log('✅ Pisos creados');

  // Crear apartamentos de prueba
  console.log('🏠 Creando apartamentos de prueba...');
  
  const apartments = [];
  for (let floor = 1; floor <= 5; floor++) {
    for (let apt = 1; apt <= 4; apt++) {
      const apartment = await prisma.apartment.upsert({
        where: { code: `A${floor}0${apt}` },
        update: {},
        create: {
          floor_id: floor,
          tower_id: tower1.id,
          code: `A${floor}0${apt}`,
          area_m2: 80 + Math.floor(Math.random() * 40),
          occupancy_status: Math.random() > 0.3 ? 'OCCUPIED' : 'VACANT',
          ownership_status: Math.random() > 0.2 ? 'OWNED' : 'RENTED',
          is_habitable: true,
          description: `Apartamento ${apt} del piso ${floor}`
        }
      });
      apartments.push(apartment);
    }
  }

  console.log(`✅ ${apartments.length} apartamentos creados`);

  // Crear vehículos de prueba
  console.log('🚗 Creando vehículos de prueba...');
  
  const vehicles = [
    { type: 'Carro', plate: 'ABC123', color: 'Blanco', brand: 'Toyota', model: 'Corolla' },
    { type: 'Moto', plate: 'XYZ789', color: 'Negro', brand: 'Honda', model: 'CBR600' },
    { type: 'Carro', plate: 'DEF456', color: 'Azul', brand: 'Ford', model: 'Focus' }
  ];

  for (let i = 0; i < vehicles.length; i++) {
    await prisma.vehicle.upsert({
      where: { plate: vehicles[i].plate },
      update: {},
      create: {
        person_id: adminUser.id,
        type: vehicles[i].type,
        plate: vehicles[i].plate,
        color: vehicles[i].color,
        brand: vehicles[i].brand,
        model: vehicles[i].model
      }
    });
  }

  console.log(`✅ ${vehicles.length} vehículos creados`);

  // Crear zonas comunes
  console.log('🏊 Creando zonas comunes...');
  
  const commonAreas = [
    {
      name: 'Piscina',
      type: 'RECREACION',
      capacity: 50,
      location: 'Primer piso',
      requires_reservation: true,
      schedule: '6:00 AM - 10:00 PM'
    },
    {
      name: 'Gimnasio',
      type: 'DEPORTE',
      capacity: 20,
      location: 'Segundo piso',
      requires_reservation: false,
      schedule: '5:00 AM - 11:00 PM'
    },
    {
      name: 'Sala de eventos',
      type: 'EVENTOS',
      capacity: 100,
      location: 'Tercer piso',
      requires_reservation: true,
      schedule: '8:00 AM - 12:00 AM'
    }
  ];

  for (const area of commonAreas) {
    await prisma.common_area.upsert({
      where: { name: area.name },
      update: {},
      create: {
        residential_unit_id: residentialUnit.id,
        name: area.name,
        type: area.type,
        capacity: area.capacity,
        location: area.location,
        requires_reservation: area.requires_reservation,
        schedule: area.schedule,
        description: `Zona común: ${area.name}`
      }
    });
  }

  console.log(`✅ ${commonAreas.length} zonas comunes creadas`);

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📋 Resumen:');
  console.log(`- ${permissions.length} permisos creados`);
  console.log('- 3 roles creados (Administrador, Usuario, Seguridad)');
  console.log('- 3 usuarios de prueba creados');
  console.log('- 1 unidad residencial creada');
  console.log('- 2 torres creadas');
  console.log('- 27 pisos creados');
  console.log(`- ${apartments.length} apartamentos creados`);
  console.log(`- ${vehicles.length} vehículos creados`);
  console.log(`- ${commonAreas.length} zonas comunes creadas`);
  
  console.log('\n🔑 Credenciales de prueba:');
  console.log('Admin: admin / password123');
  console.log('Usuario: usuario / password123');
  console.log('Seguridad: seguridad / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 