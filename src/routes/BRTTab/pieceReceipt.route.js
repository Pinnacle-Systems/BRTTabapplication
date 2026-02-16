import { Router } from 'express';
const router = Router();
import { getLotNo,get,getLotDetails,update ,getOne} from "../../services/BRTTabService/pieceReceipt.service.js";

router.get('/getLot', getLotNo);
router.get('/:selectedLotId/lotReceiptDetails', getLotDetails);
router.put('/:selectedLotId/:selectedGridId', update);
router.get('/', get);
router.get('/:selectedLotId/:selectedGridId',getOne);



export default router;