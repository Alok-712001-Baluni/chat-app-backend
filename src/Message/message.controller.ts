import express, { Request, Response, NextFunction } from "express";
import { IRequest } from "../Common/common.interface";
import {
    sendMessage,
    allMessages,
} from "./message.service";

import { protect } from "../Middleware";

const router = express.Router();

router.route("/").post(protect as any, sendMessage as any);
router.route("/:chatId").get(protect as any, allMessages as any); // Fetch all messages for a single chat

export default router;
