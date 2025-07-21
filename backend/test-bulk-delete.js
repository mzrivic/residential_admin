const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_VERSION = 'v1';

// Colores para la consola
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

function printResult(testName, success, details = '') {
  const status = success ? `${colors.green}✅ PASÓ${colors.reset}` : `${colors.red}❌ FALLÓ${colors.reset}`;
  console.log(`${status} ${colors.bright}${testName}${colors.reset} ${details}`);
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      data: error.response?.data || { message: error.message }
    };
  }
}

async function testBulkDelete() {
  console.log(`${colors.bright}${colors.blue}=== PRUEBA DE ELIMINACIÓN MASIVA DE USUARIOS ===${colors.reset}\n`);

  // 1. Primero crear algunos usuarios de prueba
  console.log(`${colors.yellow}1. Creando usuarios de prueba...${colors.reset}`);
  
  const createUser1 = await makeRequest('POST', `/api/${API_VERSION}/persons`, {
    full_name: "Usuario Prueba 1",
    username: "test_user_1",
    document_type: "CC",
    document_number: "111111111",
    gender: "M",
    status: "ACTIVE"
  });
  
  const createUser2 = await makeRequest('POST', `/api/${API_VERSION}/persons`, {
    full_name: "Usuario Prueba 2",
    username: "test_user_2",
    document_type: "CC",
    document_number: "222222222",
    gender: "F",
    status: "ACTIVE"
  });

  const createUser3 = await makeRequest('POST', `/api/${API_VERSION}/persons`, {
    full_name: "Usuario Prueba 3",
    username: "test_user_3",
    document_type: "CC",
    document_number: "333333333",
    gender: "M",
    status: "ACTIVE"
  });

  printResult('Crear Usuario 1', createUser1.success, `Status: ${createUser1.status}`);
  printResult('Crear Usuario 2', createUser2.success, `Status: ${createUser2.status}`);
  printResult('Crear Usuario 3', createUser3.success, `Status: ${createUser3.status}`);

  // Extraer IDs de los usuarios creados
  const userId1 = createUser1.success ? createUser1.data.data.id : null;
  const userId2 = createUser2.success ? createUser2.data.data.id : null;
  const userId3 = createUser3.success ? createUser3.data.data.id : null;

  console.log(`\n${colors.cyan}IDs de usuarios creados: ${userId1}, ${userId2}, ${userId3}${colors.reset}\n`);

  // 2. Probar eliminación masiva con IDs válidos
  console.log(`${colors.yellow}2. Probando eliminación masiva con IDs válidos...${colors.reset}`);
  
  if (userId1 && userId2 && userId3) {
    const bulkDeleteValid = await makeRequest('DELETE', `/api/${API_VERSION}/persons/bulk`, {
      ids: [userId1, userId2, userId3]
    });
    
    printResult('Eliminación Masiva (IDs válidos)', bulkDeleteValid.success, `Status: ${bulkDeleteValid.status}`);
    
    if (bulkDeleteValid.success) {
      console.log(`${colors.green}Respuesta:${colors.reset}`, JSON.stringify(bulkDeleteValid.data, null, 2));
    } else {
      console.log(`${colors.red}Error:${colors.reset}`, JSON.stringify(bulkDeleteValid.data, null, 2));
    }
  }

  // 3. Probar eliminación masiva con IDs inválidos
  console.log(`\n${colors.yellow}3. Probando eliminación masiva con IDs inválidos...${colors.reset}`);
  
  const bulkDeleteInvalid = await makeRequest('DELETE', `/api/${API_VERSION}/persons/bulk`, {
    ids: [0, -1, "invalid", null, undefined]
  });
  
  printResult('Eliminación Masiva (IDs inválidos)', bulkDeleteInvalid.success, `Status: ${bulkDeleteInvalid.status}`);
  
  if (bulkDeleteInvalid.success) {
    console.log(`${colors.green}Respuesta:${colors.reset}`, JSON.stringify(bulkDeleteInvalid.data, null, 2));
  } else {
    console.log(`${colors.red}Error:${colors.reset}`, JSON.stringify(bulkDeleteInvalid.data, null, 2));
  }

  // 4. Probar eliminación masiva con array vacío
  console.log(`\n${colors.yellow}4. Probando eliminación masiva con array vacío...${colors.reset}`);
  
  const bulkDeleteEmpty = await makeRequest('DELETE', `/api/${API_VERSION}/persons/bulk`, {
    ids: []
  });
  
  printResult('Eliminación Masiva (Array vacío)', bulkDeleteEmpty.success, `Status: ${bulkDeleteEmpty.status}`);
  
  if (bulkDeleteEmpty.success) {
    console.log(`${colors.green}Respuesta:${colors.reset}`, JSON.stringify(bulkDeleteEmpty.data, null, 2));
  } else {
    console.log(`${colors.red}Error:${colors.reset}`, JSON.stringify(bulkDeleteEmpty.data, null, 2));
  }

  // 5. Probar eliminación masiva sin campo ids
  console.log(`\n${colors.yellow}5. Probando eliminación masiva sin campo ids...${colors.reset}`);
  
  const bulkDeleteNoIds = await makeRequest('DELETE', `/api/${API_VERSION}/persons/bulk`, {
    other_field: "test"
  });
  
  printResult('Eliminación Masiva (Sin campo ids)', bulkDeleteNoIds.success, `Status: ${bulkDeleteNoIds.status}`);
  
  if (bulkDeleteNoIds.success) {
    console.log(`${colors.green}Respuesta:${colors.reset}`, JSON.stringify(bulkDeleteNoIds.data, null, 2));
  } else {
    console.log(`${colors.red}Error:${colors.reset}`, JSON.stringify(bulkDeleteNoIds.data, null, 2));
  }

  // 6. Probar eliminación masiva con IDs que no existen
  console.log(`\n${colors.yellow}6. Probando eliminación masiva con IDs que no existen...${colors.reset}`);
  
  const bulkDeleteNonExistent = await makeRequest('DELETE', `/api/${API_VERSION}/persons/bulk`, {
    ids: [99999, 99998, 99997]
  });
  
  printResult('Eliminación Masiva (IDs inexistentes)', bulkDeleteNonExistent.success, `Status: ${bulkDeleteNonExistent.status}`);
  
  if (bulkDeleteNonExistent.success) {
    console.log(`${colors.green}Respuesta:${colors.reset}`, JSON.stringify(bulkDeleteNonExistent.data, null, 2));
  } else {
    console.log(`${colors.red}Error:${colors.reset}`, JSON.stringify(bulkDeleteNonExistent.data, null, 2));
  }

  console.log(`\n${colors.bright}${colors.blue}=== FIN DE PRUEBAS ===${colors.reset}`);
}

// Ejecutar las pruebas
testBulkDelete().catch(console.error); 