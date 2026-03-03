import { Router } from "express";
const router = Router();
import {
  getLotNo,
  getPieces,
  getLotDetails,
  getDefects,
} from "../../services/BRTTabService/DefectEntry.service.js";

router.get("/getLotNo", getLotNo);
router.get("/:lotId/getPiece", getPieces);
router.get("/:pieceId/getLotDetails", getLotDetails);
router.get("/getDefects", getDefects);

export default router;
