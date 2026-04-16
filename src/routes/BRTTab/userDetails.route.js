import { Router } from "express";
const router = Router();
import { getActiveWorkersAndTables } from "../../services/BRTTabService/userDetails.service.js";

router.get("/tableandlot/activeWorkersAndTables", getActiveWorkersAndTables);

export default router;
