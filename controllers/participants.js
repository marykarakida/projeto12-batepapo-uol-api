import dayjs from "dayjs";

import { getDb } from "../db/db.js";

import { participantSchema } from "../models/participant.js";

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
    const { name } = req.body;

    try {
        const db = getDb();
        const participantsCollection = db.collection("participants");
        const messagesCollection = db.collection("messages");

        const participant = await participantsCollection.findOne({ name: name });
        
        const validation = participantSchema.validate(name, { abortEarly: false });

        if (participant) {
            res.sendStatus(409);
            return;
        }

        if (validation.error) {
            res.sendStatus(422);
            return;
        }

        await participantsCollection.insertOne({ 
            name, 
            lastStatus: Date.now() 
        });
        await messagesCollection.insertOne({ 
            from: name, 
            to: 'Todos', 
            text: 'entra na sala...', 
            type: 'status', 
            time: dayjs().format("HH:mm:ss") 
        })

        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
}