import { Router } from "express";
const router = Router();
import {
  getLotNo,
  getSetNo,
  get,
  update,
  getOne,
  getLoomAndWeaver,
} from "../../services/BRTTabService/pieceReceipt.service.js";

router.get("/getLot", getLotNo);
router.get("/:selectedLotId/getSetNo", getSetNo);
router.get("/:selectedLotId/:selectedGridId", getOne);

router.put("/:selectedLotId/:selectedGridId", update);
router.get("/", get);
router.get("/:lotId/:pcno/loomWeaver", getLoomAndWeaver);

export default router;
