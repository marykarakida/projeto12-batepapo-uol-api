import cors from "cors";
import dayjs from "dayjs";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

let db;
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
mongoClient.connect().then(() => {
	db = mongoClient.db("bate_papo_uol");
});

const UPDATE_PATICIPANTS_TIME = 15000;

app.post("/participants", async (req, res) => {
    const { name } = req.body;

    try {
        const dbParticipants = db.collection("participants");
        const dbMessages = db.collection("messages");

        // validate format using joi

        const participant = await dbParticipants.findOne({ name: name });

        if (participant) {
            res.sendStatus(409);
            return;
        }

        await dbParticipants.insertOne({ 
            name, 
            lastStatus: Date.now() 
        });
        await dbMessages.insertOne({ 
            from: name, 
            to: 'Todos', 
            text: 'entra na sala...', 
            type: 'status', 
            time: dayjs().format("HH:mm:ss") 
        })

        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }

});

app.get("/participants", async (req, res) => {
    try {
        const dbParticipants = db.collection("participants");
        const participants = await dbParticipants.find().toArray();

        res.send(participants);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post("/messages", async (req, res) => {
    const { user } = req.headers;
    const { to, text, type} = req.body;

    try {
        const dbMessages = db.collection("messages");

        // validate format using joi

        await dbMessages.insertOne({ 
            from: user, 
            to, 
            text, 
            type, 
            time: dayjs().format("HH:mm:ss") 
        });

        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }

});

app.get("/messages", async (req, res) => {
    const { limit } = req.query;
    const { user } = req.headers;

    const start = Number(limit) * (-1);

    try {
        const dbMessages = db.collection("messages");
        const messages = await dbMessages.find().toArray();

        const allowedMessages = messages.filter(message => {
            const isNotPrivateMessageFromUser = message.type === "private_message" && message.from !== user;
            const isNotPrivateMessageToUser = message.type === "private_message" && message.to !== user;
            
            return (!isNotPrivateMessageFromUser || !isNotPrivateMessageToUser);
        }).slice(start);

        res.send(allowedMessages);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post("/status", async (req, res) => {
    const { user } = req.headers;

    try {
        const dbParticipants = db.collection("participants");
        const participant = await dbParticipants.findOne({ name: user });

        if (!participant) {
            res.sendStatus(404);
            return;
        }

        await dbParticipants.updateOne(
            { name: user }, 
            { 
                $set: { lastStatus: Date.now() }
            }
        )

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT, () => {
    console.log("Listening on port", process.env.PORT);
});

setInterval(removerParticipantesInativos, UPDATE_PATICIPANTS_TIME);

async function removerParticipantesInativos() {
    const time = Date.now();

    const dbParticipants = db.collection("participants");
    const dbMessages = db.collection("messages");

    const participants = await dbParticipants.find().toArray();

    for (let i = 0 ; i < participants.length ; i ++) {
        const participant = participants[i];

        if (time - participant.lastStatus > 10000) {
            dbParticipants.deleteOne( { name: participant.name } );
            dbMessages.insertOne({ 
                from: participant.name, 
                to: 'Todos', 
                text: 'sai da sala...', 
                type: 'status', 
                time: dayjs().format("HH:mm:ss") 
            })
        }
    }
}