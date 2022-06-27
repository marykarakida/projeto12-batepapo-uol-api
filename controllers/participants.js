import dayjs from "dayjs";

import { getDb } from "../db/db.js";

import { stripHTMLFromParticipant } from "../services/sanitization.js";
import { validateParticipant } from "../services/validation.js";

const UPDATE_PATICIPANTS_TIME = 15000;

export async function getParticipants(req, res) {
    try {
        const db = getDb();
        const participantsCollection = db.collection("participants");
        const participants = await participantsCollection.find().toArray();

        res.send(participants);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};

export async function postParticipant (req, res) {
    const { name } = stripHTMLFromParticipant({ ...req.body });

    const participant = { name };

    try {
        const db = getDb();
        const participantsCollection = db.collection("participants");
        const messagesCollection = db.collection("messages");

        const sameNameParticipant = await participantsCollection.findOne({ name });
        const participantValidation = validateParticipant(participant);

        if (sameNameParticipant) {
            res.status(409).send("User already exists");
            return;
        };
        if (participantValidation.error) {
            res.status(422).send("Invalid format");
            return;
        };

        const newParticipant = {
            ...participant,
            lastStatus: Date.now() 
        };
        const newMessage = {
            from: name, 
            to: 'Todos', 
            text: 'entra na sala...', 
            type: 'status', 
            time: dayjs().format("HH:mm:ss") 
        }

        await participantsCollection.insertOne(newParticipant);
        await messagesCollection.insertOne(newMessage);

        res.status(201).send(newParticipant);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

setInterval(removeOfflineParticipants, UPDATE_PATICIPANTS_TIME);

async function removeOfflineParticipants() {
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
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
}