import { Router } from "express";
import { googleOAuthHandler } from "../controllers/sessionController";

const router = Router();

router.get("/oauth/google", googleOAuthHandler);
    

export default router;