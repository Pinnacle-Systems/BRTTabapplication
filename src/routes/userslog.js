import { Router } from 'express';
const router = Router();
import { get } from "../services/userlog.service.js";

router.get('/', get);

export default router;