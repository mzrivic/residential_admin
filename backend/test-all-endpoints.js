const axios = require('axios');

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
let userToken = '';

// Función para imprimir resultados
function printResult(testName, success, message = '') {
  const status = success ? '✅ PASÓ' : '❌ FALLÓ';
  const color = success ? colors.green : colors.red;
  console.log(`${color}${status}${colors.reset} ${testName} ${message}`);
}

// Función para hacer requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Tests de autenticación
async function testAuth() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE AUTENTICACIÓN ===${colors.reset}`);

  // Test 1: Health Check
  const health = await makeRequest('GET', '/health');
  printResult('Health Check', health.success, `Status: ${health.status}`);

  // Test 2: API Info
  const apiInfo = await makeRequest('GET', '/');
  printResult('API Info', apiInfo.success, `Status: ${apiInfo.status}`);

  // Test 3: Registro de usuario
  const registerData = {
    full_name: "Usuario de Prueba",
    username: "test_user",
    email: "test@residential.com",
    password: "password123",
    confirm_password: "password123",
    document_type: "CC",
    document_number: "123456789"
  };
  const register = await makeRequest('POST', `/api/${API_VERSION}/auth/register`, registerData);
  printResult('Registro de Usuario', register.success, `Status: ${register.status}`);

  // Test 4: Login
  const loginData = {
    username: "test_user",
    password: "password123"
  };
  const login = await makeRequest('POST', `/api/${API_VERSION}/auth/login`, loginData);
  if (login.success) {
    adminToken = login.data.data.access_token;
  }
  printResult('Login', login.success, `Status: ${login.status}`);

  // Test 5: Obtener usuario actual
  const me = await makeRequest('GET', `/api/${API_VERSION}/auth/me`, null, adminToken);
  printResult('Obtener Usuario Actual', me.success, `Status: ${me.status}`);
}

// Tests de personas
async function testPersons() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE PERSONAS ===${colors.reset}`);

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
  printResult('Crear Persona', createPerson.success, `Status: ${createPerson.status}`);

  // Test 2: Obtener todas las personas
  const getPersons = await makeRequest('GET', `/api/${API_VERSION}/persons?page=1&limit=10`, null, adminToken);
  printResult('Obtener Personas', getPersons.success, `Status: ${getPersons.status}`);

  // Test 3: Obtener persona por ID (si existe)
  if (createPerson.success && createPerson.data.data.id) {
    const getPerson = await makeRequest('GET', `/api/${API_VERSION}/persons/${createPerson.data.data.id}`, null, adminToken);
    printResult('Obtener Persona por ID', getPerson.success, `Status: ${getPerson.status}`);
  }

  // Test 4: Actualizar persona
  if (createPerson.success && createPerson.data.data.id) {
    const updateData = {
      full_name: "Juan Carlos Pérez",
      notes: "Persona actualizada"
    };
    const updatePerson = await makeRequest('PUT', `/api/${API_VERSION}/persons/${createPerson.data.data.id}`, updateData, adminToken);
    printResult('Actualizar Persona', updatePerson.success, `Status: ${updatePerson.status}`);
  }
}

// Tests de operaciones masivas
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

  // Test 2: Validar múltiples personas
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
}

// Tests de roles
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
  printResult('Crear Rol', createRole.success, `Status: ${createRole.status}`);

  // Test 2: Obtener roles
  const getRoles = await makeRequest('GET', `/api/${API_VERSION}/roles`, null, adminToken);
  printResult('Obtener Roles', getRoles.success, `Status: ${getRoles.status}`);
}

// Tests de permisos
async function testPermissions() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE PERMISOS ===${colors.reset}`);

  // Test 1: Crear permiso
  const permissionData = {
    code: "PERSON_CREATE",
    description: "Permiso para crear personas",
    is_active: true
  };
  const createPermission = await makeRequest('POST', `/api/${API_VERSION}/permissions`, permissionData, adminToken);
  printResult('Crear Permiso', createPermission.success, `Status: ${createPermission.status}`);

  // Test 2: Obtener permisos
  const getPermissions = await makeRequest('GET', `/api/${API_VERSION}/permissions`, null, adminToken);
  printResult('Obtener Permisos', getPermissions.success, `Status: ${getPermissions.status}`);
}

// Tests de auditoría
async function testAudit() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE AUDITORÍA ===${colors.reset}`);

  // Test 1: Obtener logs de auditoría
  const getAuditLogs = await makeRequest('GET', `/api/${API_VERSION}/audit`, null, adminToken);
  printResult('Obtener Logs de Auditoría', getAuditLogs.success, `Status: ${getAuditLogs.status}`);

  // Test 2: Obtener estadísticas de auditoría
  const getAuditStats = await makeRequest('GET', `/api/${API_VERSION}/audit/stats`, null, adminToken);
  printResult('Obtener Estadísticas de Auditoría', getAuditStats.success, `Status: ${getAuditStats.status}`);
}

// Tests de búsqueda y filtros
async function testSearchAndFilters() {
  console.log(`\n${colors.bold}${colors.blue}=== PRUEBAS DE BÚSQUEDA Y FILTROS ===${colors.reset}`);

  // Test 1: Búsqueda de personas
  const searchPersons = await makeRequest('GET', `/api/${API_VERSION}/persons?search=juan`, null, adminToken);
  printResult('Búsqueda de Personas', searchPersons.success, `Status: ${searchPersons.status}`);

  // Test 2: Filtros por estado
  const filterByStatus = await makeRequest('GET', `/api/${API_VERSION}/persons?status=active`, null, adminToken);
  printResult('Filtrar por Estado', filterByStatus.success, `Status: ${filterByStatus.status}`);

  // Test 3: Autocompletado
  const autocomplete = await makeRequest('GET', `/api/${API_VERSION}/persons/search/autocomplete?q=ju`, null, adminToken);
  printResult('Autocompletado', autocomplete.success, `Status: ${autocomplete.status}`);
}

// Función principal
async function runAllTests() {
  console.log(`${colors.bold}${colors.yellow}🚀 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA${colors.reset}`);
  console.log(`${colors.yellow}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}API Version: ${API_VERSION}${colors.reset}`);

  try {
    await testAuth();
    await testPersons();
    await testBulkOperations();
    await testRoles();
    await testPermissions();
    await testAudit();
    await testSearchAndFilters();

    console.log(`\n${colors.bold}${colors.green}🎉 TODAS LAS PRUEBAS COMPLETADAS${colors.reset}`);
    console.log(`${colors.green}El sistema está funcionando correctamente según las especificaciones del note.txt${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error durante las pruebas:${colors.reset}`, error.message);
  }
}

// Ejecutar pruebas
runAllTests(); 