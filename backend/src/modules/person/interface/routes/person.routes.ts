import { Router } from 'express';
import { PersonController } from '../../infrastructure/controllers/person.controller';
import { BulkPersonController } from '../../infrastructure/controllers/bulk-person.controller';
import { PersonService } from '../../application/services/person.service';

const router = Router();
const personService = new PersonService();
const personController = new PersonController(personService);
const bulkPersonController = new BulkPersonController();

// Operaciones Masivas (DEBE IR ANTES que las rutas con parámetros)
router.post('/bulk', (req, res) => bulkPersonController.bulkCreate(req, res));
router.put('/bulk', (req, res) => bulkPersonController.bulkUpdate(req, res));
router.delete('/bulk', (req, res) => bulkPersonController.bulkDelete(req, res));
router.post('/import', (req, res) => bulkPersonController.importFromCSV(req, res));
router.get('/export', (req, res) => bulkPersonController.exportToCSV(req, res));
router.post('/bulk-roles', (req, res) => bulkPersonController.bulkAssignRoles(req, res));

// Validación y Verificación (sin parámetros)
router.post('/validate', (req, res) => personController.validate(req, res));
router.post('/bulk-validate', (req, res) => bulkPersonController.bulkValidate(req, res));
router.get('/duplicates/check', (req, res) => personController.checkDuplicates(req, res));

// Búsqueda y Filtros (sin parámetros)
router.get('/search/autocomplete', (req, res) => personController.autocomplete(req, res));
router.get('/search/advanced', (req, res) => personController.advancedSearch(req, res));
router.get('/filters/available', (req, res) => personController.getAvailableFilters(req, res));

// Reportes y Estadísticas (sin parámetros)
router.get('/stats/overview', (req, res) => personController.getStats(req, res));
router.get('/stats/by-role', (req, res) => personController.getStatsByRole(req, res));
router.get('/stats/by-status', (req, res) => personController.getStatsByStatus(req, res));
router.get('/stats/reports', (req, res) => personController.getReports(req, res));

// Rutas principales de personas
router.post('/', (req, res) => personController.create(req, res));
router.get('/', (req, res) => personController.findAll(req, res));
router.get('/:id', (req, res) => personController.findOne(req, res));
router.put('/:id', (req, res) => personController.update(req, res));
router.put('/:id/partial', (req, res) => personController.updatePartial(req, res));
router.delete('/:id', (req, res) => personController.remove(req, res));
router.post('/:id/restore', (req, res) => personController.restore(req, res));

// Validación y Verificación (con parámetros)
router.post('/:id/verify', (req, res) => personController.verifyUser(req, res));
router.post('/:id/verify-email', (req, res) => personController.verifyEmail(req, res));
router.post('/:id/verify-phone', (req, res) => personController.verifyPhone(req, res));

// Auditoría
router.get('/:id/audit', (req, res) => personController.getAuditHistory(req, res));

// Gestión de Archivos
router.post('/:id/photo', (req, res) => personController.uploadPhoto(req, res));
router.delete('/:id/photo', (req, res) => personController.deletePhoto(req, res));
router.post('/:id/documents', (req, res) => personController.uploadDocuments(req, res));
router.get('/:id/documents', (req, res) => personController.listDocuments(req, res));
router.delete('/:id/documents/:docId', (req, res) => personController.deleteDocument(req, res));

// Gestión de Roles
router.get('/:id/roles', (req, res) => personController.getUserRoles(req, res));
router.post('/:id/roles', (req, res) => personController.assignRole(req, res));
router.put('/:id/roles/:roleId', (req, res) => personController.updateRole(req, res));
router.delete('/:id/roles/:roleId', (req, res) => personController.removeRole(req, res));
router.post('/bulk-roles', (req, res) => bulkPersonController.bulkAssignRoles(req, res));

export default router; 