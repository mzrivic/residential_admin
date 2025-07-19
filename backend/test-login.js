// Script simple para probar el login
const BASE_URL = 'http://localhost:3000';
const API_VERSION = 'v1';

async function testLogin() {
  console.log('🔐 Probando login...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/${API_VERSION}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log('Token:', data.data.access_token);
    } else {
      console.log('❌ Login falló');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin(); 