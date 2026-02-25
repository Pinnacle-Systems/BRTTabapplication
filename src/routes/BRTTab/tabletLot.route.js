import { Router } from 'express';
const router = Router();
import { getTables,getLotNo,getClothName,getPieces,getCheckingSection,update} from "../../services/BRTTabService/TableLot.service.js";

router.get('/getTable', getTables);
router.get('/getLotNo', getLotNo);
router.get('/getCheckingSection', getCheckingSection);
router.get('/:selectedLotNo/getCloth', getClothName);
router.get('/:lotCheckingNoId/:selectedLotNo/:selectedClothId/getPiece', getPieces);
router.put('/:selectedNonGridId/:selectedGridId', update);




export default router;