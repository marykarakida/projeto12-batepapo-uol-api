import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectToDb } from "./db/db.js";

import participantsRouter from "./routers/participants.js";
import messagesRouter from "./routers/messages.js";
import statusRouter from "./routers/status.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/participants", participantsRouter);
app.use("/messages", messagesRouter);
app.use("/status", statusRouter);

dotenv.config();

connectToDb(() => {
    app.listen(process.env.PORT, () => {
        console.log("Listening on port", process.env.PORT);
    });
});