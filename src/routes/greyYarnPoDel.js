import { Router } from 'express';

import { create, get, getDelDetails, upDate, getDocId, updateIsRec } from '../services/greyYarnPoDel.service.js';

const router = Router();

router.post('/', create);

router.get('/getDocId', getDocId);

router.get('/', get);

router.get('/getDelDetails', getDelDetails)

router.put('/', upDate)

router.put('/receivePo', updateIsRec)

export default router;