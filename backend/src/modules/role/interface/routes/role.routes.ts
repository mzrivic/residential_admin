import { Router } from 'express';
import { RoleController } from '../../infrastructure/controllers/role.controller';
// import { authMiddleware, requirePermission } from '../../../../shared/middleware/auth.middleware';

const router = Router();
const roleController = new RoleController();

// Rutas de roles (temporalmente sin autenticación para pruebas)
router.post('/', (req, res) => roleController.create(req, res));
router.get('/', (req, res) => roleController.findAll(req, res));
router.get('/:id', (req, res) => roleController.findOne(req, res));
router.put('/:id', (req, res) => roleController.update(req, res));
router.delete('/:id', (req, res) => roleController.remove(req, res));
router.post('/:id/restore', (req, res) => roleController.restore(req, res));

// Gestión de permisos
router.post('/:id/permissions', (req, res) => roleController.assignPermissions(req, res));
router.get('/:id/permissions', (req, res) => roleController.getPermissions(req, res));
router.delete('/:id/permissions', (req, res) => roleController.removePermissions(req, res));

// Operaciones masivas
router.post('/bulk', (req, res) => roleController.bulkCreate(req, res));
router.put('/bulk', (req, res) => roleController.bulkUpdate(req, res));
router.delete('/bulk', (req, res) => roleController.bulkDelete(req, res));

// Estadísticas
router.get('/stats/overview', (req, res) => roleController.getStats(req, res));

export default router; 