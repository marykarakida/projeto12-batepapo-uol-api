import express from "express";

import { postStatus } from "../controllers/status.js";

const router = express.Router();

router.post("/", postStatus);

export default router;