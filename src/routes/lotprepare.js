import { Router } from 'express';

const router = Router();

import { updateLotDetail, get,getPrepareDet } from "../services/lotApproval.service.js"

router.get('/', get);
router.get('/prepare', getPrepareDet);


router.put('/', updateLotDetail);


export default router; 