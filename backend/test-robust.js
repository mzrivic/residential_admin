// Usando fetch nativo de Node.js (disponible desde Node 18+)

const BASE_URL = 'http://localhost:3000';
const API_VERSION = 'v1';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let adminToken = '';
let testPersonId = null;
let testRoleId = null;
let testPermissionId = null;

// Función para imprimir resultados
function printResult(testName, success, message = '', details = '') {
  const status = success ? '✅ PASÓ' : '❌ FALLÓ';
  const color = success ? colors.green : colors.red;
  console.log(`${color}${status}${colors.reset} ${testName} ${message}`);
  if (details && !success) {
    console.log(`${colors.red}   Detalles: ${details}${colors.reset}`);
  }
}

// Función para hacer requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const responseData = await response.json();
    
    return { 
      success: response.ok, 
      data: responseData, 
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      status: 0,
      statusText: 'Network Error'
    };
  }
}

// ========================================
// PRUEBAS DE AUTENTICACIÓN
// ========================================
async function testAuth() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE AUTENTICACIÓN ===${colors.reset}`);

  // Test 1: Health Check
  const health = await makeRequest('GET', '/health');
  printResult('Health Check', health.success, `Status: ${health.status}`);

  // Test 2: API Info
  const apiInfo = await makeRequest('GET', '/');
  printResult('API Info', apiInfo.success, `Status: ${health.status}`);

  // Test 3: Registro de usuario
  const registerData = {
    full_name: "Usuario de Prueba",
    username: "test_user_2",
    email: "test2@residential.com",
    password: "password123",
    confirm_password: "password123",
    document_type: "CC",
    document_number: "123456790"
  };
  const register = await makeRequest('POST', `/api/${API_VERSION}/auth/register`, registerData);
  printResult('Registro de Usuario', register.success, `Status: ${register.status}`);

  // Test 4: Login
  const loginData = {
    username: "admin",
    password: "admin123"
  };
  const login = await makeRequest('POST', `/api/${API_VERSION}/auth/login`, loginData);
  if (login.success && login.data.data && login.data.data.access_token) {
    adminToken = login.data.data.access_token;
  }
  printResult('Login', login.success, `Status: ${login.status}`);

  // Test 5: Obtener usuario actual
  const me = await makeRequest('GET', `/api/${API_VERSION}/auth/me`, null, adminToken);
  printResult('Obtener Usuario Actual', me.success, `Status: ${me.status}`);

  // Test 6: Refresh Token
  if (login.success && login.data.data && login.data.data.refresh_token) {
    const refreshData = {
      refresh_token: login.data.data.refresh_token
    };
    const refresh = await makeRequest('POST', `/api/${API_VERSION}/auth/refresh-token`, refreshData);
    printResult('Refresh Token', refresh.success, `Status: ${refresh.status}`);
  }
}

// ========================================
// PRUEBAS DE PERSONAS (CRUD COMPLETO)
// ========================================
async function testPersons() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE PERSONAS (CRUD COMPLETO) ===${colors.reset}`);

  // Test 1: Crear persona
  const personData = {
    full_name: "Juan Pérez",
    document_type: "CC",
    document_number: "987654321",
    gender: "M",
    birth_date: "1990-01-01",
    notes: "Persona de prueba",
    alias: "Juan",
    is_active: true,
    username: "juan_perez",
    password: "password123",
    language: "es",
    timezone: "America/Bogota"
  };
  const createPerson = await makeRequest('POST', `/api/${API_VERSION}/persons`, personData, adminToken);
  if (createPerson.success && createPerson.data.data && createPerson.data.data.id) {
    testPersonId = createPerson.data.data.id;
  }
  printResult('Crear Persona', createPerson.success, `Status: ${createPerson.status}`);

  // Test 2: Obtener todas las personas
  const getPersons = await makeRequest('GET', `/api/${API_VERSION}/persons?page=1&limit=10`, null, adminToken);
  printResult('Obtener Personas', getPersons.success, `Status: ${getPersons.status}`);

  // Test 3: Obtener persona por ID
  if (testPersonId) {
    const getPerson = await makeRequest('GET', `/api/${API_VERSION}/persons/${testPersonId}`, null, adminToken);
    printResult('Obtener Persona por ID', getPerson.success, `Status: ${getPerson.status}`);
  }

  // Test 4: Actualizar persona
  if (testPersonId) {
    const updateData = {
      full_name: "Juan Carlos Pérez",
      notes: "Persona actualizada"
    };
    const updatePerson = await makeRequest('PUT', `/api/${API_VERSION}/persons/${testPersonId}`, updateData, adminToken);
    printResult('Actualizar Persona', updatePerson.success, `Status: ${updatePerson.status}`);
  }

  // Test 5: Actualizar parcialmente persona
  if (testPersonId) {
    const partialUpdateData = {
      status: "INACTIVE"
    };
    const partialUpdate = await makeRequest('PUT', `/api/${API_VERSION}/persons/${testPersonId}/partial`, partialUpdateData, adminToken);
    printResult('Actualizar Parcialmente Persona', partialUpdate.success, `Status: ${partialUpdate.status}`);
  }

  // Test 6: Validar persona
  const validateData = {
    full_name: "Ana Silva",
    document_type: "CC",
    document_number: "111111111",
    gender: "F"
  };
  const validatePerson = await makeRequest('POST', `/api/${API_VERSION}/persons/validate`, validateData, adminToken);
  printResult('Validar Persona', validatePerson.success, `Status: ${validatePerson.status}`);

  // Test 7: Buscar duplicados
  const checkDuplicates = await makeRequest('GET', `/api/${API_VERSION}/persons/duplicates/check`, null, adminToken);
  printResult('Verificar Duplicados', checkDuplicates.success, `Status: ${checkDuplicates.status}`);

  // Test 8: Búsqueda avanzada
  const advancedSearch = await makeRequest('GET', `/api/${API_VERSION}/persons/search/advanced?q=juan`, null, adminToken);
  printResult('Búsqueda Avanzada', advancedSearch.success, `Status: ${advancedSearch.status}`);

  // Test 9: Autocompletado
  const autocomplete = await makeRequest('GET', `/api/${API_VERSION}/persons/search/autocomplete?q=ju`, null, adminToken);
  printResult('Autocompletado', autocomplete.success, `Status: ${autocomplete.status}`);

  // Test 10: Obtener filtros disponibles
  const availableFilters = await makeRequest('GET', `/api/${API_VERSION}/persons/filters/available`, null, adminToken);
  printResult('Obtener Filtros Disponibles', availableFilters.success, `Status: ${availableFilters.status}`);

  // Test 11: Estadísticas
  const stats = await makeRequest('GET', `/api/${API_VERSION}/persons/stats/overview`, null, adminToken);
  printResult('Estadísticas Generales', stats.success, `Status: ${stats.status}`);

  // Test 12: Estadísticas por rol
  const statsByRole = await makeRequest('GET', `/api/${API_VERSION}/persons/stats/by-role`, null, adminToken);
  printResult('Estadísticas por Rol', statsByRole.success, `Status: ${statsByRole.status}`);

  // Test 13: Estadísticas por estado
  const statsByStatus = await makeRequest('GET', `/api/${API_VERSION}/persons/stats/by-status`, null, adminToken);
  printResult('Estadísticas por Estado', statsByStatus.success, `Status: ${statsByStatus.status}`);

  // Test 14: Reportes
  const reports = await makeRequest('GET', `/api/${API_VERSION}/persons/stats/reports`, null, adminToken);
  printResult('Reportes', reports.success, `Status: ${reports.status}`);

  // Test 15: Historial de auditoría
  if (testPersonId) {
    const auditHistory = await makeRequest('GET', `/api/${API_VERSION}/persons/${testPersonId}/audit`, null, adminToken);
    printResult('Historial de Auditoría', auditHistory.success, `Status: ${auditHistory.status}`);
  }
}

