import express from "express";

import { getMessages, postMessage, editMessage, deleteMessage } from "../controllers/messages.js";

const router = express.Router();

router.get("/", getMessages);
router.post("/", postMessage);
router.put("/:ID", editMessage);
router.delete("/:ID", deleteMessage);

export default router;