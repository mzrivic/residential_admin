import { Router } from 'express';
import { PersonController } from '../../infrastructure/controllers/person.controller';
import { PersonService } from '../../application/services/person.service';

const router = Router();
const personService = new PersonService();
const personController = new PersonController(personService);

// Rutas principales de personas
router.post('/', (req, res) => personController.create(req, res));
router.get('/', (req, res) => personController.findAll(req, res));
router.get('/:id', (req, res) => personController.findOne(req, res));
router.put('/:id', (req, res) => personController.update(req, res));
router.put('/:id/partial', (req, res) => personController.updatePartial(req, res));
router.delete('/:id', (req, res) => personController.remove(req, res));
router.post('/:id/restore', (req, res) => personController.restore(req, res));

// Rutas de búsqueda y utilidades
router.get('/search/autocomplete', (req, res) => personController.autocomplete(req, res));
router.get('/stats/overview', (req, res) => personController.getStats(req, res));
router.post('/validate', (req, res) => personController.validate(req, res));
router.get('/duplicates/check', (req, res) => personController.checkDuplicates(req, res));

export default router; 