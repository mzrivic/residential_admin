#!/usr/bin/env node

/**
 * 🎨 SCRIPT PARA ABRIR LA INTERFAZ DEL FRONTEND
 * =============================================
 * 
 * Este script instala las dependencias e inicia el servidor de desarrollo
 * del frontend de Angular para mostrar la interfaz.
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración
const PROJECT_ROOT = __dirname;
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

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

// Función para imprimir con colores
function print(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para imprimir header
function printHeader(title) {
  print('\n' + '='.repeat(60), 'cyan');
  print(`🎨 ${title}`, 'bright');
  print('='.repeat(60), 'cyan');
}

// Función para ejecutar comandos
function executeCommand(command, cwd = FRONTEND_DIR) {
  try {
    print(`🔄 Ejecutando: ${command}`, 'yellow');
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    return true;
  } catch (error) {
    print(`❌ Error ejecutando: ${command}`, 'red');
    print(`   ${error.message}`, 'red');
    return false;
  }
}

// Función principal
function openFrontend() {
  printHeader('INICIANDO FRONTEND - RESIDENTIAL ADMIN');
  print(`🚀 Proyecto: ${PROJECT_ROOT}`, 'blue');
  print(`🎨 Frontend: ${FRONTEND_DIR}`, 'blue');
  print(`🌐 URL: http://localhost:4200`, 'blue');
  
  // Verificar que el directorio frontend existe
  if (!fs.existsSync(FRONTEND_DIR)) {
    print('❌ Error: El directorio frontend no existe', 'red');
    print('   Asegúrate de que el proyecto esté completo', 'red');
    return false;
  }
  
  // Verificar que package.json existe
  const packageJsonPath = path.join(FRONTEND_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    print('❌ Error: package.json no existe en el frontend', 'red');
    print('   El frontend no está configurado correctamente', 'red');
    return false;
  }
  
  print('\n📦 Paso 1: Instalando dependencias...', 'green');
  if (!executeCommand('npm install')) {
    print('❌ Falló la instalación de dependencias', 'red');
    return false;
  }
  
  print('\n🚀 Paso 2: Iniciando servidor de desarrollo...', 'green');
  print('🌐 La interfaz se abrirá en: http://localhost:4200', 'blue');
  print('⏳ Espera unos segundos...', 'yellow');
  
  // Iniciar el servidor de desarrollo
  try {
    const child = spawn('npm', ['start'], {
      cwd: FRONTEND_DIR,
      stdio: 'inherit',
      shell: true
    });
    
    child.on('error', (error) => {
      print(`❌ Error iniciando el servidor: ${error.message}`, 'red');
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        print(`❌ El servidor se cerró con código: ${code}`, 'red');
      }
    });
    
    // Esperar un poco y abrir el navegador
    setTimeout(() => {
      print('\n🌐 Abriendo navegador...', 'green');
      try {
        // Intentar abrir el navegador
        const platform = process.platform;
        let command;
        
        if (platform === 'win32') {
          command = 'start http://localhost:4200';
        } else if (platform === 'darwin') {
          command = 'open http://localhost:4200';
        } else {
          command = 'xdg-open http://localhost:4200';
        }
        
        execSync(command, { stdio: 'ignore' });
        print('✅ Navegador abierto', 'green');
      } catch (error) {
        print('⚠️  No se pudo abrir el navegador automáticamente', 'yellow');
        print('   Abre manualmente: http://localhost:4200', 'blue');
      }
    }, 5000);
    
  } catch (error) {
    print(`❌ Error: ${error.message}`, 'red');
    return false;
  }
  
  return true;
}

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  openFrontend();
}

module.exports = { openFrontend }; 