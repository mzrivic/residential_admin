import { Router } from 'express';
import { PermissionController } from '../../infrastructure/controllers/permission.controller';
// import { authMiddleware, requirePermission } from '../../../../shared/middleware/auth.middleware';

const router = Router();
const permissionController = new PermissionController();

// Rutas de permisos (temporalmente sin autenticación para pruebas)
router.post('/', (req, res) => permissionController.create(req, res));
router.get('/', (req, res) => permissionController.findAll(req, res));
router.get('/:id', (req, res) => permissionController.findOne(req, res));
router.put('/:id', (req, res) => permissionController.update(req, res));
router.delete('/:id', (req, res) => permissionController.remove(req, res));
router.post('/:id/restore', (req, res) => permissionController.restore(req, res));

// Operaciones masivas
router.post('/bulk', (req, res) => permissionController.bulkCreate(req, res));
router.put('/bulk', (req, res) => permissionController.bulkUpdate(req, res));
router.delete('/bulk', (req, res) => permissionController.bulkDelete(req, res));

// Estadísticas
router.get('/stats/overview', (req, res) => permissionController.getStats(req, res));

export default router; 