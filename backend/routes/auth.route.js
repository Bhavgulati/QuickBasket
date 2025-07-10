//file name is auth.route.js as a common convention for route files

import express from "express";
import {ping ,login,logout,refreshToken,signup} from "../controllers/auth.controller.js";
const router = express.Router();

router.get("/ping",ping);

router.post("/signup", signup);


router.post("/login", login);


router.post("/logout", logout);

router.post("/refresh-token",refreshToken);


export default router;

