import { Router } from "express";
import { askQuestion, getMessages } from "../controllers/message.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = Router();
router.post('/ask', authenticate, askQuestion);
router.get('/', authenticate, getMessages);
export default router;
