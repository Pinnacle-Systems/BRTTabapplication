import { Router } from "express";
const router = Router();
import {

  getFoldingPending,
  getFoldingPendingById,
  updateFolding,
} from "../../services/BRTTabService/foldingPending.services.js";

router.get("/", getFoldingPending);

router.get("/:foldingId", getFoldingPendingById);

router.put("/", updateFolding);



export default router;
