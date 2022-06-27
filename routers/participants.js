import express from "express";

import { getParticipants, postParticipant } from "../controllers/participants.js";

const router = express.Router();

router.get("/", getParticipants);
router.post("/", postParticipant);

export default router;