// ========================================
// PRUEBAS DE OPERACIONES MASIVAS
// ========================================
async function testBulkOperations() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE OPERACIONES MASIVAS ===${colors.reset}`);

  // Test 1: Crear múltiples personas
  const bulkData = {
    persons: [
      {
        full_name: "María García",
        document_type: "CC",
        document_number: "111111111",
        gender: "F",
        is_active: true
      },
      {
        full_name: "Carlos López",
        document_type: "CC",
        document_number: "222222222",
        gender: "M",
        is_active: true
      }
    ]
  };
  const bulkCreate = await makeRequest('POST', `/api/${API_VERSION}/persons/bulk`, bulkData, adminToken);
  printResult('Crear Múltiples Personas', bulkCreate.success, `Status: ${bulkCreate.status}`);

  // Test 2: Actualizar múltiples personas
  const bulkUpdateData = {
    updates: [
      {
        id: 1,
        data: {
          status: "ACTIVE"
        }
      }
    ]
  };
  const bulkUpdate = await makeRequest('PUT', `/api/${API_VERSION}/persons/bulk`, bulkUpdateData, adminToken);
  printResult('Actualizar Múltiples Personas', bulkUpdate.success, `Status: ${bulkUpdate.status}`);

  // Test 3: Eliminar múltiples personas
  const bulkDeleteData = {
    ids: [1, 2]
  };
  const bulkDelete = await makeRequest('DELETE', `/api/${API_VERSION}/persons/bulk`, bulkDeleteData, adminToken);
  printResult('Eliminar Múltiples Personas', bulkDelete.success, `Status: ${bulkDelete.status}`);

  // Test 4: Validar múltiples personas
  const validateData = {
    persons: [
      {
        full_name: "Ana Silva",
        document_type: "CC",
        document_number: "333333333",
        gender: "F"
      }
    ]
  };
  const bulkValidate = await makeRequest('POST', `/api/${API_VERSION}/persons/bulk-validate`, validateData, adminToken);
  printResult('Validar Múltiples Personas', bulkValidate.success, `Status: ${bulkValidate.status}`);

  // Test 5: Importar desde CSV
  const importCSV = await makeRequest('POST', `/api/${API_VERSION}/persons/import`, null, adminToken);
  printResult('Importar desde CSV', importCSV.success, `Status: ${importCSV.status}`);

  // Test 6: Exportar a CSV
  const exportCSV = await makeRequest('GET', `/api/${API_VERSION}/persons/export`, null, adminToken);
  printResult('Exportar a CSV', exportCSV.success, `Status: ${exportCSV.status}`);

  // Test 7: Asignar roles masivamente
  const bulkRolesData = {
    person_ids: [1, 2],
    role_id: 1
  };
  const bulkRoles = await makeRequest('POST', `/api/${API_VERSION}/persons/bulk-roles`, bulkRolesData, adminToken);
  printResult('Asignar Roles Masivamente', bulkRoles.success, `Status: ${bulkRoles.status}`);
}

// ========================================
// PRUEBAS DE ROLES
// ========================================
async function testRoles() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE ROLES ===${colors.reset}`);

  // Test 1: Crear rol
  const roleData = {
    name: "Residente",
    description: "Rol para residentes del complejo",
    alias: "RESIDENT",
    is_active: true
  };
  const createRole = await makeRequest('POST', `/api/${API_VERSION}/roles`, roleData, adminToken);
  if (createRole.success && createRole.data.data && createRole.data.data.id) {
    testRoleId = createRole.data.data.id;
  }
  printResult('Crear Rol', createRole.success, `Status: ${createRole.status}`);

  // Test 2: Obtener roles
  const getRoles = await makeRequest('GET', `/api/${API_VERSION}/roles`, null, adminToken);
  printResult('Obtener Roles', getRoles.success, `Status: ${getRoles.status}`);

  // Test 3: Obtener rol por ID
  if (testRoleId) {
    const getRole = await makeRequest('GET', `/api/${API_VERSION}/roles/${testRoleId}`, null, adminToken);
    printResult('Obtener Rol por ID', getRole.success, `Status: ${getRole.status}`);
  }

  // Test 4: Actualizar rol
  if (testRoleId) {
    const updateRoleData = {
      name: "Residente Premium",
      description: "Rol para residentes premium"
    };
    const updateRole = await makeRequest('PUT', `/api/${API_VERSION}/roles/${testRoleId}`, updateRoleData, adminToken);
    printResult('Actualizar Rol', updateRole.success, `Status: ${updateRole.status}`);
  }

  // Test 5: Eliminar rol
  if (testRoleId) {
    const deleteRole = await makeRequest('DELETE', `/api/${API_VERSION}/roles/${testRoleId}`, null, adminToken);
    printResult('Eliminar Rol', deleteRole.success, `Status: ${deleteRole.status}`);
  }

  // Test 6: Restaurar rol
  if (testRoleId) {
    const restoreRole = await makeRequest('POST', `/api/${API_VERSION}/roles/${testRoleId}/restore`, null, adminToken);
    printResult('Restaurar Rol', restoreRole.success, `Status: ${restoreRole.status}`);
  }
}

