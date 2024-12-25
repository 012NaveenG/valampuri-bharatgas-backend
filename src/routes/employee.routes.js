import { Router } from "express";
import {
  CreateOpeningDetails,
  deliverCylinderToCustomer,
  getAreasAndTrucks,
  getTodaysAllDeliveries,
  getTodaysOpeningData,
  loginEmployee,
  logoutEmployee,
} from "../controllers/employee.controller.js";

const router = Router();

router.route("/login").post(loginEmployee);
router.route("/logout").get(logoutEmployee);
router.route("/areas-trucks").get(getAreasAndTrucks);
router.route("/opening-details").post(CreateOpeningDetails);
router.route("/opening-details/:emp_id").get(getTodaysOpeningData);
router.route("/delivery").post(deliverCylinderToCustomer);
router.route("/delivery/:emp_id").get(getTodaysAllDeliveries);


export default router;
