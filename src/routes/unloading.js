import { Router } from 'express';

const router = Router();

import { updateUnLoadingDetail, get } from "../services/unloading.service.js"

router.get('/', get);

router.put('/', updateUnLoadingDetail);


export default router; 