import { Router } from 'express';

const router = Router();

import {  get } from "../services/contractor.service.js"

router.get('/', get);



export default router; 