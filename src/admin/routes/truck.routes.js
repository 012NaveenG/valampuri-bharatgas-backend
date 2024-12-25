import { Router } from "express";
import {
  addTruck,
  deleteTruck,
  getAllTrucks,
  getTruckById,
  updateTruck,
} from "../controller/truck.controller.js";

const router = Router();

router.route("").post(addTruck);
router.route("").put(updateTruck);
router.route("").delete(deleteTruck);
router.route("/all-trucks").get(getAllTrucks);
router.route("/:truck_id").get(getTruckById);

export default router;
