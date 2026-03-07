import { Router } from "express";
const router = Router();
import {

  getFoldingPending,
  getFoldingPendingById,
  getPieceAgainstLotNo,
} from "../../services/BRTTabService/pieceFoldingEntry.services.js";

router.get("/", getFoldingPending);

router.get("/:pieceId", getFoldingPendingById);

router.get("/:lotNo/getPiece", getPieceAgainstLotNo);



export default router;
