import { Router } from 'express';

const router = Router();

import { InsertStopDetail,get } from "../services/StopDetail.service.js"

router.get('/', get);
router.put('/', InsertStopDetail);


export default router; 