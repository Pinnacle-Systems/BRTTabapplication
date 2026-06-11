import { Router } from "express";
const router = Router();
import {
  getBarCodeData,
  getCurrentFinyear,
  getCloth,
  getGrade,
} from "../../services/BRTTabService/packingSlip.service.js";

router.get("/:barCode/getBarCodeDetails", getBarCodeData);
router.get("/getCurrentFinyear", getCurrentFinyear);
router.get("/:companyName/getCloth", getCloth);
router.get("/:companyName/:clothName/getGrade", getCloth);

export default router;
