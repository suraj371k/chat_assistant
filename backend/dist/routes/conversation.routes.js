import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getAllConversation } from "../controllers/conversation.controller.js";
const router = Router();
router.get('/', authenticate, getAllConversation);
export default router;
