import { Router } from 'express';
const router = Router();
import { login, create, get, remove, getOne,getRoles,createRole,update,updateRole } from "../services/user.service.js";
import { authenticateRequest } from '../utils/auth.js';

router.post('/login', login);
router.use(authenticateRequest)
router.post('/', create);
router.post('/role', createRole);

router.get('/', get);
router.get('/getroles', getRoles);

router.get('/userDetails', getOne)
// router.get('/getUserDet', getUserDet)

router.delete('/', remove)
router.put("/:userId/updateUser", update);
router.put("/:roleId/updateRole", updateRole);
// router.put('/', put)

export default router;