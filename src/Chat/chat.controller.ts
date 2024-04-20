import express from "express";
import {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    leaveGroup,
    addToGroup,
    removeFromGroup,
} from "./chat.service";
import { protect } from "../Middleware";

const router = express.Router();

// Only logged in user can access the below routes
router.route("/").post(protect as any, accessChat as any).get(protect as any, fetchChats as any); // Both requests work on same route
router.route("/group").post(protect as any, createGroupChat as any); // Create group chat
router.route("/rename").put(protect as any, renameGroup as any); // Rename group chat
router.route("/groupadd").put(protect as any, addToGroup as any); // Add someone to the group
router.route("/groupremove").put(protect as any, removeFromGroup as any); // Remove someone or leave the group
router.route("/groupleave").put(protect as any, leaveGroup as any); // Remove someone or leave the group

export default router;