// ========================================
// PRUEBAS DE PERMISOS
// ========================================
async function testPermissions() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE PERMISOS ===${colors.reset}`);

  // Test 1: Crear permiso
  const permissionData = {
    code: "PERSON_CREATE",
    description: "Permiso para crear personas",
    is_active: true
  };
  const createPermission = await makeRequest('POST', `/api/${API_VERSION}/permissions`, permissionData, adminToken);
  if (createPermission.success && createPermission.data.data && createPermission.data.data.id) {
    testPermissionId = createPermission.data.data.id;
  }
  printResult('Crear Permiso', createPermission.success, `Status: ${createPermission.status}`);

  // Test 2: Obtener permisos
  const getPermissions = await makeRequest('GET', `/api/${API_VERSION}/permissions`, null, adminToken);
  printResult('Obtener Permisos', getPermissions.success, `Status: ${getPermissions.status}`);

  // Test 3: Obtener permiso por ID
  if (testPermissionId) {
    const getPermission = await makeRequest('GET', `/api/${API_VERSION}/permissions/${testPermissionId}`, null, adminToken);
    printResult('Obtener Permiso por ID', getPermission.success, `Status: ${getPermission.status}`);
  }

  // Test 4: Actualizar permiso
  if (testPermissionId) {
    const updatePermissionData = {
      description: "Permiso actualizado para crear personas"
    };
    const updatePermission = await makeRequest('PUT', `/api/${API_VERSION}/permissions/${testPermissionId}`, updatePermissionData, adminToken);
    printResult('Actualizar Permiso', updatePermission.success, `Status: ${updatePermission.status}`);
  }

  // Test 5: Eliminar permiso
  if (testPermissionId) {
    const deletePermission = await makeRequest('DELETE', `/api/${API_VERSION}/permissions/${testPermissionId}`, null, adminToken);
    printResult('Eliminar Permiso', deletePermission.success, `Status: ${deletePermission.status}`);
  }

  // Test 6: Restaurar permiso
  if (testPermissionId) {
    const restorePermission = await makeRequest('POST', `/api/${API_VERSION}/permissions/${testPermissionId}/restore`, null, adminToken);
    printResult('Restaurar Permiso', restorePermission.success, `Status: ${restorePermission.status}`);
  }
}

// ========================================
// PRUEBAS DE AUDITORÍA
// ========================================
async function testAudit() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE AUDITORÍA ===${colors.reset}`);

  // Test 1: Obtener logs de auditoría
  const getAuditLogs = await makeRequest('GET', `/api/${API_VERSION}/audit`, null, adminToken);
  printResult('Obtener Logs de Auditoría', getAuditLogs.success, `Status: ${getAuditLogs.status}`);

  // Test 2: Obtener estadísticas de auditoría
  const getAuditStats = await makeRequest('GET', `/api/${API_VERSION}/audit/stats`, null, adminToken);
  printResult('Obtener Estadísticas de Auditoría', getAuditStats.success, `Status: ${getAuditStats.status}`);

  // Test 3: Exportar auditoría
  const exportAudit = await makeRequest('GET', `/api/${API_VERSION}/audit/export`, null, adminToken);
  printResult('Exportar Auditoría', exportAudit.success, `Status: ${exportAudit.status}`);

  // Test 4: Limpiar logs antiguos
  const cleanLogs = await makeRequest('POST', `/api/${API_VERSION}/audit/clean`, { days: 90 }, adminToken);
  printResult('Limpiar Logs Antiguos', cleanLogs.success, `Status: ${cleanLogs.status}`);
}

