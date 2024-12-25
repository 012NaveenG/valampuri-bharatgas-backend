import { Router } from "express";
import {
  addEmployee,
  deleteEmployee,
  getAllEmployee,
  getEmpById,
  updateEmployee,
} from "../controller/employee.controller.js";

const router = Router();

router.route("").post(addEmployee);
router.route("").put(updateEmployee);
router.route("/emp_id").delete(deleteEmployee);
router.route("").get(getAllEmployee);
router.route("/:emp_id").get(getEmpById);

export default router;
