import { Router } from "express";
const router = Router();
import {
  getLotNo,
  getFoldingDetailsByLot,
  updatePieceVerification,
  deleteFoldingItem,
} from "../../services/BRTTabService/PieceVerification.service.js";

router.get("/getLotNo", getLotNo);
router.get("/:lotNo/getFold", getFoldingDetailsByLot);
router.put("/update/:lotNo", updatePieceVerification);
router.delete("/deleteFoldingItem", deleteFoldingItem);

export default router;