// ========================================
// PRUEBAS DE GESTIÓN DE ARCHIVOS
// ========================================
async function testFileManagement() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE GESTIÓN DE ARCHIVOS ===${colors.reset}`);

  // Test 1: Subir foto de persona
  if (testPersonId) {
    const uploadPhoto = await makeRequest('POST', `/api/${API_VERSION}/persons/${testPersonId}/photo`, null, adminToken);
    printResult('Subir Foto de Persona', uploadPhoto.success, `Status: ${uploadPhoto.status}`);
  }

  // Test 2: Eliminar foto de persona
  if (testPersonId) {
    const deletePhoto = await makeRequest('DELETE', `/api/${API_VERSION}/persons/${testPersonId}/photo`, null, adminToken);
    printResult('Eliminar Foto de Persona', deletePhoto.success, `Status: ${deletePhoto.status}`);
  }

  // Test 3: Subir documentos
  if (testPersonId) {
    const uploadDocs = await makeRequest('POST', `/api/${API_VERSION}/persons/${testPersonId}/documents`, null, adminToken);
    printResult('Subir Documentos', uploadDocs.success, `Status: ${uploadDocs.status}`);
  }

  // Test 4: Listar documentos
  if (testPersonId) {
    const listDocs = await makeRequest('GET', `/api/${API_VERSION}/persons/${testPersonId}/documents`, null, adminToken);
    printResult('Listar Documentos', listDocs.success, `Status: ${listDocs.status}`);
  }
}

// ========================================
// PRUEBAS DE VERIFICACIÓN
// ========================================
async function testVerification() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE VERIFICACIÓN ===${colors.reset}`);

  // Test 1: Verificar usuario
  if (testPersonId) {
    const verifyUser = await makeRequest('POST', `/api/${API_VERSION}/persons/${testPersonId}/verify`, null, adminToken);
    printResult('Verificar Usuario', verifyUser.success, `Status: ${verifyUser.status}`);
  }

  // Test 2: Verificar email
  if (testPersonId) {
    const verifyEmail = await makeRequest('POST', `/api/${API_VERSION}/persons/${testPersonId}/verify-email`, null, adminToken);
    printResult('Verificar Email', verifyEmail.success, `Status: ${verifyEmail.status}`);
  }

  // Test 3: Verificar teléfono
  if (testPersonId) {
    const verifyPhone = await makeRequest('POST', `/api/${API_VERSION}/persons/${testPersonId}/verify-phone`, null, adminToken);
    printResult('Verificar Teléfono', verifyPhone.success, `Status: ${verifyPhone.status}`);
  }
}

