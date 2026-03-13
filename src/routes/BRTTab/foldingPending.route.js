import { Router } from "express";
const router = Router();
import {

  getFoldingPending,
  getFoldingPendingById,
  getGradeData,
  updateFolding,getDefectsById
} from "../../services/BRTTabService/foldingPending.services.js";

router.get("/", getFoldingPending);

router.get("/getGrade", getGradeData);

router.get("/:lotNo", getFoldingPendingById);
router.get("/:subGridId/getDefects", getDefectsById);

router.put("/", updateFolding);


    // console.log("getGrdaeData")

export default router;
