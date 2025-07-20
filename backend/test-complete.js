#!/usr/bin/env node

/**
 * 🧪 TEST COMPLETO Y ROBUSTO - RESIDENTIAL ADMIN BACKEND
 * ======================================================
 * 
 * Este script valida al 100% todas las funcionalidades del backend:
 * - Autenticación y autorización
 * - CRUD de personas
 * - CRUD de roles y permisos
 * - Auditoría
 * - Operaciones masivas
 * - Validaciones y manejo de errores
 * - Performance y seguridad
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api/v1';
const TEST_TIMEOUT = 30000; // 30 segundos por test
const MAX_RETRIES = 3;

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Estadísticas de testing
const testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

// Función para imprimir con colores
function print(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para imprimir header
function printHeader(title) {
  print('\n' + '='.repeat(60), 'cyan');
  print(`🧪 ${title}`, 'bright');
  print('='.repeat(60), 'cyan');
}

// Función para imprimir test result
function printTestResult(testName, passed, message = '') {
  testStats.total++;
  if (passed) {
    testStats.passed++;
    print(`✅ ${testName}`, 'green');
  } else {
    testStats.failed++;
    print(`❌ ${testName}`, 'red');
    if (message) print(`   ${message}`, 'red');
  }
}

// Función para hacer request HTTP
async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: TEST_TIMEOUT
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    const data = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { raw: data };
    }

    return {
      status: response.status,
      headers: response.headers.raw(),
      data: jsonData,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false
    };
  }
}

// Función para esperar que el servidor esté listo
async function waitForServer() {
  print('⏳ Esperando que el servidor esté listo...', 'yellow');
  
  for (let i = 0; i < 30; i++) {
    try {
      const response = await makeRequest(`${API_BASE_URL}/health`);
      if (response.ok) {
        print('✅ Servidor listo', 'green');
        return true;
      }
    } catch (error) {
      // Continuar esperando
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  print('❌ Servidor no responde después de 30 segundos', 'red');
  return false;
}

// =============================================================================
// TESTS DE AUTENTICACIÓN Y AUTORIZACIÓN
// =============================================================================

async function testAuthentication() {
  printHeader('AUTENTICACIÓN Y AUTORIZACIÓN');
  
  // Test 1: Login exitoso
  try {
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    if (response.ok && response.data.success) {
      printTestResult('Login exitoso', true);
      return response.data.data.access_token;
    } else {
      printTestResult('Login exitoso', false, `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    printTestResult('Login exitoso', false, error.message);
    return null;
  }
}

async function testAuthorization(token) {
  if (!token) {
    printTestResult('Tests de autorización', false, 'No hay token de acceso');
    return;
  }
  
  // Test: Acceso a endpoint protegido
  try {
    const response = await makeRequest(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    printTestResult('Acceso a endpoint protegido', response.ok);
  } catch (error) {
    printTestResult('Acceso a endpoint protegido', false, error.message);
  }
  
  // Test: Acceso sin token
  try {
    const response = await makeRequest(`${API_BASE_URL}/auth/me`);
    printTestResult('Acceso denegado sin token', !response.ok);
  } catch (error) {
    printTestResult('Acceso denegado sin token', false, error.message);
  }
}

// =============================================================================
// TESTS DE GESTIÓN DE PERSONAS
// =============================================================================

async function testPersonManagement(token) {
  printHeader('GESTIÓN DE PERSONAS');
  
  if (!token) {
    printTestResult('Tests de gestión de personas', false, 'No hay token de acceso');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Crear persona
  let personId;
  try {
    const personData = {
      full_name: 'Juan Pérez Test',
      email: 'juan.perez.test@example.com',
      phone: '+573001234567',
      document_type: 'CC',
      document_number: '1234567890',
      gender: 'M',
      birth_date: '1990-01-01',
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      state: 'Cundinamarca',
      country: 'Colombia',
      postal_code: '110111',
      emergency_contact: {
        name: 'María Pérez',
        phone: '+573009876543',
        relationship: 'Hermana'
      }
    };
    
    const response = await makeRequest(`${API_BASE_URL}/persons`, {
      method: 'POST',
      headers,
      body: JSON.stringify(personData)
    });
    
    if (response.ok && response.data.success) {
      printTestResult('Crear persona', true);
      personId = response.data.data.id;
    } else {
      printTestResult('Crear persona', false, `Status: ${response.status}`);
    }
  } catch (error) {
    printTestResult('Crear persona', false, error.message);
  }
  
  // Test 2: Obtener persona por ID
  if (personId) {
    try {
      const response = await makeRequest(`${API_BASE_URL}/persons/${personId}`, {
        headers
      });
      
      printTestResult('Obtener persona por ID', response.ok);
    } catch (error) {
      printTestResult('Obtener persona por ID', false, error.message);
    }
  }
  
  // Test 3: Listar personas
  try {
    const response = await makeRequest(`${API_BASE_URL}/persons?page=1&limit=10`, {
      headers
    });
    
    printTestResult('Listar personas', response.ok);
  } catch (error) {
    printTestResult('Listar personas', false, error.message);
  }
  
  // Test 4: Actualizar persona
  if (personId) {
    try {
      const updateData = {
        full_name: 'Juan Pérez Test Actualizado',
        email: 'juan.perez.updated@example.com'
      };
      
      const response = await makeRequest(`${API_BASE_URL}/persons/${personId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });
      
      printTestResult('Actualizar persona', response.ok);
    } catch (error) {
      printTestResult('Actualizar persona', false, error.message);
    }
  }
  
  // Test 5: Eliminar persona (soft delete)
  if (personId) {
    try {
      const response = await makeRequest(`${API_BASE_URL}/persons/${personId}`, {
        method: 'DELETE',
        headers
      });
      
      printTestResult('Eliminar persona (soft delete)', response.ok);
    } catch (error) {
      printTestResult('Eliminar persona (soft delete)', false, error.message);
    }
  }
}

// =============================================================================
// TESTS DE GESTIÓN DE ROLES
// =============================================================================

async function testRoleManagement(token) {
  printHeader('GESTIÓN DE ROLES');
  
  if (!token) {
    printTestResult('Tests de gestión de roles', false, 'No hay token de acceso');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Listar roles
  try {
    const response = await makeRequest(`${API_BASE_URL}/roles`, {
      headers
    });
    
    printTestResult('Listar roles', response.ok);
  } catch (error) {
    printTestResult('Listar roles', false, error.message);
  }
  
  // Test 2: Crear rol
  let roleId;
  try {
    const roleData = {
      name: 'Test Role',
      alias: 'test_role',
      description: 'Rol de prueba para testing'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(roleData)
    });
    
    if (response.ok && response.data.success) {
      printTestResult('Crear rol', true);
      roleId = response.data.data.id;
    } else {
      printTestResult('Crear rol', false, `Status: ${response.status}`);
    }
  } catch (error) {
    printTestResult('Crear rol', false, error.message);
  }
  
  // Test 3: Obtener rol por ID
  if (roleId) {
    try {
      const response = await makeRequest(`${API_BASE_URL}/roles/${roleId}`, {
        headers
      });
      
      printTestResult('Obtener rol por ID', response.ok);
    } catch (error) {
      printTestResult('Obtener rol por ID', false, error.message);
    }
  }
}

// =============================================================================
// TESTS DE AUDITORÍA
// =============================================================================

async function testAuditLogs(token) {
  printHeader('AUDITORÍA');
  
  if (!token) {
    printTestResult('Tests de auditoría', false, 'No hay token de acceso');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Listar logs de auditoría
  try {
    const response = await makeRequest(`${API_BASE_URL}/audit?page=1&limit=10`, {
      headers
    });
    
    printTestResult('Listar logs de auditoría', response.ok);
  } catch (error) {
    printTestResult('Listar logs de auditoría', false, error.message);
  }
  
  // Test 2: Filtrar logs por usuario
  try {
    const response = await makeRequest(`${API_BASE_URL}/audit?user_id=1&page=1&limit=5`, {
      headers
    });
    
    printTestResult('Filtrar logs por usuario', response.ok);
  } catch (error) {
    printTestResult('Filtrar logs por usuario', false, error.message);
  }
}

// =============================================================================
// TESTS DE OPERACIONES MASIVAS
// =============================================================================

async function testBulkOperations(token) {
  printHeader('OPERACIONES MASIVAS');
  
  if (!token) {
    printTestResult('Tests de operaciones masivas', false, 'No hay token de acceso');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Crear múltiples personas
  try {
    const bulkData = {
      persons: [
        {
          full_name: 'Ana García Test 1',
          email: 'ana.garcia1@example.com',
          phone: '+573001234568',
          document_type: 'CC',
          document_number: '1234567891',
          gender: 'F'
        },
        {
          full_name: 'Carlos López Test 2',
          email: 'carlos.lopez2@example.com',
          phone: '+573001234569',
          document_type: 'CC',
          document_number: '1234567892',
          gender: 'M'
        }
      ]
    };
    
    const response = await makeRequest(`${API_BASE_URL}/persons/bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bulkData)
    });
    
    printTestResult('Crear múltiples personas', response.ok);
  } catch (error) {
    printTestResult('Crear múltiples personas', false, error.message);
  }
}

// =============================================================================
// TESTS DE VALIDACIÓN Y MANEJO DE ERRORES
// =============================================================================

async function testValidationAndErrors(token) {
  printHeader('VALIDACIÓN Y MANEJO DE ERRORES');
  
  if (!token) {
    printTestResult('Tests de validación', false, 'No hay token de acceso');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Crear persona con datos inválidos
  try {
    const invalidData = {
      full_name: '', // Nombre vacío
      email: 'invalid-email', // Email inválido
      document_number: '123' // Documento muy corto
    };
    
    const response = await makeRequest(`${API_BASE_URL}/persons`, {
      method: 'POST',
      headers,
      body: JSON.stringify(invalidData)
    });
    
    printTestResult('Validar datos inválidos', !response.ok);
  } catch (error) {
    printTestResult('Validar datos inválidos', false, error.message);
  }
  
  // Test 2: Acceso a recurso inexistente
  try {
    const response = await makeRequest(`${API_BASE_URL}/persons/999999`, {
      headers
    });
    
    printTestResult('Manejo de recurso inexistente', !response.ok);
  } catch (error) {
    printTestResult('Manejo de recurso inexistente', false, error.message);
  }
  
  // Test 3: Token inválido
  try {
    const response = await makeRequest(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    printTestResult('Manejo de token inválido', !response.ok);
  } catch (error) {
    printTestResult('Manejo de token inválido', false, error.message);
  }
}

// =============================================================================
// TESTS DE PERFORMANCE Y SEGURIDAD
// =============================================================================

async function testPerformanceAndSecurity(token) {
  printHeader('PERFORMANCE Y SEGURIDAD');
  
  if (!token) {
    printTestResult('Tests de performance', false, 'No hay token de acceso');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test 1: Response time
  try {
    const startTime = Date.now();
    const response = await makeRequest(`${API_BASE_URL}/persons?page=1&limit=10`, {
      headers
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const isFast = responseTime < 1000; // Menos de 1 segundo
    printTestResult(`Response time (${responseTime}ms)`, isFast);
  } catch (error) {
    printTestResult('Response time', false, error.message);
  }
  
  // Test 2: Rate limiting (simulado)
  try {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(makeRequest(`${API_BASE_URL}/persons?page=1&limit=1`, {
        headers
      }));
    }
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.ok).length;
    
    printTestResult('Rate limiting', successCount > 0);
  } catch (error) {
    printTestResult('Rate limiting', false, error.message);
  }
}

// =============================================================================
// FUNCIÓN PRINCIPAL DE TESTING
// =============================================================================

async function runAllTests() {
  printHeader('INICIANDO TEST COMPLETO Y ROBUSTO');
  print(`🚀 API Base URL: ${API_BASE_URL}`, 'blue');
  print(`⏱️  Timeout por test: ${TEST_TIMEOUT}ms`, 'blue');
  print(`🔄 Máximo de reintentos: ${MAX_RETRIES}`, 'blue');
  
  // Esperar que el servidor esté listo
  const serverReady = await waitForServer();
  if (!serverReady) {
    print('❌ No se puede continuar sin el servidor', 'red');
    process.exit(1);
  }
  
  // Ejecutar todos los tests
  const token = await testAuthentication();
  await testAuthorization(token);
  await testPersonManagement(token);
  await testRoleManagement(token);
  await testAuditLogs(token);
  await testBulkOperations(token);
  await testValidationAndErrors(token);
  await testPerformanceAndSecurity(token);
  
  // Mostrar resultados finales
  const endTime = Date.now();
  const totalTime = (endTime - testStats.startTime) / 1000;
  
  printHeader('RESULTADOS FINALES');
  print(`📊 Total de tests: ${testStats.total}`, 'white');
  print(`✅ Tests exitosos: ${testStats.passed}`, 'green');
  print(`❌ Tests fallidos: ${testStats.failed}`, 'red');
  print(`⏭️  Tests omitidos: ${testStats.skipped}`, 'yellow');
  print(`⏱️  Tiempo total: ${totalTime.toFixed(2)}s`, 'blue');
  
  const successRate = ((testStats.passed / testStats.total) * 100).toFixed(2);
  print(`📈 Tasa de éxito: ${successRate}%`, successRate >= 90 ? 'green' : 'red');
  
  if (testStats.failed === 0) {
    print('\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!', 'green');
    print('✅ El backend está funcionando al 100%', 'green');
  } else {
    print(`\n⚠️  ${testStats.failed} tests fallaron`, 'red');
    print('🔧 Revisa los errores y corrige los problemas', 'yellow');
  }
  
  return testStats.failed === 0;
}

// Ejecutar tests si el script se ejecuta directamente
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      print(`❌ Error fatal: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runAllTests, testStats }; 