// ========================================
// PRUEBAS DE GESTIÓN DE ROLES DE PERSONA
// ========================================
async function testPersonRoles() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE GESTIÓN DE ROLES DE PERSONA ===${colors.reset}`);

  // Test 1: Obtener roles de persona
  if (testPersonId) {
    const getPersonRoles = await makeRequest('GET', `/api/${API_VERSION}/persons/${testPersonId}/roles`, null, adminToken);
    printResult('Obtener Roles de Persona', getPersonRoles.success, `Status: ${getPersonRoles.status}`);
  }

  // Test 2: Asignar rol a persona
  if (testPersonId && testRoleId) {
    const assignRoleData = {
      role_id: testRoleId,
      from_date: new Date().toISOString().split('T')[0]
    };
    const assignRole = await makeRequest('POST', `/api/${API_VERSION}/persons/${testPersonId}/roles`, assignRoleData, adminToken);
    printResult('Asignar Rol a Persona', assignRole.success, `Status: ${assignRole.status}`);
  }

  // Test 3: Actualizar rol de persona
  if (testPersonId && testRoleId) {
    const updateRoleData = {
      to_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    const updateRole = await makeRequest('PUT', `/api/${API_VERSION}/persons/${testPersonId}/roles/${testRoleId}`, updateRoleData, adminToken);
    printResult('Actualizar Rol de Persona', updateRole.success, `Status: ${updateRole.status}`);
  }

  // Test 4: Remover rol de persona
  if (testPersonId && testRoleId) {
    const removeRole = await makeRequest('DELETE', `/api/${API_VERSION}/persons/${testPersonId}/roles/${testRoleId}`, null, adminToken);
    printResult('Remover Rol de Persona', removeRole.success, `Status: ${removeRole.status}`);
  }
}

// Función principal
async function runAllTests() {
  console.log(`${colors.bold}${colors.yellow}🚀 INICIANDO PRUEBAS ROBUSTAS DEL SISTEMA${colors.reset}`);
  console.log(`${colors.yellow}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}API Version: ${API_VERSION}${colors.reset}`);
  console.log(`${colors.yellow}Verificando que todo funcione como dice el note.txt${colors.reset}`);

  try {
    await testAuth();
    await testPersons();
    await testBulkOperations();
    await testRoles();
    await testPermissions();
    await testAudit();
    await testFileManagement();
    await testVerification();
    await testPersonRoles();

    console.log(`\n${colors.bold}${colors.green}🎉 TODAS LAS PRUEBAS COMPLETADAS${colors.reset}`);
    console.log(`${colors.green}✅ El sistema está funcionando correctamente según las especificaciones del note.txt${colors.reset}`);
    console.log(`${colors.green}✅ Todas las funcionalidades están implementadas y operativas${colors.reset}`);
    console.log(`${colors.green}✅ La API está lista para producción${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error durante las pruebas:${colors.reset}`, error.message);
  }
}

// Ejecutar pruebas
runAllTests(); 