import { Router } from "express";
const router = Router();
import {
  getFoldingPending,
  getFoldingPendingById,
  getPieceAgainstLotNo,
  updateFoldingEntry,
} from "../../services/BRTTabService/pieceFoldingEntry.services.js";

router.get("/", getFoldingPending);
router.get("/:lotNo/getPiece", getPieceAgainstLotNo);
router.get("/:pieceId", getFoldingPendingById);

router.put("/:selectedLotNo/updatePieceFolding", updateFoldingEntry);

export default router;
