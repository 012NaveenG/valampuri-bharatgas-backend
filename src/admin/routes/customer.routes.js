import { Router } from "express";
import {
  addCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../controller/customer.controller.js";

const router = Router();

router.route("").post(addCustomer);
router.route("").put(updateCustomer);
router.route("/:cust_id").delete(deleteCustomer);
router.route("").get(getCustomers);
router.route("/:cust_id").get(getCustomerById);

export default router;
