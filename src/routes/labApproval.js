import { Router } from 'express';

const router = Router();

import { approve, createAllocation, createAllocationEntry, createApprovalSts, deleteAllocation, get, getAfter, getItem, getMachineAllocation, getMachineMast } from "../services/labApproval.service.js"

router.get('/', get);

router.get('/getItem', getItem)

router.patch('/approvePo', approve);

router.get('/machineMast', getMachineMast);

router.get('/machineAllocation', getMachineAllocation)

router.post('/createAlloca', createAllocation)

router.get('/afterProData', getAfter)

router.post('/createApprovalSts', createApprovalSts)

router.post('/createAllocationEntry', createAllocationEntry)

router.patch('/deleteAllocation', deleteAllocation)

export default router; 