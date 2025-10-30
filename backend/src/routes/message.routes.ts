import { Router } from "express";
import { askQuestion } from "../controllers/message.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = Router()

router.post('/ask' , authenticate , askQuestion)

export default router;