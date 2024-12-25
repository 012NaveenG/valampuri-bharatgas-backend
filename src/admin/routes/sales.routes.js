import { Router } from "express";
import { getAllSalesOfLastDays, getSalesReportFromDtToDt } from "../controller/sales.controller.js";

const router = Router()

router.route("").get(getAllSalesOfLastDays)
router.route("/report").get(getSalesReportFromDtToDt)



export default router