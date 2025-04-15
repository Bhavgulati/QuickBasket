//file name is auth.route.js as a common convention for route files

import express from "express";
import {login,logout,signup} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", signup);


router.get("/login", login);


router.get("/logout", logout);


export default router;

