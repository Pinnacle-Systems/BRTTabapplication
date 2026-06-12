import { Router } from "express";
const router = Router();
import {
  getDocId,
  getBarCodeData,
  getCurrentFinyear,
  getCloth,
  getGrade,
  getLoom,
  addPackingSlip,
} from "../../services/BRTTabService/packingSlip.service.js";

router.get(
  "/:companyName/:clothName/:clothGrade/:barCode/getBarCodeDetails",
  getBarCodeData,
);
router.get("/:companyName/:finYear/getDocId", getDocId);
router.get("/getCurrentFinyear", getCurrentFinyear);
router.get("/:companyName/getCloth", getCloth);
router.get("/:companyName/:clothName/getGrade", getGrade);
router.get("/getLoomData", getLoom);
router.post("/", addPackingSlip);

export default router;
