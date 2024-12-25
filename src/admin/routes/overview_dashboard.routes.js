import { Router } from "express";
import { overview } from "../controller/overview_dashboard.controller.js";


const router = Router()

router.route('').get(overview)


export default router