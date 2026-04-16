import { Router } from "express";
const router = Router();
import {
  getLotNo,
  getPieces,
  getLotDetails,
  getDefects,
  updateDefectEntry,
  getExistingDefectEntry,
  getSavedLots,
  getSavedPieces,
} from "../../services/BRTTabService/DefectEntry.service.js";

router.get("/getLotNo", getLotNo);
router.get("/:lotId/getPiece", getPieces);
router.get("/:pieceId/getLotDetails", getLotDetails);
router.get("/getDefects", getDefects);
router.put("/update/:lotId", updateDefectEntry);
router.get("/:lotId/:pieceId/getDefectDetails", getExistingDefectEntry);
router.get("/savedLots", getSavedLots);
router.get("/savedPieces/:lotId", getSavedPieces);

export default router;
