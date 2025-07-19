import { Router } from 'express';
import { AuthController } from '../../infrastructure/controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Rutas de autenticación
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

// Rutas protegidas (requieren autenticación)
router.post('/change-password', (req, res) => authController.changePassword(req, res));
router.get('/me', (req, res) => authController.me(req, res)); // Temporalmente sin middleware

// Rutas de recuperación de contraseña
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router; 