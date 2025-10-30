import { Router } from "express";
import { validateData } from "../middlewares/validation.middleware";
import { loginSchema, registrationSchema } from "../schema/user.schema";
import { getProfile, loginUser, logoutUser, registerUser } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
const router = Router()

router.post('/register' , validateData(registrationSchema) , registerUser)
router.post('/login' , validateData(loginSchema) , loginUser)
router.post('/logout' , authenticate , logoutUser)
router.get('/profile' , authenticate , getProfile)

export default router;