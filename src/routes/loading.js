import { Router } from 'express';

const router = Router();

import { updateLoadingDetail, get } from "../services/loading.service.js"

router.get('/', get);

router.put('/', updateLoadingDetail);


export default router; 