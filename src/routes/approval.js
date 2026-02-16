import { Router } from 'express';

const router = Router();

import { updateUnLoadingDetail, get } from "../services/approval.service.js"

router.get('/', get);

router.put('/', updateUnLoadingDetail);


export default router; 