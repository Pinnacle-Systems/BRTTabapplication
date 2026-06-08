import { Router } from "express";
const router = Router();
import {
  getBarCodeData,
  getCurrentFinyear,
} from "../../services/BRTTabService/packingSlip.service.js";

router.get("/:barCode/getBarCodeDetails", getBarCodeData);
router.get("/getCurrentFinyear", getCurrentFinyear);

export default router;
