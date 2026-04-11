import { Router } from 'express';
const router = Router();
import { getBarCodeData,get,getLotDetails,update ,getOne} from "../../services/BRTTabService/packingSlip.route.js";

router.get('/:barCode/getBarCodeDetails', getBarCodeData);
router.get('/:selectedLotId/lotReceiptDetails', getLotDetails);
router.put('/:selectedLotId/:selectedGridId', update);
router.get('/', get);
router.get('/:selectedLotId/:selectedGridId',getOne);



export default router;