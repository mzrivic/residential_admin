const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testBulkDelete() {
  console.log('=== PRUEBA SIMPLE DE ELIMINACIÓN MASIVA ===\n');

  try {
    // 1. Crear un usuario de prueba
    console.log('1. Creando usuario de prueba...');
    const createResponse = await axios.post(`${API_BASE_URL}/persons`, {
      full_name: "Usuario Test Bulk Delete",
      username: "test_bulk_delete",
      document_type: "CC",
      document_number: "999999999",
      gender: "M",
      status: "ACTIVE"
    });

    console.log('Usuario creado:', createResponse.data);
    const userId = createResponse.data.data.id;
    console.log('ID del usuario:', userId);

    // 2. Probar eliminación masiva
    console.log('\n2. Probando eliminación masiva...');
    const deleteResponse = await axios.request({
      method: 'DELETE',
      url: `${API_BASE_URL}/persons/bulk`,
      data: {
        ids: [userId]
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta de eliminación masiva:', deleteResponse.data);

    // 3. Verificar que el usuario fue eliminado
    console.log('\n3. Verificando que el usuario fue eliminado...');
    try {
      const getResponse = await axios.get(`${API_BASE_URL}/persons/${userId}`);
      console.log('Usuario aún existe:', getResponse.data);
    } catch (error) {
      console.log('Usuario eliminado correctamente (no encontrado)');
    }

  } catch (error) {
    console.error('Error en la prueba:', error.response?.data || error.message);
  }
}

testBulkDelete(); 