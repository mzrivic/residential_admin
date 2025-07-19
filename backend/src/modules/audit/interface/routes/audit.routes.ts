import { Router } from 'express';
import { AuditController } from '../../infrastructure/controllers/audit.controller';
// import { authMiddleware, requirePermission } from '../../../../shared/middleware/auth.middleware';

const router = Router();
const auditController = new AuditController();

// Rutas de auditoría (temporalmente sin autenticación para pruebas)
router.get('/history/:table/:id', (req, res) => auditController.getAuditHistory(req, res));
router.get('/logs', (req, res) => auditController.getAuditLogs(req, res));
router.get('/stats', (req, res) => auditController.getAuditStats(req, res));
router.get('/export', (req, res) => auditController.exportAuditLogs(req, res));
router.delete('/clean', (req, res) => auditController.cleanOldAuditLogs(req, res));
router.get('/summary/:table/:id/:operation', (req, res) => auditController.getChangeSummary(req, res));
router.get('/user/:userId/activity', (req, res) => auditController.getUserActivity(req, res));

export default router; 