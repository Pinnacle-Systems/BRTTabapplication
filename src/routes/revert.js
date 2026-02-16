import { Router } from 'express';

const router = Router();

import { updateRevertDetail, get } from "../services/revert.service.js"

router.get('/', get);

router.put('/', updateRevertDetail);


export default router; 