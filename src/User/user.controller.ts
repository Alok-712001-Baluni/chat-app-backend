import express, { Request, Response, NextFunction } from "express";
import { IRequest } from "../Common/common.interface";
import { registerUser, authUser, allUsers } from "./user.service";
import { protect } from "../Middleware/index";

const router = express.Router();

router.route("/").post(registerUser).get(protect as any, allUsers as any); // Both request supported on the same route
router.post("/login", authUser);

export default router;
