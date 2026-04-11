import { Router } from "express";
const router = Router();
import {
  getLotNo,
  get,
  getLotDetails,
  update,
  getOne,
  getLoomAndWeaver,
} from "../../services/BRTTabService/pieceReceipt.service.js";

router.get("/getLot", getLotNo);
router.get("/:selectedLotId/lotReceiptDetails", getLotDetails);
router.put("/:selectedLotId/:selectedGridId", update);
router.get("/", get);
router.get("/:selectedLotId/:selectedGridId", getOne);
router.get("/:lotId/:pcno/loomWeaver", getLoomAndWeaver);

export default router;
