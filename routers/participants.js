import dayjs from "dayjs";
import express from "express";

import { getDb } from "../db/db.js";

import { getParticipants, postParticipant } from "../controllers/participants.js";

const UPDATE_PATICIPANTS_TIME = 15000;

const router = express.Router();

router.get("/", getParticipants);
router.post("/", postParticipant);

setInterval(removerParticipantesInativos, UPDATE_PATICIPANTS_TIME);

async function removerParticipantesInativos() {
    try {
        const db = getDb();
        const collectionParticipants = db.collection("participants");
        const collectionMessages = db.collection("messages");
        const participants = await collectionParticipants.find().toArray();

        const time = Date.now();

        for (let i = 0 ; i < participants.length ; i ++) {
            const participant = participants[i];
    
            if (time - participant.lastStatus > 10000) {
                collectionParticipants.deleteOne( { name: participant.name } );
                collectionMessages.insertOne({ 
                    from: participant.name, 
                    to: 'Todos', 
                    text: 'sai da sala...', 
                    type: 'status', 
                    time: dayjs().format("HH:mm:ss") 
                })
            }
        }
    } catch (err) {
        console.error(err);
    }
}

export default router;